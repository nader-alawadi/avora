import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY ?? "";
const ELEVENLABS_BASE = "https://api.elevenlabs.io/v1";
const MODEL_ID = "eleven_multilingual_v2";

// Voices from "My Voices" in the ElevenLabs account
const ARABIC_VOICE_ID = "4wf10lgibMnboGJGCLrP";  // Farah — Arabic female
const ENGLISH_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // Sarah — premade female English

const VOICE_SETTINGS = {
  stability: 0.75,
  similarity_boost: 0.85,
  style: 0.3,
  use_speaker_boost: true,
};

function isConfigured(): boolean {
  return ELEVENLABS_API_KEY.length > 0 && !ELEVENLABS_API_KEY.startsWith("your-");
}

async function callStream(text: string, voiceId: string): Promise<Response> {
  return fetch(`${ELEVENLABS_BASE}/text-to-speech/${voiceId}/stream`, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
      voice_settings: VOICE_SETTINGS,
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { text, language } = await req.json();

  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  if (!isConfigured()) {
    console.warn("[speak] ElevenLabs not configured — returning noAudio");
    return NextResponse.json({ noAudio: true }, { status: 200 });
  }

  const primaryVoice = language === "ar" ? ARABIC_VOICE_ID : ENGLISH_VOICE_ID;
  console.log(
    `[speak] key=${ELEVENLABS_API_KEY.slice(0, 10)}... | voice=${primaryVoice} | lang=${language} | text="${text.slice(0, 40)}..."`
  );

  try {
    let upstream = await callStream(text, primaryVoice);
    console.log(`[speak] ElevenLabs /stream response: ${upstream.status}`);

    if (!upstream.ok) {
      const errBody = await upstream.text().catch(() => "");
      console.error(`[speak] ElevenLabs error ${upstream.status}:`, errBody);
      return NextResponse.json({ noAudio: true }, { status: 200 });
    }

    // Stream directly to the client — no buffering in the server
    console.log("[speak] Streaming audio to client");
    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[speak] ElevenLabs fetch error:", error);
    return NextResponse.json({ noAudio: true }, { status: 200 });
  }
}
