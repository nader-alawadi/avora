import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { requireAnthropicClient } from "@/lib/anthropic-client";

export async function POST(req: NextRequest) {
  try { await requireAuth(); } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let client;
  try {
    client = requireAnthropicClient();
  } catch {
    console.error("[ai-generate] ANTHROPIC_API_KEY is missing or is a placeholder");
    return NextResponse.json({ error: "AI_NOT_CONFIGURED" }, { status: 503 });
  }

  const { field, context, lang } = await req.json();
  const isAr = lang === "ar";

  const systemPrompt = isAr
    ? "أنت مساعد متخصص في استراتيجيات المبيعات والتسويق B2B. اكتب إجابات موجزة ومهنية باللغة العربية."
    : "You are a B2B sales and marketing strategy expert. Write concise, professional responses in English.";

  const fieldPrompts: Record<string, (ctx: Record<string, string>) => string> = {
    description: (c) => isAr
      ? `بناءً على هذه المعلومات: ${JSON.stringify(c)}\nاكتب وصفاً موجزاً للمنتج/الخدمة في جملتين (حد أقصى 200 حرف).`
      : `Based on this context: ${JSON.stringify(c)}\nWrite a concise 2-sentence product/service description (max 200 chars).`,

    biggestPain: (c) => isAr
      ? `بناءً على هذه المعلومات: ${JSON.stringify(c)}\nاكتب جملة واحدة تصف أكبر تحدٍّ يواجه هذه الشركة في مبيعاتها.`
      : `Based on this context: ${JSON.stringify(c)}\nWrite one sentence describing the biggest sales challenge for this company.`,

    jobTitles: (c) => isAr
      ? `بناءً على هذه المعلومات: ${JSON.stringify(c)}\nاكتب قائمة بالمسمّيات الوظيفية للعملاء المستهدفين (مفصولة بفواصل).`
      : `Based on this context: ${JSON.stringify(c)}\nList job titles of ideal target prospects (comma-separated).`,

    disqualifiers: (c) => isAr
      ? `بناءً على هذه المعلومات: ${JSON.stringify(c)}\nاكتب معايير استبعاد العملاء غير المناسبين (2-3 جمل).`
      : `Based on this context: ${JSON.stringify(c)}\nWrite 2-3 sentences describing what disqualifies a prospect.`,

    bestResult: (c) => isAr
      ? `بناءً على هذه المعلومات: ${JSON.stringify(c)}\nاكتب وصفاً لأفضل نتيجة حققتها لعميل (قصة نجاح موجزة).`
      : `Based on this context: ${JSON.stringify(c)}\nWrite a brief success story / best client result (2-3 sentences).`,

    competitors: (c) => isAr
      ? `بناءً على هذه المعلومات: ${JSON.stringify(c)}\nاذكر 3-5 منافسين رئيسيين محتملين في هذا السوق.`
      : `Based on this context: ${JSON.stringify(c)}\nList 3-5 likely main competitors in this market.`,

    differentiation: (c) => isAr
      ? `بناءً على هذه المعلومات: ${JSON.stringify(c)}\nاكتب ما يميّز هذه الشركة عن منافسيها (2-3 جمل).`
      : `Based on this context: ${JSON.stringify(c)}\nWrite what makes this company different from competitors (2-3 sentences).`,

    valueProposition: (c) => isAr
      ? `بناءً على هذه المعلومات: ${JSON.stringify(c)}\nاكتب عرض القيمة الرئيسي في جملة واحدة قوية.`
      : `Based on this context: ${JSON.stringify(c)}\nWrite a single powerful value proposition sentence.`,
  };

  const promptFn = fieldPrompts[field];
  if (!promptFn) return NextResponse.json({ error: "Unknown field" }, { status: 400 });

  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: "user", content: promptFn(context || {}) }],
    });

    const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
    console.log(`[ai-generate] field=${field} text_len=${text.length}`);
    return NextResponse.json({ text });
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    if (status === 401 || status === 403) {
      console.error("[ai-generate] Anthropic auth error — check ANTHROPIC_API_KEY");
      return NextResponse.json({ error: "AI_NOT_CONFIGURED" }, { status: 503 });
    }
    console.error("[ai-generate] Anthropic error:", err);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
