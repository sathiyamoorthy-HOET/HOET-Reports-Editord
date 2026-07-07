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

// Accounts are seeded with each person's real House of EduTech email.
// Users can sign in with their email, or with a bare username (which is
// then completed to <username>@houseofedtech.in).
export const EMAIL_DOMAIN = "houseofedtech.in";

// Turn login input into an email: pass through anything containing "@",
// otherwise append the org domain.
export function loginToEmail(input: string): string {
  const v = input.trim().toLowerCase();
  return v.includes("@") ? v : `${v}@${EMAIL_DOMAIN}`;
}

export function emailToUsername(email: string): string {
  return email.split("@")[0];
}
