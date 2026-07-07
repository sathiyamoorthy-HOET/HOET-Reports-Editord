"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { monthlyByEditor, sumRows } from "@/lib/rollup";
import { CATEGORIES } from "@/lib/constants";
import { currentMonthKey, formatDuration, monthKey, monthLabel } from "@/lib/format";
import { StatCard } from "@/components/ui";
import { Icon } from "@/components/icons";

export default function MonthlyPage() {
  const { entries, profiles } = useStore();

  // Build the list of months that have data (plus current month)
  const months = useMemo(() => {
    const set = new Set<string>([currentMonthKey()]);
    entries.forEach((e) => set.add(monthKey(e.workDate)));
    return Array.from(set).sort().reverse();
  }, [entries]);

  const [mk, setMk] = useState(currentMonthKey());
  const rows = useMemo(() => monthlyByEditor(entries, profiles, mk), [entries, profiles, mk]);
  const totals = useMemo(() => sumRows(rows), [rows]);
  const active = rows.filter((r) => r.total > 0);

  function exportCsv() {
    const header = [
      "Editor", "Pod", "Organic", "Ads", "ReAsh", "Course", "Total", "Duration",
      "W1", "W2", "W3", "W4", "W5", "Comments",
    ];
    const lines = [header.join(",")];
    for (const r of rows) {
      const cells = [
        r.editorName, r.pod ?? "",
        r.counts.organic, r.counts.ads, r.counts.reash, r.counts.course, r.total,
        formatDuration(r.durationSeconds),
        ...r.weeks.map((w) => w.count),
        `"${r.comments.join(" | ").replace(/"/g, "'")}"`,
      ];
      lines.push(cells.join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `HOET_Monthly_${mk}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const avgDurationPerEditor = active.length
    ? Math.round(totals.durationSeconds / active.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select className="input w-auto" value={mk} onChange={(e) => setMk(e.target.value)}>
            {months.map((m) => (
              <option key={m} value={m}>{monthLabel(m)}</option>
            ))}
          </select>
        </div>
        <button className="btn-primary" onClick={exportCsv}>
          <Icon name="download" className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total videos" value={totals.total} />
        <StatCard label="Active editors" value={totals.activeEditors} accent="#10b981" />
        <StatCard label="Total duration" value={formatDuration(totals.durationSeconds)} accent="#f59e0b" />
        <StatCard label="Avg / editor" value={formatDuration(avgDurationPerEditor)} accent="#ec4899" />
        {CATEGORIES.slice(0, 2).map((c) => (
          <StatCard key={c.value} label={c.label} value={totals.counts[c.value]} accent={c.color} />
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="font-semibold text-slate-800">{monthLabel(mk)} — per editor</h2>
        </div>
        <div className="scroll-x border-t border-slate-100">
          <table className="w-full min-w-[1050px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="th">Editor</th>
                <th className="th">Team</th>
                {CATEGORIES.map((c) => (
                  <th key={c.value} className="th text-center">{c.label}</th>
                ))}
                <th className="th text-center">Total</th>
                <th className="th">Duration</th>
                {[1, 2, 3, 4, 5].map((w) => (
                  <th key={w} className="th text-center">W{w}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.editorId} className={r.total === 0 ? "text-slate-400" : "hover:bg-slate-50"}>
                  <td className="td font-medium text-slate-800">{r.editorName}</td>
                  <td className="td text-slate-400">{r.pod ?? "—"}</td>
                  {CATEGORIES.map((c) => (
                    <td key={c.value} className="td text-center">
                      {r.counts[c.value] || <span className="text-slate-300">·</span>}
                    </td>
                  ))}
                  <td className="td text-center font-semibold">
                    {r.total || <span className="text-slate-300">·</span>}
                  </td>
                  <td className="td whitespace-nowrap">
                    {r.durationSeconds ? formatDuration(r.durationSeconds) : <span className="text-slate-300">—</span>}
                  </td>
                  {r.weeks.map((w, i) => (
                    <td key={i} className="td text-center text-xs">
                      {w.count ? (
                        <span>
                          <span className="font-medium text-slate-700">{w.count}</span>
                        </span>
                      ) : (
                        <span className="text-slate-300">·</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
                <td className="td" colSpan={2}>MONTH TOTAL</td>
                {CATEGORIES.map((c) => (
                  <td key={c.value} className="td text-center">{totals.counts[c.value]}</td>
                ))}
                <td className="td text-center">{totals.total}</td>
                <td className="td">{formatDuration(totals.durationSeconds)}</td>
                <td className="td text-center" colSpan={5}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Comments roll-up */}
      <div className="card p-5">
        <h2 className="mb-3 font-semibold text-slate-800">Editor notes this month</h2>
        {active.filter((r) => r.comments.length).length === 0 ? (
          <p className="text-sm text-slate-400">No remarks logged yet.</p>
        ) : (
          <div className="space-y-3">
            {active
              .filter((r) => r.comments.length)
              .map((r) => (
                <div key={r.editorId} className="rounded-lg bg-slate-50 p-3">
                  <div className="text-sm font-medium text-slate-700">
                    {r.editorName}
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      {r.total} videos · {formatDuration(r.durationSeconds)}
                    </span>
                  </div>
                  <ul className="mt-1 list-inside list-disc text-xs text-slate-500">
                    {Array.from(new Set(r.comments)).map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
