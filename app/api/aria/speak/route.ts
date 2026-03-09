import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY ?? "";
const ELEVENLABS_BASE = "https://api.elevenlabs.io/v1";
const MODEL_ID = "eleven_multilingual_v2";

// Voices from "My Voices" in the ElevenLabs account
const ARABIC_VOICE_ID = "L10lEremDiJfPicq5CPh";  // Yasmine — Human-Like Banking Agent (professional, female, ar)
const ARABIC_VOICE_FALLBACK = "4wf10lgibMnboGJGCLrP"; // Farah — Smooth, Calm and Warm (professional, female, ar)
const ENGLISH_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // Sarah — Mature, Reassuring, Confident (premade, female, en)

function isConfigured(): boolean {
  return ELEVENLABS_API_KEY.length > 0 && !ELEVENLABS_API_KEY.startsWith("your-");
}

async function callElevenLabs(text: string, voiceId: string): Promise<Response> {
  return fetch(`${ELEVENLABS_BASE}/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.3,
        use_speaker_boost: true,
      },
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
    return NextResponse.json({ noAudio: true }, { status: 200 });
  }

  const primaryVoice = language === "ar" ? ARABIC_VOICE_ID : ENGLISH_VOICE_ID;

  try {
    let response = await callElevenLabs(text, primaryVoice);

    // If primary Arabic voice fails, try Farah as fallback
    if (!response.ok && language === "ar") {
      console.warn(`Yasmine voice failed (${response.status}), trying Farah fallback`);
      response = await callElevenLabs(text, ARABIC_VOICE_FALLBACK);
    }

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      console.error("ElevenLabs error:", response.status, errBody);
      return NextResponse.json({ noAudio: true }, { status: 200 });
    }

    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("ElevenLabs fetch error:", error);
    return NextResponse.json({ noAudio: true }, { status: 200 });
  }
}
