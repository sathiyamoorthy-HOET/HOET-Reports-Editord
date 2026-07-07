// Duration + date helpers shared across all views.

// Format seconds as a compact human string, e.g. 3754 -> "1h 2m 34s"
export function formatDuration(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds < 0) return "0s";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const parts: string[] = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (s || parts.length === 0) parts.push(`${s}s`);
  return parts.join(" ");
}

// Format seconds as clock HH:MM:SS or MM:SS
export function formatClock(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

// Parse "min" + "sec" number inputs into seconds
export function toSeconds(minutes: number, seconds: number): number {
  return Math.max(0, Math.round((minutes || 0) * 60 + (seconds || 0)));
}

export function splitDuration(totalSeconds: number): { minutes: number; seconds: number } {
  return {
    minutes: Math.floor((totalSeconds || 0) / 60),
    seconds: Math.floor((totalSeconds || 0) % 60),
  };
}

// Local YYYY-MM-DD for a Date (avoids UTC off-by-one from toISOString)
export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayStr(): string {
  return toDateStr(new Date());
}

// YYYY-MM month key from a date string
export function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

export function currentMonthKey(): string {
  return todayStr().slice(0, 7);
}

// Human month label, e.g. "2026-07" -> "July 2026"
export function monthLabel(mk: string): string {
  const [y, m] = mk.split("-").map(Number);
  const d = new Date(y, (m || 1) - 1, 1);
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}

// Which week-of-month (1..5) a date falls into, using calendar weeks
// aligned to the 1st (days 1-7 = week 1, 8-14 = week 2, ...).
export function weekOfMonth(dateStr: string): number {
  const day = Number(dateStr.slice(8, 10));
  return Math.min(5, Math.floor((day - 1) / 7) + 1);
}

export function prettyDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return toDateStr(date);
}

export function daysInMonth(mk: string): number {
  const [y, m] = mk.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

export interface WeekRange {
  week: number; // 1..5
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  label: string; // e.g. "01–07 Jul"
}

// The Week 1-5 ranges of a month, aligned to the 1st (matches weekOfMonth).
export function weeksInMonth(mk: string): WeekRange[] {
  const [y, m] = mk.split("-").map(Number);
  const total = daysInMonth(mk);
  const ranges: WeekRange[] = [];
  for (let w = 1; w <= 5; w++) {
    const startDay = (w - 1) * 7 + 1;
    if (startDay > total) break;
    const endDay = Math.min(w * 7, total);
    const start = `${mk}-${String(startDay).padStart(2, "0")}`;
    const end = `${mk}-${String(endDay).padStart(2, "0")}`;
    const monShort = new Date(y, m - 1, 1).toLocaleString("en-US", { month: "short" });
    ranges.push({
      week: w,
      start,
      end,
      label: `${String(startDay).padStart(2, "0")}–${String(endDay).padStart(2, "0")} ${monShort}`,
    });
  }
  return ranges;
}

// Day-of-week label + number for a date, e.g. "Mon 07"
export function dayLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", { weekday: "short", day: "2-digit" });
}
