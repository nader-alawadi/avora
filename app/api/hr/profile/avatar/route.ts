import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]);
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "avatars");

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
            resolve({ buffer: Buffer.concat(chunks), filename: info.filename, mimeType: info.mimeType });
          }
        });
        stream.on("error", reject);
      });

      bb.on("finish", () => { if (!resolved) reject(new Error("NO_FILE_FIELD")); });
      bb.on("error", reject);

      if (!req.body) { reject(new Error("NO_BODY")); return; }

      const reader = req.body.getReader();
      (async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) { bb.end(); break; }
            bb.write(value);
          }
        } catch (e) { reject(e); }
      })();
    }
  );
}

export async function POST(req: NextRequest) {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.sessionType !== "adminTeam") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const memberId = session.id;

  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (e) {
    return NextResponse.json({ error: "Server storage error", detail: String(e) }, { status: 500 });
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  let parsed: { buffer: Buffer; filename: string; mimeType: string };
  try {
    parsed = await parseUpload(req, contentType);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "FILE_TOO_LARGE") return NextResponse.json({ error: "File exceeds 5 MB limit" }, { status: 400 });
    if (msg === "NO_FILE_FIELD" || msg === "NO_BODY") return NextResponse.json({ error: "No file provided" }, { status: 400 });
    return NextResponse.json({ error: "Failed to read upload", detail: msg }, { status: 400 });
  }

  const { buffer, filename, mimeType } = parsed;

  if (!ALLOWED_TYPES.has(mimeType)) {
    return NextResponse.json({ error: `File type not allowed: ${mimeType}` }, { status: 400 });
  }

  const ext = (filename.split(".").pop() ?? "jpg").replace(/[^a-zA-Z0-9]/g, "");
  const safeName = `${memberId}-${Date.now()}.${ext}`;
  const filePath = path.join(UPLOAD_DIR, safeName);

  try {
    await writeFile(filePath, buffer);
  } catch (e) {
    return NextResponse.json({ error: "Failed to save file", detail: String(e) }, { status: 500 });
  }

  const avatarUrl = `/uploads/avatars/${safeName}`;

  // Persist immediately to the member record
  await prisma.adminTeamMember.update({
    where: { id: memberId },
    data: { avatarUrl },
  });

  return NextResponse.json({ avatarUrl });
}
