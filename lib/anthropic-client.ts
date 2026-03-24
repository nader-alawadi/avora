/**
 * Shared Anthropic client factory.
 *
 * Supports two authentication modes:
 *  1. Regular API key  (sk-ant-api-...)  → sent as x-api-key header
 *  2. Session ingress token (sk-ant-si-...) → sent as Authorization: Bearer
 *     (used in the Claude Code dev environment)
 */
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";

type AuthMode = "apikey" | "bearer";

function resolveAuth(): { token: string; mode: AuthMode } | null {
  const envKey = process.env.ANTHROPIC_API_KEY ?? "";
  const isPlaceholder =
    envKey.length === 0 ||
    envKey.startsWith("your-") ||
    envKey.startsWith("sk-ant-placeholder");

  if (!isPlaceholder) {
    const mode: AuthMode = envKey.startsWith("sk-ant-si-") ? "bearer" : "apikey";
    return { token: envKey, mode };
  }

  // Fall back to the Claude Code session ingress token file
  const tokenFile =
    process.env.CLAUDE_SESSION_INGRESS_TOKEN_FILE ||
    "/home/claude/.claude/remote/.session_ingress_token";
  try {
    const token = readFileSync(tokenFile, "utf-8").trim();
    if (token) return { token, mode: "bearer" };
  } catch { /* file not available */ }

  return null;
}

/** Returns a configured Anthropic client, or null if no auth is available. */
export function createAnthropicClient(): Anthropic | null {
  const auth = resolveAuth();
  if (!auth) return null;

  if (auth.mode === "bearer") {
    return new Anthropic({ apiKey: "placeholder", authToken: auth.token });
  }
  return new Anthropic({ apiKey: auth.token });
}

/** Throws if no valid auth is configured. */
export function requireAnthropicClient(): Anthropic {
  const client = createAnthropicClient();
  if (!client) {
    throw Object.assign(
      new Error("ANTHROPIC_API_KEY is not configured"),
      { code: "AI_NOT_CONFIGURED" }
    );
  }
  return client;
}
