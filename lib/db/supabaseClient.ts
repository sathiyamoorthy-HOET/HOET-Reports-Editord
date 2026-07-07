import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isCloudConfigured = Boolean(url && anon);

let client: SupabaseClient | null = null;

// Browser Supabase client (singleton). Only created when env vars exist.
export function getSupabase(): SupabaseClient {
  if (!isCloudConfigured) {
    throw new Error("Supabase is not configured (running in local demo mode).");
  }
  if (!client) {
    client = createClient(url!, anon!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}

// Every seeded account uses an internal email derived from the username,
// so users only ever type a username. e.g. "krishna" -> "krishna@hoet.local"
export const EMAIL_DOMAIN = "hoet.local";

export function usernameToEmail(username: string): string {
  return `${username.trim().toLowerCase()}@${EMAIL_DOMAIN}`;
}

export function emailToUsername(email: string): string {
  return email.split("@")[0];
}
