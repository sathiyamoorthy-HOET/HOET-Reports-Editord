import type { DB, AuthResult } from "./types";
import type { Profile, WorkEntry, NewWorkEntry } from "../types";
import { ROSTER, findMember } from "../roster";
import demoData from "../demo.data.json";

// Local, no-backend implementation used on localhost / demo mode.
// - Data lives in localStorage.
// - Cross-tab live sync via the `storage` event, so opening the
//   editor / deputy / manager views in separate tabs shows updates
//   flowing between them (mirrors the "all connected" behaviour).

const ENTRIES_KEY = "hoet.entries.v3";
const PROFILES_KEY = "hoet.profiles.v3";
const SESSION_KEY = "hoet.session.v3";
const PING_KEY = "hoet.ping.v3";

const DEFAULT_PASSWORD = "Hoet@2026";

function uid(): string {
  // Stable-ish unique id without external deps
  return (
    "e_" +
    Date.now().toString(36) +
    "_" +
    Math.random().toString(36).slice(2, 8)
  );
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  // Nudge other tabs (storage event fires in *other* tabs only)
  window.localStorage.setItem(PING_KEY, String(Date.now()));
}

function seedProfiles(): Profile[] {
  return ROSTER.map((m) => ({
    id: "u_" + m.username,
    username: m.username,
    fullName: m.fullName,
    email: m.email ?? null,
    role: m.role,
    pod: m.pod ?? null,
    focus: m.focus ?? null,
    wfh: m.wfh ?? false,
    title: m.title ?? null,
    active: true,
  }));
}

// Pre-populated demo entries (Sathiya Moorthy) so the app shows live
// data on first run — visible in My Work, the Daily Dashboard and the
// Monthly Report. Sourced from the House of EduTech report sheets.
function seedEntries(): WorkEntry[] {
  return demoData.entries.map((e, i) => {
    const ts = `${e.workDate}T09:${String(10 + i).padStart(2, "0")}:00.000Z`;
    return {
      id: `demo_${demoData.editorId}_${i}`,
      editorId: demoData.editorId,
      editorName: demoData.editorName,
      pod: demoData.pod,
      workDate: e.workDate,
      videoCode: e.videoCode,
      title: e.title,
      category: e.category as WorkEntry["category"],
      durationSeconds: e.durationSeconds,
      reviewLink: e.reviewLink,
      finalLink: e.finalLink,
      status: e.status as WorkEntry["status"],
      remarks: e.remarks,
      createdAt: ts,
      updatedAt: ts,
    };
  });
}

export class LocalDB implements DB {
  mode = "local" as const;

  private ensureSeed() {
    const profiles = read<Profile[] | null>(PROFILES_KEY, null);
    if (!profiles || profiles.length === 0) {
      write(PROFILES_KEY, seedProfiles());
    }
    if (read<WorkEntry[] | null>(ENTRIES_KEY, null) === null) {
      write(ENTRIES_KEY, seedEntries());
    }
  }

  async signIn(username: string, password: string): Promise<AuthResult> {
    this.ensureSeed();
    const member = findMember(username.trim());
    if (!member) {
      return { ok: false, error: "Unknown username. Ask your admin to add you." };
    }
    // Demo mode accepts the shared default password (or blank for quick access).
    if (password && password !== DEFAULT_PASSWORD) {
      return { ok: false, error: "Incorrect password. (Demo password: Hoet@2026)" };
    }
    const profiles = await this.getProfiles();
    const profile = profiles.find((p) => p.username === member.username)!;
    write(SESSION_KEY, profile.id);
    return { ok: true, profile };
  }

  async signOut(): Promise<void> {
    if (typeof window !== "undefined") window.localStorage.removeItem(SESSION_KEY);
  }

  async getCurrentProfile(): Promise<Profile | null> {
    this.ensureSeed();
    const id = read<string | null>(SESSION_KEY, null);
    if (!id) return null;
    const profiles = await this.getProfiles();
    return profiles.find((p) => p.id === id) ?? null;
  }

  async getProfiles(): Promise<Profile[]> {
    this.ensureSeed();
    return read<Profile[]>(PROFILES_KEY, seedProfiles());
  }

  async upsertProfile(p: Profile): Promise<void> {
    const profiles = await this.getProfiles();
    const idx = profiles.findIndex((x) => x.id === p.id);
    if (idx >= 0) profiles[idx] = p;
    else profiles.push(p);
    write(PROFILES_KEY, profiles);
  }

  async getEntries(): Promise<WorkEntry[]> {
    this.ensureSeed();
    return read<WorkEntry[]>(ENTRIES_KEY, []);
  }

  async addEntry(e: NewWorkEntry): Promise<WorkEntry> {
    const entries = await this.getEntries();
    const profiles = await this.getProfiles();
    const editor = profiles.find((p) => p.id === e.editorId);
    const now = new Date().toISOString();
    const full: WorkEntry = {
      ...e,
      id: uid(),
      editorName: editor?.fullName ?? "Unknown",
      pod: editor?.pod ?? null,
      createdAt: now,
      updatedAt: now,
    };
    entries.unshift(full);
    write(ENTRIES_KEY, entries);
    return full;
  }

  async updateEntry(id: string, patch: Partial<NewWorkEntry>): Promise<void> {
    const entries = await this.getEntries();
    const idx = entries.findIndex((x) => x.id === id);
    if (idx < 0) return;
    entries[idx] = {
      ...entries[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    write(ENTRIES_KEY, entries);
  }

  async deleteEntry(id: string): Promise<void> {
    const entries = await this.getEntries();
    write(
      ENTRIES_KEY,
      entries.filter((x) => x.id !== id)
    );
  }

  onChange(cb: () => void): () => void {
    if (typeof window === "undefined") return () => {};
    const handler = (ev: StorageEvent) => {
      if (
        ev.key === ENTRIES_KEY ||
        ev.key === PROFILES_KEY ||
        ev.key === PING_KEY
      ) {
        cb();
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }
}
