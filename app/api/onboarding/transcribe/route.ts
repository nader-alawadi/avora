import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try { await requireAuth(); } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const audioFile = formData.get("audio") as File | null;

  if (!audioFile) {
    return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
  }

  // Voice transcription requires a dedicated speech-to-text service
  // (e.g., OpenAI Whisper, Deepgram, Google Speech-to-Text).
  // This endpoint accepts the audio and returns a placeholder response.
  // To enable real transcription, integrate a speech-to-text provider here.
  console.log(`[transcribe] Received audio: ${audioFile.name}, size=${audioFile.size}, type=${audioFile.type}`);

  return NextResponse.json({
    text: "",
    info: "Voice transcription requires a speech-to-text service integration.",
  });
}
