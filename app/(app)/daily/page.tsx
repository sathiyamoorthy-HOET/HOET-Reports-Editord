"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { dailyByEditor, sumRows } from "@/lib/rollup";
import { CATEGORIES } from "@/lib/constants";
import { formatDuration, prettyDate, shiftDate, todayStr } from "@/lib/format";
import { StatCard } from "@/components/ui";

export default function DailyPage() {
  const { entries, profiles } = useStore();
  const [date, setDate] = useState(todayStr());

  const rows = useMemo(
    () => dailyByEditor(entries, profiles, date),
    [entries, profiles, date]
  );
  const totals = useMemo(() => sumRows(rows), [rows]);

  return (
    <div className="space-y-6">
      {/* Date nav */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button className="btn-ghost" onClick={() => setDate((d) => shiftDate(d, -1))}>
            ← Prev
          </button>
          <input
            type="date"
            className="input w-auto"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button className="btn-ghost" onClick={() => setDate((d) => shiftDate(d, 1))}>
            Next →
          </button>
          <button className="btn-ghost" onClick={() => setDate(todayStr())}>
            Today
          </button>
        </div>
        <div className="text-sm font-medium text-slate-500">{prettyDate(date)}</div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <StatCard label="Total videos" value={totals.total} />
        <StatCard label="Active editors" value={totals.activeEditors} accent="#10b981" />
        <StatCard label="Duration" value={formatDuration(totals.durationSeconds)} accent="#f59e0b" />
        {CATEGORIES.map((c) => (
          <StatCard key={c.value} label={c.label} value={totals.counts[c.value]} accent={c.color} />
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <div className="scroll-x">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="th">Editor</th>
                <th className="th">Team</th>
                {CATEGORIES.map((c) => (
                  <th key={c.value} className="th text-center">{c.label}</th>
                ))}
                <th className="th text-center">Total</th>
                <th className="th">Duration</th>
                <th className="th">Comments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr
                  key={r.editorId}
                  className={r.total === 0 ? "text-slate-400" : "hover:bg-slate-50"}
                >
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
                  <td className="td max-w-xs">
                    {r.comments.length ? (
                      <span className="text-xs text-slate-500">{r.comments.join(" · ")}</span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
                <td className="td" colSpan={2}>DAY TOTAL</td>
                {CATEGORIES.map((c) => (
                  <td key={c.value} className="td text-center">{totals.counts[c.value]}</td>
                ))}
                <td className="td text-center">{totals.total}</td>
                <td className="td">{formatDuration(totals.durationSeconds)}</td>
                <td className="td"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
