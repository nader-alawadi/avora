import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Tell Next.js not to pre-parse the body so we can stream it ourselves.
export const dynamic = "force-dynamic";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_TYPES = new Set([
  "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml",
  "video/mp4", "video/webm", "video/quicktime", "video/mpeg",
  "audio/mpeg", "audio/mp3", "audio/mp4", "audio/wav", "audio/webm",
  "audio/ogg", "audio/aac",
  "application/pdf",
]);

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "disputes");

// ── Multipart parser ────────────────────────────────────────────────────────
// Uses busboy directly (already installed via multer) so we own the size limit
// and bypass Next.js's internal body-parsing limit (~4 MB in some versions).

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Busboy = require("busboy") as (opts: BusboyOpts) => BusboyInstance;

interface BusboyOpts {
  headers: Record<string, string>;
  limits?: { fileSize?: number };
}
interface FileInfo { filename: string; mimeType: string }
interface BusboyInstance {
  on(e: "file", cb: (field: string, stream: NodeJS.ReadableStream & { truncated?: boolean }, info: FileInfo) => void): void;
  on(e: "finish" | "close", cb: () => void): void;
  on(e: "error", cb: (err: Error) => void): void;
  write(chunk: Uint8Array, cb?: () => void): boolean;
  end(cb?: () => void): void;
}

function parseUpload(req: NextRequest, contentType: string) {
  return new Promise<{ buffer: Buffer; filename: string; mimeType: string }>(
    (resolve, reject) => {
      const bb = Busboy({
        headers: { "content-type": contentType },
        limits: { fileSize: MAX_BYTES },
      });

      let resolved = false;

      bb.on("file", (field, stream, info) => {
        if (field !== "file") { stream.resume(); return; }

        const chunks: Buffer[] = [];
        stream.on("data", (chunk: Buffer) => chunks.push(chunk));
        stream.on("end", () => {
          if ((stream as { truncated?: boolean }).truncated) {
            reject(new Error("FILE_TOO_LARGE"));
          } else {
            resolved = true;
            resolve({
              buffer: Buffer.concat(chunks),
              filename: info.filename,
              mimeType: info.mimeType,
            });
          }
        });
        stream.on("error", reject);
      });

      bb.on("finish", () => {
        if (!resolved) reject(new Error("NO_FILE_FIELD"));
      });

      bb.on("error", reject);

      if (!req.body) { reject(new Error("NO_BODY")); return; }

      // Pipe the Web Fetch ReadableStream into busboy
      const reader = req.body.getReader();
      (async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) { bb.end(); break; }
            bb.write(value);
          }
        } catch (e) {
          reject(e);
        }
      })();
    }
  );
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1 · Auth
  try {
    await requireAuth();
  } catch {
    console.error("[upload/dispute] auth failed");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2 · Ensure upload directory exists
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (e) {
    console.error("[upload/dispute] mkdir error:", e);
    return NextResponse.json({ error: "Server storage error", detail: String(e) }, { status: 500 });
  }

  // 3 · Parse multipart body
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  let parsed: { buffer: Buffer; filename: string; mimeType: string };
  try {
    parsed = await parseUpload(req, contentType);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[upload/dispute] parse error:", e);
    if (msg === "FILE_TOO_LARGE")
      return NextResponse.json({ error: "File exceeds 10 MB limit" }, { status: 400 });
    if (msg === "NO_FILE_FIELD" || msg === "NO_BODY")
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    return NextResponse.json({ error: "Failed to read upload", detail: msg }, { status: 400 });
  }

  const { buffer, filename, mimeType } = parsed;

  // 4 · Validate MIME type
  if (!ALLOWED_TYPES.has(mimeType)) {
    console.warn("[upload/dispute] rejected MIME:", mimeType, filename);
    return NextResponse.json({ error: `File type not allowed: ${mimeType}` }, { status: 400 });
  }

  // 5 · Write to disk
  const ext = (filename.split(".").pop() ?? "bin").replace(/[^a-zA-Z0-9]/g, "");
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const filePath = path.join(UPLOAD_DIR, safeName);

  try {
    await writeFile(filePath, buffer);
  } catch (e) {
    console.error("[upload/dispute] writeFile error:", e);
    return NextResponse.json({ error: "Failed to save file", detail: String(e) }, { status: 500 });
  }

  console.log(`[upload/dispute] saved ${safeName} (${buffer.length} bytes, ${mimeType})`);
  return NextResponse.json({ fileUrl: `/uploads/disputes/${safeName}` });
}
