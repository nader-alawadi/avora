import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { requireAnthropicClient } from "@/lib/anthropic-client";

// Per-question prompt templates keyed by question key
const PROMPT_MAP: Record<string, (ctx: Record<string, string>, lang: string) => { system: string; user: string; isArray?: boolean }> = {
  industry: (ctx, lang) => ({
    system: lang === "ar" ? "أنت خبير في تحليل الأعمال." : "You are a business analyst.",
    user: lang === "ar"
      ? `بناءً على موقع الشركة ${ctx.websiteUrl || "غير محدد"} والاسم "${ctx.companyName || ""}", حدد القطاع الأنسب من: saas, consulting, marketing_agency, financial_services, healthcare, real_estate, ecommerce, manufacturing, education, telecom, energy, logistics. أجب بكلمة واحدة فقط (القيمة).`
      : `Based on the company website ${ctx.websiteUrl || "unknown"} and name "${ctx.companyName || ""}", identify the most likely industry from: saas, consulting, marketing_agency, financial_services, healthcare, real_estate, ecommerce, manufacturing, education, telecom, energy, logistics. Reply with ONLY the value word.`,
  }),

  company_stage: (ctx, lang) => ({
    system: lang === "ar" ? "أنت خبير في تحليل الأعمال." : "You are a business analyst.",
    user: lang === "ar"
      ? `بناءً على: القطاع "${ctx.industry || ""}", الموقع ${ctx.websiteUrl || ""}. حدد مرحلة الشركة من: idea, mvp, early_traction, growth, expansion, mature. أجب بكلمة واحدة فقط.`
      : `Based on: industry "${ctx.industry || ""}", website ${ctx.websiteUrl || ""}. Identify the company stage from: idea, mvp, early_traction, growth, expansion, mature. Reply with ONLY the value word.`,
  }),

  employee_count: (ctx, lang) => ({
    system: lang === "ar" ? "أنت خبير في تحليل الأعمال." : "You are a business analyst.",
    user: lang === "ar"
      ? `بناءً على: القطاع "${ctx.industry || ""}", المرحلة "${ctx.company_stage || ""}", الموقع ${ctx.websiteUrl || ""}. قدّر عدد الموظفين من: 1, 2-5, 6-10, 11-25, 26-50, 51-100, 101-250, 250+. أجب بالقيمة فقط.`
      : `Based on: industry "${ctx.industry || ""}", stage "${ctx.company_stage || ""}", website ${ctx.websiteUrl || ""}. Estimate employee count from: 1, 2-5, 6-10, 11-25, 26-50, 51-100, 101-250, 250+. Reply with ONLY the value.`,
  }),

  problems_solved: (ctx, lang) => ({
    system: lang === "ar" ? "أنت خبير استراتيجيات B2B." : "You are a B2B strategy expert.",
    user: lang === "ar"
      ? `بناءً على: القطاع "${ctx.industry || ""}", "${ctx.companyName || ""}", الموقع ${ctx.websiteUrl || ""}. اختر 2-4 مشاكل تحلها من: lead_gen, sales_inefficiency, low_conversion, poor_ops, lack_automation, high_costs, slow_execution, weak_reporting, customer_acquisition, retention. أجب بمصفوفة JSON فقط.`
      : `Based on: industry "${ctx.industry || ""}", "${ctx.companyName || ""}", website ${ctx.websiteUrl || ""}. Pick 2-4 problems this company likely solves from: lead_gen, sales_inefficiency, low_conversion, poor_ops, lack_automation, high_costs, slow_execution, weak_reporting, customer_acquisition, retention. Reply with ONLY a JSON array of values.`,
    isArray: true,
  }),

  revenue_model: (ctx, lang) => ({
    system: lang === "ar" ? "أنت خبير في نماذج الأعمال." : "You are a business model expert.",
    user: lang === "ar"
      ? `بناءً على: القطاع "${ctx.industry || ""}", المشاكل "${ctx.problems_solved || ""}". حدد نموذج الإيرادات الأنسب من: subscription, project, retainer, commission, one_time, usage, hybrid. أجب بكلمة واحدة فقط.`
      : `Based on: industry "${ctx.industry || ""}", problems "${ctx.problems_solved || ""}". Identify the most likely revenue model from: subscription, project, retainer, commission, one_time, usage, hybrid. Reply with ONLY the value word.`,
  }),

  deal_size: (ctx, lang) => ({
    system: lang === "ar" ? "أنت خبير مبيعات B2B." : "You are a B2B sales expert.",
    user: lang === "ar"
      ? `بناءً على: القطاع "${ctx.industry || ""}", نموذج الإيرادات "${ctx.revenue_model || ""}", المرحلة "${ctx.company_stage || ""}". قدّر حجم الصفقة من: under_1k, 1k_5k, 5k_15k, 15k_50k, 50k_100k, over_100k. أجب بالقيمة فقط.`
      : `Based on: industry "${ctx.industry || ""}", revenue model "${ctx.revenue_model || ""}", stage "${ctx.company_stage || ""}". Estimate average deal size from: under_1k, 1k_5k, 5k_15k, 15k_50k, 50k_100k, over_100k. Reply with ONLY the value.`,
  }),

  sales_cycle: (ctx, lang) => ({
    system: lang === "ar" ? "أنت خبير مبيعات B2B." : "You are a B2B sales expert.",
    user: lang === "ar"
      ? `بناءً على: القطاع "${ctx.industry || ""}", حجم الصفقة "${ctx.deal_size || ""}". قدّر دورة المبيعات من: under_1w, 1_2w, 2_4w, 1_3m, 3_6m, over_6m. أجب بالقيمة فقط.`
      : `Based on: industry "${ctx.industry || ""}", deal size "${ctx.deal_size || ""}". Estimate sales cycle from: under_1w, 1_2w, 2_4w, 1_3m, 3_6m, over_6m. Reply with ONLY the value.`,
  }),

  target_geography: (ctx, lang) => ({
    system: lang === "ar" ? "أنت خبير في GTM." : "You are a GTM expert.",
    user: lang === "ar"
      ? `بناءً على: "${ctx.companyName || ""}", القطاع "${ctx.industry || ""}", الموقع ${ctx.websiteUrl || ""}. اختر 1-3 مناطق مستهدفة من: gcc, mena, europe, north_america, asia_pacific, africa, latin_america, global. أجب بمصفوفة JSON فقط.`
      : `Based on: "${ctx.companyName || ""}", industry "${ctx.industry || ""}", website ${ctx.websiteUrl || ""}. Pick 1-3 target regions from: gcc, mena, europe, north_america, asia_pacific, africa, latin_america, global. Reply with ONLY a JSON array.`,
    isArray: true,
  }),

  target_company_size: (ctx, lang) => ({
    system: lang === "ar" ? "أنت خبير في GTM." : "You are a GTM expert.",
    user: lang === "ar"
      ? `بناءً على: القطاع "${ctx.industry || ""}", حجم الصفقة "${ctx.deal_size || ""}". اختر 1-2 أحجام شركات مستهدفة من: startup, smb, midmarket, enterprise. أجب بمصفوفة JSON فقط.`
      : `Based on: industry "${ctx.industry || ""}", deal size "${ctx.deal_size || ""}". Pick 1-2 target company sizes from: startup, smb, midmarket, enterprise. Reply with ONLY a JSON array.`,
    isArray: true,
  }),

  business_focus: (ctx, lang) => ({
    system: lang === "ar" ? "أنت خبير في الأعمال." : "You are a business expert.",
    user: lang === "ar"
      ? `بناءً على: القطاع "${ctx.industry || ""}", المشاكل "${ctx.problems_solved || ""}". حدد التركيز من: b2b, b2c, both. أجب بكلمة واحدة فقط.`
      : `Based on: industry "${ctx.industry || ""}", problems "${ctx.problems_solved || ""}". Determine business focus from: b2b, b2c, both. Reply with ONLY the value.`,
  }),

  ideal_traits: (ctx, lang) => ({
    system: lang === "ar" ? "أنت خبير ICP." : "You are an ICP expert.",
    user: lang === "ar"
      ? `بناءً على: القطاع "${ctx.industry || ""}", المنطقة "${ctx.target_geography || ""}", حجم الهدف "${ctx.target_company_size || ""}". اختر 3-5 صفات مثالية من: active_sales, has_budget, growth_goals, uses_crm, expanding, hiring, running_ads, digital_mature, buying_similar. أجب بمصفوفة JSON فقط.`
      : `Based on: industry "${ctx.industry || ""}", geography "${ctx.target_geography || ""}", target size "${ctx.target_company_size || ""}". Pick 3-5 ideal traits from: active_sales, has_budget, growth_goals, uses_crm, expanding, hiring, running_ads, digital_mature, buying_similar. Reply with ONLY a JSON array.`,
    isArray: true,
  }),

  disqualifiers: (ctx, lang) => ({
    system: lang === "ar" ? "أنت خبير ICP." : "You are an ICP expert.",
    user: lang === "ar"
      ? `بناءً على: القطاع "${ctx.industry || ""}", الصفات المثالية "${ctx.ideal_traits || ""}". اختر 2-3 عوامل استبعاد من: no_budget, no_dm_access, too_small, wrong_industry, no_growth, long_procurement. أجب بمصفوفة JSON فقط.`
      : `Based on: industry "${ctx.industry || ""}", ideal traits "${ctx.ideal_traits || ""}". Pick 2-3 disqualifiers from: no_budget, no_dm_access, too_small, wrong_industry, no_growth, long_procurement. Reply with ONLY a JSON array.`,
    isArray: true,
  }),

  buying_signals: (ctx, lang) => ({
    system: lang === "ar" ? "أنت خبير مبيعات." : "You are a sales expert.",
    user: lang === "ar"
      ? `بناءً على: القطاع "${ctx.industry || ""}", الصفات المثالية "${ctx.ideal_traits || ""}". اختر 2-4 إشارات شراء من: hiring_sdrs, recently_funded, new_market, new_product, new_sales_leader, running_campaigns, digital_transform. أجب بمصفوفة JSON فقط.`
      : `Based on: industry "${ctx.industry || ""}", ideal traits "${ctx.ideal_traits || ""}". Pick 2-4 buying signals from: hiring_sdrs, recently_funded, new_market, new_product, new_sales_leader, running_campaigns, digital_transform. Reply with ONLY a JSON array.`,
    isArray: true,
  }),

  buyer_roles: (ctx, lang) => ({
    system: lang === "ar" ? "أنت خبير DMU." : "You are a DMU mapping expert.",
    user: lang === "ar"
      ? `بناءً على: القطاع "${ctx.industry || ""}", حجم الصفقة "${ctx.deal_size || ""}", حجم الهدف "${ctx.target_company_size || ""}". اختر 2-4 أدوار مشترين من: ceo, coo, cto, head_sales, head_marketing, procurement, finance, operations. أجب بمصفوفة JSON فقط.`
      : `Based on: industry "${ctx.industry || ""}", deal size "${ctx.deal_size || ""}", target size "${ctx.target_company_size || ""}". Pick 2-4 buyer roles from: ceo, coo, cto, head_sales, head_marketing, procurement, finance, operations. Reply with ONLY a JSON array.`,
    isArray: true,
  }),

  contact_method: (ctx, lang) => ({
    system: lang === "ar" ? "أنت خبير تواصل مبيعات." : "You are a sales outreach expert.",
    user: lang === "ar"
      ? `بناءً على: القطاع "${ctx.industry || ""}", أدوار المشترين "${ctx.buyer_roles || ""}", المنطقة "${ctx.target_geography || ""}". اختر 2-3 طرق تواصل من: linkedin, email, whatsapp, phone, events, referrals. أجب بمصفوفة JSON فقط.`
      : `Based on: industry "${ctx.industry || ""}", buyer roles "${ctx.buyer_roles || ""}", geography "${ctx.target_geography || ""}". Pick 2-3 contact methods from: linkedin, email, whatsapp, phone, events, referrals. Reply with ONLY a JSON array.`,
    isArray: true,
  }),

  has_sales_team: (ctx, lang) => ({
    system: lang === "ar" ? "أنت خبير أعمال." : "You are a business expert.",
    user: lang === "ar"
      ? `بناءً على: عدد الموظفين "${ctx.employee_count || ""}", المرحلة "${ctx.company_stage || ""}". هل من المرجح أن لديهم فريق مبيعات؟ أجب بـ yes أو no فقط.`
      : `Based on: employee count "${ctx.employee_count || ""}", stage "${ctx.company_stage || ""}". Is it likely they have a sales team? Reply with ONLY yes or no.`,
  }),

  sales_team_size: (ctx, lang) => ({
    system: lang === "ar" ? "أنت خبير أعمال." : "You are a business expert.",
    user: lang === "ar"
      ? `بناءً على: عدد الموظفين "${ctx.employee_count || ""}", المرحلة "${ctx.company_stage || ""}". قدّر حجم فريق المبيعات كرقم بين 0-50. أجب برقم فقط.`
      : `Based on: employee count "${ctx.employee_count || ""}", stage "${ctx.company_stage || ""}". Estimate sales team size as a number 0-50. Reply with ONLY a number.`,
  }),

  sales_problems: (ctx, lang) => ({
    system: lang === "ar" ? "أنت خبير مبيعات." : "You are a sales expert.",
    user: lang === "ar"
      ? `بناءً على: القطاع "${ctx.industry || ""}", المرحلة "${ctx.company_stage || ""}", حجم الفريق "${ctx.sales_team_size || ""}". اختر 2-4 تحديات من: weak_targeting, low_response, no_process, weak_qual, poor_followup, no_crm, low_close, no_personalization. أجب بمصفوفة JSON فقط.`
      : `Based on: industry "${ctx.industry || ""}", stage "${ctx.company_stage || ""}", team size "${ctx.sales_team_size || ""}". Pick 2-4 challenges from: weak_targeting, low_response, no_process, weak_qual, poor_followup, no_crm, low_close, no_personalization. Reply with ONLY a JSON array.`,
    isArray: true,
  }),

  channels_used: (ctx, lang) => ({
    system: lang === "ar" ? "أنت خبير GTM." : "You are a GTM expert.",
    user: lang === "ar"
      ? `بناءً على: القطاع "${ctx.industry || ""}", المنطقة "${ctx.target_geography || ""}", أدوار المشترين "${ctx.buyer_roles || ""}". اختر 3-5 قنوات من: linkedin, email, cold_calling, whatsapp, seo, google_ads, social_media, referrals, content, events, partnerships. أجب بمصفوفة JSON فقط.`
      : `Based on: industry "${ctx.industry || ""}", geography "${ctx.target_geography || ""}", buyer roles "${ctx.buyer_roles || ""}". Pick 3-5 channels from: linkedin, email, cold_calling, whatsapp, seo, google_ads, social_media, referrals, content, events, partnerships. Reply with ONLY a JSON array.`,
    isArray: true,
  }),

  best_channel: (ctx, lang) => ({
    system: lang === "ar" ? "أنت خبير GTM." : "You are a GTM expert.",
    user: lang === "ar"
      ? `بناءً على: القنوات المستخدمة "${ctx.channels_used || ""}", القطاع "${ctx.industry || ""}". حدد أفضل قناة من: linkedin, email, cold_calling, whatsapp, referrals, google_ads, social_media. أجب بكلمة واحدة فقط.`
      : `Based on: channels used "${ctx.channels_used || ""}", industry "${ctx.industry || ""}". Identify the best channel from: linkedin, email, cold_calling, whatsapp, referrals, google_ads, social_media. Reply with ONLY the value.`,
  }),

  avora_goals: (ctx, lang) => ({
    system: lang === "ar" ? "أنت مستشار GTM." : "You are a GTM advisor.",
    user: lang === "ar"
      ? `بناءً على: المشاكل "${ctx.problems_solved || ""}", تحديات المبيعات "${ctx.sales_problems || ""}". اختر 3-4 أهداف من: better_icp, more_leads, more_meetings, better_targeting, dm_access, better_outreach, revenue_growth, team_accountability. أجب بمصفوفة JSON فقط.`
      : `Based on: problems "${ctx.problems_solved || ""}", sales challenges "${ctx.sales_problems || ""}". Pick 3-4 goals from: better_icp, more_leads, more_meetings, better_targeting, dm_access, better_outreach, revenue_growth, team_accountability. Reply with ONLY a JSON array.`,
    isArray: true,
  }),

  ai_outputs: (ctx, lang) => ({
    system: lang === "ar" ? "أنت مستشار GTM." : "You are a GTM advisor.",
    user: lang === "ar"
      ? `بناءً على: الأهداف "${ctx.avora_goals || ""}", القطاع "${ctx.industry || ""}". اختر 3-5 مخرجات AI من: icp, dmu, abm, playbook, lookalike, gtm, scripts, leads. أجب بمصفوفة JSON فقط.`
      : `Based on: goals "${ctx.avora_goals || ""}", industry "${ctx.industry || ""}". Pick 3-5 AI outputs from: icp, dmu, abm, playbook, lookalike, gtm, scripts, leads. Reply with ONLY a JSON array.`,
    isArray: true,
  }),

  speed_accuracy: (ctx, lang) => ({
    system: lang === "ar" ? "أنت مستشار أعمال." : "You are a business advisor.",
    user: lang === "ar"
      ? `بناءً على: المرحلة "${ctx.company_stage || ""}", الجدول الزمني "${ctx.timeline || ""}". حدد الأولوية من: speed, accuracy, balanced. أجب بكلمة واحدة فقط.`
      : `Based on: stage "${ctx.company_stage || ""}", timeline "${ctx.timeline || ""}". Determine priority from: speed, accuracy, balanced. Reply with ONLY the value.`,
  }),

  outreach_languages: (ctx, lang) => ({
    system: lang === "ar" ? "أنت خبير تواصل." : "You are an outreach expert.",
    user: lang === "ar"
      ? `بناءً على: المنطقة "${ctx.target_geography || ""}". اختر 1-3 لغات تواصل من: english, arabic, french, spanish. أجب بمصفوفة JSON فقط.`
      : `Based on: geography "${ctx.target_geography || ""}". Pick 1-3 outreach languages from: english, arabic, french, spanish. Reply with ONLY a JSON array.`,
    isArray: true,
  }),

  timeline: (ctx, lang) => ({
    system: lang === "ar" ? "أنت مستشار أعمال." : "You are a business advisor.",
    user: lang === "ar"
      ? `بناءً على: المرحلة "${ctx.company_stage || ""}", دورة المبيعات "${ctx.sales_cycle || ""}". حدد الجدول الزمني المتوقع من: this_month, 3_months, 6_months, 1_year. أجب بكلمة واحدة فقط.`
      : `Based on: stage "${ctx.company_stage || ""}", sales cycle "${ctx.sales_cycle || ""}". Determine expected timeline from: this_month, 3_months, 6_months, 1_year. Reply with ONLY the value.`,
  }),
};

