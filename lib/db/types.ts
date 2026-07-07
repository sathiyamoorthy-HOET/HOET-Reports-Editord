import type { Profile, WorkEntry, NewWorkEntry } from "../types";

export interface AuthResult {
  ok: boolean;
  profile?: Profile;
  error?: string;
}

// A backend implementation. Two exist: LocalDB (browser/localStorage,
// used on localhost with no setup) and SupabaseDB (shared cloud DB,
// used in production on Vercel). Both satisfy this interface so the
// UI never needs to know which one is active.
export interface DB {
  mode: "local" | "cloud";

  // ── Auth ──────────────────────────────────────────────
  signIn(username: string, password: string): Promise<AuthResult>;
  signOut(): Promise<void>;
  getCurrentProfile(): Promise<Profile | null>;

  // ── Profiles (roster) ─────────────────────────────────
  getProfiles(): Promise<Profile[]>;
  upsertProfile(p: Profile): Promise<void>;

  // ── Work entries (single source of truth) ─────────────
  getEntries(): Promise<WorkEntry[]>;
  addEntry(e: NewWorkEntry): Promise<WorkEntry>;
  updateEntry(id: string, patch: Partial<NewWorkEntry>): Promise<void>;
  deleteEntry(id: string): Promise<void>;

  // ── Live updates ──────────────────────────────────────
  // Fires whenever entries or profiles change anywhere (other tab,
  // other device). Returns an unsubscribe function.
  onChange(cb: () => void): () => void;
}
