/**
 * lib/session.ts
 *
 * Supabase-backed per-chat conversation state.
 * Safe for serverless/Vercel — persists across function invocations.
 *
 * Required Supabase table (run once):
 *
 *   CREATE TABLE bot_sessions (
 *     chat_id          BIGINT PRIMARY KEY,
 *     state            TEXT,
 *     reel_url         TEXT,
 *     video_public_url TEXT,
 *     updated_at       TIMESTAMPTZ DEFAULT now()
 *   );
 */

import { createClient } from "@supabase/supabase-js";

export type SessionState = "waiting_for_video" | "waiting_for_caption";

export interface BotSession {
  chat_id: number;
  state: SessionState;
  reel_url: string;
  video_public_url: string;
}

const TABLE = "bot_sessions";

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }
  return createClient(url, key);
}

/**
 * Retrieves the session for a given chat ID.
 * Returns null if no session exists.
 */
export async function getSession(chatId: number): Promise<BotSession | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("chat_id", chatId)
    .maybeSingle();

  if (error) {
    throw new Error(`Session read failed for chat ${chatId}: ${error.message}`);
  }

  return data as BotSession | null;
}

/**
 * Creates or updates the session for a given chat ID.
 */
export async function setSession(
  chatId: number,
  data: Omit<BotSession, "chat_id">
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from(TABLE).upsert(
    {
      chat_id: chatId,
      ...data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "chat_id" }
  );

  if (error) {
    throw new Error(
      `Session write failed for chat ${chatId}: ${error.message}`
    );
  }
}

/**
 * Deletes the session for a given chat ID.
 * Call this after a conversation flow completes or is aborted.
 */
export async function clearSession(chatId: number): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("chat_id", chatId);

  if (error) {
    throw new Error(
      `Session delete failed for chat ${chatId}: ${error.message}`
    );
  }
}