// Legacy field prompts (backwards compatibility)
const LEGACY_FIELDS: Record<string, (ctx: Record<string, string>, isAr: boolean) => string> = {
  description: (c, isAr) => isAr
    ? `بناءً على هذه المعلومات: ${JSON.stringify(c)}\nاكتب وصفاً موجزاً للمنتج/الخدمة في جملتين.`
    : `Based on this context: ${JSON.stringify(c)}\nWrite a concise 2-sentence product/service description.`,
  biggestPain: (c, isAr) => isAr
    ? `بناءً على هذه المعلومات: ${JSON.stringify(c)}\nاكتب جملة واحدة تصف أكبر تحدٍّ يواجه هذه الشركة.`
    : `Based on this context: ${JSON.stringify(c)}\nWrite one sentence describing the biggest sales challenge.`,
  valueProposition: (c, isAr) => isAr
    ? `بناءً على هذه المعلومات: ${JSON.stringify(c)}\nاكتب عرض القيمة الرئيسي في جملة واحدة.`
    : `Based on this context: ${JSON.stringify(c)}\nWrite a single powerful value proposition sentence.`,
};

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

  const body = await req.json();

  // New API: { questionKey, websiteUrl, previousAnswers, lang }
  if (body.questionKey) {
    const { questionKey, previousAnswers, lang: reqLang } = body;
    const promptConfig = PROMPT_MAP[questionKey];
    if (!promptConfig) {
      return NextResponse.json({ error: "Unknown questionKey" }, { status: 400 });
    }

    const { system, user, isArray } = promptConfig(previousAnswers || {}, reqLang || "en");

    try {
      const msg = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        system,
        messages: [{ role: "user", content: user }],
      });

      const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
      console.log(`[ai-generate] questionKey=${questionKey} text="${text}"`);

      let suggestion: string | string[];
      if (isArray) {
        try {
          suggestion = JSON.parse(text) as string[];
        } catch {
          suggestion = text.replace(/[\[\]"]/g, "").split(",").map(s => s.trim()).filter(Boolean);
        }
      } else {
        suggestion = text.replace(/["\s]/g, "").toLowerCase();
      }

      return NextResponse.json({ suggestion });
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 401 || status === 403) {
        return NextResponse.json({ error: "AI_NOT_CONFIGURED" }, { status: 503 });
      }
      console.error("[ai-generate] error:", err);
      return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
    }
  }

  // Legacy API: { field, context, lang }
  const { field, context, lang } = body;
  const isAr = lang === "ar";
  const promptFn = LEGACY_FIELDS[field];
  if (!promptFn) return NextResponse.json({ error: "Unknown field" }, { status: 400 });

  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system: isAr
        ? "أنت مساعد متخصص في استراتيجيات المبيعات والتسويق B2B. اكتب إجابات موجزة ومهنية باللغة العربية."
        : "You are a B2B sales and marketing strategy expert. Write concise, professional responses in English.",
      messages: [{ role: "user", content: promptFn(context || {}, isAr) }],
    });

    const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
    return NextResponse.json({ text });
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    if (status === 401 || status === 403) {
      return NextResponse.json({ error: "AI_NOT_CONFIGURED" }, { status: 503 });
    }
    console.error("[ai-generate] error:", err);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
