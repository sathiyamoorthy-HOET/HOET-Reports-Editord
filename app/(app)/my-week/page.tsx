"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/constants";
import {
  currentMonthKey,
  dayLabel,
  formatDuration,
  monthKey,
  monthLabel,
  weekOfMonth,
  weeksInMonth,
} from "@/lib/format";
import { CategoryPill, Empty, StatCard, StatusBadge } from "@/components/ui";
import type { Category } from "@/lib/types";

export default function MyWeekPage() {
  const { profile, entries } = useStore();

  const months = useMemo(() => {
    const set = new Set<string>([currentMonthKey()]);
    entries
      .filter((e) => e.editorId === profile?.id)
      .forEach((e) => set.add(monthKey(e.workDate)));
    return Array.from(set).sort().reverse();
  }, [entries, profile]);

  const [mk, setMk] = useState(currentMonthKey());
  const weeks = useMemo(() => weeksInMonth(mk), [mk]);
  const nowWeek = mk === currentMonthKey() ? weekOfMonth(new Date().toISOString().slice(0, 10)) : 1;
  const [week, setWeek] = useState(nowWeek);

  const mine = useMemo(
    () => entries.filter((e) => e.editorId === profile?.id),
    [entries, profile]
  );

  const weekEntries = useMemo(
    () =>
      mine
        .filter((e) => monthKey(e.workDate) === mk && weekOfMonth(e.workDate) === week)
        .sort((a, b) => a.workDate.localeCompare(b.workDate)),
    [mine, mk, week]
  );

  const range = weeks.find((w) => w.week === week);
  const counts: Record<Category, number> = { organic: 0, ads: 0, reash: 0, course: 0 };
  let duration = 0;
  weekEntries.forEach((e) => {
    counts[e.category] += 1;
    duration += e.durationSeconds;
  });

  // Group by day for the daily strip
  const byDay = useMemo(() => {
    const map = new Map<string, typeof weekEntries>();
    weekEntries.forEach((e) => {
      const list = map.get(e.workDate) ?? [];
      list.push(e);
      map.set(e.workDate, list);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [weekEntries]);

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select className="input w-auto" value={mk} onChange={(e) => setMk(e.target.value)}>
            {months.map((m) => (
              <option key={m} value={m}>{monthLabel(m)}</option>
            ))}
          </select>
          <div className="flex gap-1">
            {weeks.map((w) => (
              <button
                key={w.week}
                onClick={() => setWeek(w.week)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  week === w.week
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                W{w.week}
                <span className="ml-1 hidden text-[10px] text-slate-400 sm:inline">{w.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="text-sm font-medium text-slate-500">
          {profile.fullName} · Week {week} {range ? `(${range.label})` : ""}
        </div>
      </div>

      {/* Week stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Videos" value={weekEntries.length} />
        <StatCard label="Duration" value={formatDuration(duration)} accent="#f59e0b" />
        {CATEGORIES.map((c) => (
          <StatCard key={c.value} label={c.label} value={counts[c.value]} accent={c.color} />
        ))}
      </div>

      {weekEntries.length === 0 ? (
        <Empty title="No videos this week" hint="Log work in My Work — it appears here automatically." />
      ) : (
        <div className="space-y-4">
          {byDay.map(([date, list]) => {
            const dayDur = list.reduce((a, e) => a + e.durationSeconds, 0);
            return (
              <div key={date} className="card overflow-hidden">
                <div className="flex items-center justify-between bg-slate-50 px-4 py-2">
                  <span className="text-sm font-semibold text-slate-700">{dayLabel(date)}</span>
                  <span className="text-xs text-slate-400">
                    {list.length} videos · {formatDuration(dayDur)}
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {list.map((e) => (
                    <div key={e.id} className="flex items-center gap-3 px-4 py-2.5">
                      <CategoryPill category={e.category} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-slate-800">{e.title}</div>
                        {e.videoCode && (
                          <span className="font-mono text-xs text-slate-400">{e.videoCode}</span>
                        )}
                      </div>
                      <span className="whitespace-nowrap text-xs text-slate-500">
                        {formatDuration(e.durationSeconds)}
                      </span>
                      <StatusBadge status={e.status} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
