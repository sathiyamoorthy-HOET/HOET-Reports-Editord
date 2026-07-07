"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/constants";
import {
  currentMonthKey,
  formatDuration,
  monthKey,
  monthLabel,
  weekOfMonth,
  weeksInMonth,
} from "@/lib/format";
import { CategoryPill, Empty, StatCard, StatusBadge } from "@/components/ui";
import type { Category } from "@/lib/types";

export default function MyMonthPage() {
  const { profile, entries } = useStore();

  const mine = useMemo(
    () => entries.filter((e) => e.editorId === profile?.id),
    [entries, profile]
  );

  const months = useMemo(() => {
    const set = new Set<string>([currentMonthKey()]);
    mine.forEach((e) => set.add(monthKey(e.workDate)));
    return Array.from(set).sort().reverse();
  }, [mine]);

  const [mk, setMk] = useState(currentMonthKey());
  const monthEntries = useMemo(
    () => mine.filter((e) => monthKey(e.workDate) === mk).sort((a, b) => b.workDate.localeCompare(a.workDate)),
    [mine, mk]
  );

  const counts: Record<Category, number> = { organic: 0, ads: 0, reash: 0, course: 0 };
  let duration = 0;
  const weekBuckets = [0, 0, 0, 0, 0];
  const weekDur = [0, 0, 0, 0, 0];
  monthEntries.forEach((e) => {
    counts[e.category] += 1;
    duration += e.durationSeconds;
    const w = weekOfMonth(e.workDate) - 1;
    weekBuckets[w] += 1;
    weekDur[w] += e.durationSeconds;
  });
  const weeks = weeksInMonth(mk);
  const approved = monthEntries.filter((e) => e.status === "approved" || e.status === "published").length;

  function exportCsv() {
    const header = ["Date", "Video Code", "Title", "Category", "Duration", "Status", "Remarks"];
    const lines = [header.join(",")];
    for (const e of monthEntries) {
      lines.push(
        [
          e.workDate,
          e.videoCode,
          `"${e.title.replace(/"/g, "'")}"`,
          e.category,
          formatDuration(e.durationSeconds),
          e.status,
          `"${(e.remarks || "").replace(/"/g, "'")}"`,
        ].join(",")
      );
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profile?.username}_${mk}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select className="input w-auto" value={mk} onChange={(e) => setMk(e.target.value)}>
          {months.map((m) => (
            <option key={m} value={m}>{monthLabel(m)}</option>
          ))}
        </select>
        <button className="btn-primary" onClick={exportCsv} disabled={!monthEntries.length}>
          ⬇ Export CSV
        </button>
      </div>

      {/* Headline stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total videos" value={monthEntries.length} />
        <StatCard label="Duration" value={formatDuration(duration)} accent="#f59e0b" />
        <StatCard label="Approved" value={approved} accent="#10b981" />
        {CATEGORIES.slice(0, 3).map((c) => (
          <StatCard key={c.value} label={c.label} value={counts[c.value]} accent={c.color} />
        ))}
      </div>

      {/* Category + week breakdown */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-3 font-semibold text-slate-800">By category</h3>
          <div className="space-y-2.5">
            {CATEGORIES.map((c) => {
              const n = counts[c.value];
              const pct = monthEntries.length ? Math.round((n / monthEntries.length) * 100) : 0;
              return (
                <div key={c.value}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium" style={{ color: c.color }}>{c.label}</span>
                    <span className="text-slate-400">{n} · {pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: c.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-3 font-semibold text-slate-800">By week</h3>
          <div className="space-y-2.5">
            {weeks.map((w) => {
              const n = weekBuckets[w.week - 1];
              const max = Math.max(1, ...weekBuckets);
              const pct = Math.round((n / max) * 100);
              return (
                <div key={w.week}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium text-slate-600">
                      Week {w.week} <span className="text-slate-400">{w.label}</span>
                    </span>
                    <span className="text-slate-400">
                      {n} videos · {formatDuration(weekDur[w.week - 1])}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Full list */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-3">
          <h3 className="font-semibold text-slate-800">{monthLabel(mk)} — all entries</h3>
          <span className="text-xs text-slate-400">{monthEntries.length} videos</span>
        </div>
        {monthEntries.length === 0 ? (
          <div className="p-5">
            <Empty title="Nothing logged this month" hint="Add videos in My Work." />
          </div>
        ) : (
          <div className="scroll-x border-t border-slate-100">
            <table className="w-full min-w-[760px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className="th">Date</th>
                  <th className="th">Code</th>
                  <th className="th">Title</th>
                  <th className="th">Category</th>
                  <th className="th">Duration</th>
                  <th className="th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthEntries.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="td whitespace-nowrap">{e.workDate}</td>
                    <td className="td whitespace-nowrap font-mono text-xs">{e.videoCode || "—"}</td>
                    <td className="td font-medium text-slate-800">{e.title}</td>
                    <td className="td"><CategoryPill category={e.category} /></td>
                    <td className="td whitespace-nowrap">{formatDuration(e.durationSeconds)}</td>
                    <td className="td"><StatusBadge status={e.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
