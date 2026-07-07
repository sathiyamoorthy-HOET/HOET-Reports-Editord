import type { Category, Profile, WorkEntry } from "./types";
import { monthKey, weekOfMonth } from "./format";

export interface CategoryCounts {
  organic: number;
  ads: number;
  reash: number;
  course: number;
}

const emptyCounts = (): CategoryCounts => ({ organic: 0, ads: 0, reash: 0, course: 0 });

export interface EditorDayRow {
  editorId: string;
  editorName: string;
  pod?: string | null;
  counts: CategoryCounts;
  total: number;
  durationSeconds: number;
  statuses: Record<string, number>;
  comments: string[];
}

// Deputy-manager daily dashboard: one row per editor for a given date.
export function dailyByEditor(
  entries: WorkEntry[],
  profiles: Profile[],
  date: string
): EditorDayRow[] {
  const editors = profiles.filter((p) => p.role === "editor" && p.active);
  const dayEntries = entries.filter((e) => e.workDate === date);
  const byEditor = new Map<string, WorkEntry[]>();
  for (const e of dayEntries) {
    const list = byEditor.get(e.editorId) ?? [];
    list.push(e);
    byEditor.set(e.editorId, list);
  }
  return editors.map((ed) => {
    const list = byEditor.get(ed.id) ?? [];
    const counts = emptyCounts();
    let durationSeconds = 0;
    const statuses: Record<string, number> = {};
    const comments: string[] = [];
    for (const e of list) {
      counts[e.category] += 1;
      durationSeconds += e.durationSeconds;
      statuses[e.status] = (statuses[e.status] ?? 0) + 1;
      if (e.remarks?.trim()) comments.push(e.remarks.trim());
    }
    return {
      editorId: ed.id,
      editorName: ed.fullName,
      pod: ed.pod,
      counts,
      total: list.length,
      durationSeconds,
      statuses,
      comments,
    };
  });
}

export interface WeekBucket {
  count: number;
  durationSeconds: number;
}

export interface EditorMonthRow {
  editorId: string;
  editorName: string;
  pod?: string | null;
  counts: CategoryCounts;
  total: number;
  durationSeconds: number;
  weeks: WeekBucket[]; // index 0..4 => week 1..5
  comments: string[];
}

// Manager monthly rollup: one row per editor for a given YYYY-MM,
// with the Week 1-5 breakdown that matches the manager sheet.
export function monthlyByEditor(
  entries: WorkEntry[],
  profiles: Profile[],
  mk: string
): EditorMonthRow[] {
  const editors = profiles.filter((p) => p.role === "editor" && p.active);
  const monthEntries = entries.filter((e) => monthKey(e.workDate) === mk);
  const byEditor = new Map<string, WorkEntry[]>();
  for (const e of monthEntries) {
    const list = byEditor.get(e.editorId) ?? [];
    list.push(e);
    byEditor.set(e.editorId, list);
  }
  return editors.map((ed) => {
    const list = byEditor.get(ed.id) ?? [];
    const counts = emptyCounts();
    const weeks: WeekBucket[] = Array.from({ length: 5 }, () => ({
      count: 0,
      durationSeconds: 0,
    }));
    let durationSeconds = 0;
    const comments: string[] = [];
    for (const e of list) {
      counts[e.category] += 1;
      durationSeconds += e.durationSeconds;
      const w = weekOfMonth(e.workDate) - 1;
      weeks[w].count += 1;
      weeks[w].durationSeconds += e.durationSeconds;
      if (e.remarks?.trim()) comments.push(e.remarks.trim());
    }
    return {
      editorId: ed.id,
      editorName: ed.fullName,
      pod: ed.pod,
      counts,
      total: list.length,
      durationSeconds,
      weeks,
      comments,
    };
  });
}

export interface Totals {
  counts: CategoryCounts;
  total: number;
  durationSeconds: number;
  activeEditors: number;
}

export function sumRows(rows: { counts: CategoryCounts; total: number; durationSeconds: number }[]): Totals {
  const counts = emptyCounts();
  let total = 0;
  let durationSeconds = 0;
  let activeEditors = 0;
  for (const r of rows) {
    (Object.keys(counts) as Category[]).forEach((k) => (counts[k] += r.counts[k]));
    total += r.total;
    durationSeconds += r.durationSeconds;
    if (r.total > 0) activeEditors += 1;
  }
  return { counts, total, durationSeconds, activeEditors };
}
