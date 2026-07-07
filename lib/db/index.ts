import type { DB } from "./types";
import { LocalDB } from "./local";
import { SupabaseDB } from "./supabase";
import { isCloudConfigured } from "./supabaseClient";

let instance: DB | null = null;

// Chooses the backend once: Supabase if env vars are present
// (production / Vercel), otherwise the local demo backend (localhost).
export function getDB(): DB {
  if (!instance) {
    instance = isCloudConfigured ? new SupabaseDB() : new LocalDB();
  }
  return instance;
}

export { isCloudConfigured };
export type { DB };
