import { NextResponse } from "next/server";
import { readFileSync } from "fs";

/** GET /api/test-anthropic — diagnostic endpoint for Anthropic auth */
export async function GET() {
  const envKey = process.env.ANTHROPIC_API_KEY ?? "";
  const isPlaceholder =
    envKey.length === 0 ||
    envKey.startsWith("your-") ||
    envKey.startsWith("sk-ant-placeholder");

  const keyType = isPlaceholder
    ? "missing/placeholder"
    : envKey.startsWith("sk-ant-si-")
    ? "session-ingress (Bearer)"
    : "api-key (x-api-key)";

  // Decode JWT expiry if it's a session token
  let tokenExpiry: string | null = null;
  let tokenExpired: boolean | null = null;
  if (!isPlaceholder && envKey.startsWith("sk-ant-si-")) {
    try {
      const parts = envKey.split(".");
      if (parts.length >= 2) {
        const payload = Buffer.from(parts[1], "base64url").toString("utf-8");
        const { exp } = JSON.parse(payload);
        tokenExpiry = new Date(exp * 1000).toISOString();
        tokenExpired = Date.now() > exp * 1000;
      }
    } catch { /* not a JWT */ }
  }

  // Check session token file fallback
  const tokenFile =
    process.env.CLAUDE_SESSION_INGRESS_TOKEN_FILE ||
    "/home/claude/.claude/remote/.session_ingress_token";
  let fileTokenAvailable = false;
  try {
    const t = readFileSync(tokenFile, "utf-8").trim();
    fileTokenAvailable = t.length > 0;
  } catch { /* not available */ }

  // Determine which token to actually test
  let testToken = "";
  let testMode: "bearer" | "apikey" = "apikey";
  if (!isPlaceholder) {
    testToken = envKey;
    testMode = envKey.startsWith("sk-ant-si-") ? "bearer" : "apikey";
  } else if (fileTokenAvailable) {
    testToken = readFileSync(tokenFile, "utf-8").trim();
    testMode = "bearer";
  }

  // Live API test
  let apiStatus: "ok" | "error" | "skipped" = "skipped";
  let apiError: string | null = null;
  let apiModel: string | null = null;

  if (testToken) {
    const headers: Record<string, string> = {
      "content-type": "application/json",
      "anthropic-version": "2023-06-01",
    };
    if (testMode === "bearer") {
      headers["Authorization"] = `Bearer ${testToken}`;
    } else {
      headers["x-api-key"] = testToken;
    }

    try {
      const res = await fetch(
        `${process.env.ANTHROPIC_BASE_URL ?? "https://api.anthropic.com"}/v1/messages`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 10,
            messages: [{ role: "user", content: "say OK" }],
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        apiStatus = "ok";
        apiModel = data.model ?? null;
      } else {
        const err = await res.text();
        apiStatus = "error";
        apiError = `HTTP ${res.status}: ${err}`;
      }
    } catch (err) {
      apiStatus = "error";
      apiError = String(err);
    }
  }

  return NextResponse.json({
    env: {
      ANTHROPIC_API_KEY: isPlaceholder ? "❌ missing/placeholder" : `✅ set (${keyType})`,
      ANTHROPIC_BASE_URL: process.env.ANTHROPIC_BASE_URL ?? "(default)",
      keyType,
      keyPrefix: envKey ? `${envKey.substring(0, 20)}...` : "(empty)",
      tokenExpiry,
      tokenExpired,
      fileTokenAvailable,
    },
    apiTest: {
      status: apiStatus,
      model: apiModel,
      error: apiError,
      authMode: testToken ? testMode : "none",
    },
  });
}
