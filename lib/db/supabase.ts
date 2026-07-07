import type { DB, AuthResult } from "./types";
import type { Profile, WorkEntry, NewWorkEntry } from "../types";
import { getSupabase, usernameToEmail } from "./supabaseClient";

// Cloud implementation backed by Supabase (Postgres + Auth + Realtime).
// Used in production. Every connected client subscribes to the same
// realtime channel, so an editor's submission appears live in the
// deputy and manager dashboards on any device.

interface ProfileRow {
  id: string;
  username: string;
  full_name: string;
  role: Profile["role"];
  pod: string | null;
  title: string | null;
  active: boolean;
}

interface EntryRow {
  id: string;
  editor_id: string;
  editor_name: string | null;
  pod: string | null;
  work_date: string;
  video_code: string | null;
  title: string;
  category: WorkEntry["category"];
  duration_seconds: number;
  review_link: string | null;
  final_link: string | null;
  status: WorkEntry["status"];
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

function toProfile(r: ProfileRow): Profile {
  return {
    id: r.id,
    username: r.username,
    fullName: r.full_name,
    role: r.role,
    pod: r.pod,
    title: r.title,
    active: r.active,
  };
}

function toEntry(r: EntryRow): WorkEntry {
  return {
    id: r.id,
    editorId: r.editor_id,
    editorName: r.editor_name ?? "",
    pod: r.pod,
    workDate: r.work_date,
    videoCode: r.video_code ?? "",
    title: r.title,
    category: r.category,
    durationSeconds: r.duration_seconds ?? 0,
    reviewLink: r.review_link ?? "",
    finalLink: r.final_link ?? "",
    status: r.status,
    remarks: r.remarks ?? "",
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export class SupabaseDB implements DB {
  mode = "cloud" as const;

  async signIn(username: string, password: string): Promise<AuthResult> {
    const sb = getSupabase();
    const { error } = await sb.auth.signInWithPassword({
      email: usernameToEmail(username),
      password,
    });
    if (error) return { ok: false, error: error.message };
    const profile = await this.getCurrentProfile();
    if (!profile) return { ok: false, error: "No profile found for this account." };
    return { ok: true, profile };
  }

  async signOut(): Promise<void> {
    await getSupabase().auth.signOut();
  }

  async getCurrentProfile(): Promise<Profile | null> {
    const sb = getSupabase();
    const { data: auth } = await sb.auth.getUser();
    if (!auth?.user) return null;
    const { data, error } = await sb
      .from("profiles")
      .select("*")
      .eq("id", auth.user.id)
      .single();
    if (error || !data) return null;
    return toProfile(data as ProfileRow);
  }

  async getProfiles(): Promise<Profile[]> {
    const sb = getSupabase();
    const { data, error } = await sb.from("profiles").select("*").order("full_name");
    if (error) throw error;
    return (data as ProfileRow[]).map(toProfile);
  }

  async upsertProfile(p: Profile): Promise<void> {
    const sb = getSupabase();
    const { error } = await sb.from("profiles").upsert({
      id: p.id,
      username: p.username,
      full_name: p.fullName,
      role: p.role,
      pod: p.pod ?? null,
      title: p.title ?? null,
      active: p.active,
    });
    if (error) throw error;
  }

  async getEntries(): Promise<WorkEntry[]> {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("work_entries")
      .select("*")
      .order("work_date", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as EntryRow[]).map(toEntry);
  }

  async addEntry(e: NewWorkEntry): Promise<WorkEntry> {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("work_entries")
      .insert({
        editor_id: e.editorId,
        work_date: e.workDate,
        video_code: e.videoCode,
        title: e.title,
        category: e.category,
        duration_seconds: e.durationSeconds,
        review_link: e.reviewLink,
        final_link: e.finalLink,
        status: e.status,
        remarks: e.remarks,
      })
      .select("*")
      .single();
    if (error) throw error;
    return toEntry(data as EntryRow);
  }

  async updateEntry(id: string, patch: Partial<NewWorkEntry>): Promise<void> {
    const sb = getSupabase();
    const row: Record<string, unknown> = {};
    if (patch.workDate !== undefined) row.work_date = patch.workDate;
    if (patch.videoCode !== undefined) row.video_code = patch.videoCode;
    if (patch.title !== undefined) row.title = patch.title;
    if (patch.category !== undefined) row.category = patch.category;
    if (patch.durationSeconds !== undefined) row.duration_seconds = patch.durationSeconds;
    if (patch.reviewLink !== undefined) row.review_link = patch.reviewLink;
    if (patch.finalLink !== undefined) row.final_link = patch.finalLink;
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.remarks !== undefined) row.remarks = patch.remarks;
    const { error } = await sb.from("work_entries").update(row).eq("id", id);
    if (error) throw error;
  }

  async deleteEntry(id: string): Promise<void> {
    const { error } = await getSupabase().from("work_entries").delete().eq("id", id);
    if (error) throw error;
  }

  onChange(cb: () => void): () => void {
    const sb = getSupabase();
    const channel = sb
      .channel("hoet-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "work_entries" }, () => cb())
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => cb())
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }
}
