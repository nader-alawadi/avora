import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY ?? "";
const ELEVENLABS_BASE = "https://api.elevenlabs.io/v1";
const MODEL_ID = "eleven_multilingual_v2";

// Default voice — Rachel (works well for multilingual including Arabic)
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM";

// Cache the best Arabic voice ID across requests (in-process memory)
let cachedArabicVoiceId: string | null = null;

function isConfigured(): boolean {
  return (
    ELEVENLABS_API_KEY.length > 0 &&
    !ELEVENLABS_API_KEY.startsWith("your-") &&
    !ELEVENLABS_API_KEY.startsWith("sk-ant-placeholder")
  );
}

/** Fetch all available voices and pick the best Arabic-capable female voice. */
async function getBestArabicVoiceId(): Promise<string> {
  if (cachedArabicVoiceId) return cachedArabicVoiceId;

  try {
    const res = await fetch(`${ELEVENLABS_BASE}/voices`, {
      headers: { "xi-api-key": ELEVENLABS_API_KEY },
    });
    if (!res.ok) return DEFAULT_VOICE_ID;

    const data = await res.json();
    const voices: Array<{
      voice_id: string;
      name: string;
      labels?: Record<string, string>;
      fine_tuning?: { is_allowed_to_fine_tune?: boolean };
    }> = data.voices ?? [];

    // Prefer Arabic-labelled female voices, then any Arabic voice, then default
    const arabicFemale = voices.find(
      (v) =>
        (v.labels?.language === "ar" || v.labels?.accent?.toLowerCase().includes("arab")) &&
        v.labels?.gender?.toLowerCase() === "female"
    );
    const arabicAny = voices.find(
      (v) =>
        v.labels?.language === "ar" || v.labels?.accent?.toLowerCase().includes("arab")
    );

    cachedArabicVoiceId = arabicFemale?.voice_id ?? arabicAny?.voice_id ?? DEFAULT_VOICE_ID;
    return cachedArabicVoiceId;
  } catch {
    return DEFAULT_VOICE_ID;
  }
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

  // Pick voice: for Arabic, try to find a proper Arabic voice
  const voiceId = language === "ar" ? await getBestArabicVoiceId() : DEFAULT_VOICE_ID;

  try {
    const response = await fetch(`${ELEVENLABS_BASE}/text-to-speech/${voiceId}`, {
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
