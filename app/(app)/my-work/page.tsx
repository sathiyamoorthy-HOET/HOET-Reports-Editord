"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import EntryForm from "@/components/EntryForm";
import { CategoryPill, Empty, StatCard, StatusBadge } from "@/components/ui";
import { Icon } from "@/components/icons";
import { CATEGORIES } from "@/lib/constants";
import {
  currentMonthKey,
  formatDuration,
  monthKey,
  monthLabel,
  prettyDate,
  weekOfMonth,
  weeksInMonth,
} from "@/lib/format";
import type { Category, WorkEntry } from "@/lib/types";

type WeekFilter = "all" | 1 | 2 | 3 | 4 | 5;

export default function MyWorkPage() {
  const { profile, entries, addEntry, updateEntry, deleteEntry } = useStore();
  const [editing, setEditing] = useState<WorkEntry | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [mk, setMk] = useState(currentMonthKey());
  const [wk, setWk] = useState<WeekFilter>("all");

  const mine = useMemo(
    () => entries.filter((e) => e.editorId === profile?.id),
    [entries, profile]
  );

  const months = useMemo(() => {
    const set = new Set<string>([currentMonthKey()]);
    mine.forEach((e) => set.add(monthKey(e.workDate)));
    return Array.from(set).sort().reverse();
  }, [mine]);

  const weeks = useMemo(() => weeksInMonth(mk), [mk]);

  const filtered = useMemo(
    () =>
      mine
        .filter((e) => monthKey(e.workDate) === mk)
        .filter((e) => wk === "all" || weekOfMonth(e.workDate) === wk)
        .sort((a, b) => b.workDate.localeCompare(a.workDate)),
    [mine, mk, wk]
  );

  const counts: Record<Category, number> = { organic: 0, ads: 0, reash: 0, course: 0 };
  let duration = 0;
  filtered.forEach((e) => {
    counts[e.category] += 1;
    duration += e.durationSeconds;
  });
  const approved = filtered.filter((e) => e.status === "approved" || e.status === "published").length;

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(e: WorkEntry) {
    setEditing(e);
    setFormOpen(true);
  }
  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  function exportCsv() {
    const header = ["Date", "Video Code", "Title", "Category", "Duration", "Status", "Remarks"];
    const lines = [header.join(",")];
    filtered.forEach((e) =>
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
      )
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const scope = wk === "all" ? mk : `${mk}-W${wk}`;
    a.download = `${profile?.username}_${scope}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!profile) return null;

  const rangeLabel =
    wk === "all" ? monthLabel(mk) : `${monthLabel(mk)} · Week ${wk}`;

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="card flex flex-wrap items-center gap-3 p-3">
        <select className="input w-auto" value={mk} onChange={(e) => setMk(e.target.value)}>
          {months.map((m) => (
            <option key={m} value={m}>{monthLabel(m)}</option>
          ))}
        </select>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setWk("all")}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              wk === "all"
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
          >
            This Month
          </button>
          {weeks.map((w) => (
            <button
              key={w.week}
              onClick={() => setWk(w.week as WeekFilter)}
              title={w.label}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                wk === w.week
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              Week {w.week}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button className="btn-ghost" onClick={exportCsv} disabled={!filtered.length}>
            <Icon name="download" className="h-4 w-4" /> CSV
          </button>
          <button className="btn-primary" onClick={openNew}>
            <Icon name="plus" className="h-4 w-4" /> New Task
          </button>
        </div>
      </div>

      {/* Summary for the selected range */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <StatCard label="Videos" value={filtered.length} sub={rangeLabel} />
        <StatCard label="Duration" value={formatDuration(duration)} accent="#f59e0b" />
        <StatCard label="Approved" value={approved} accent="#10b981" />
        {CATEGORIES.map((c) => (
          <StatCard key={c.value} label={c.label} value={counts[c.value]} accent={c.color} />
        ))}
      </div>

      {/* Entries sheet */}
      <div className="card">
        <div className="flex items-center justify-between gap-3 px-5 py-3">
          <div>
            <h2 className="font-semibold text-slate-800">My Work</h2>
            <span className="text-xs text-slate-400">
              {filtered.length} entries · {rangeLabel}
            </span>
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="p-5">
            <Empty
              title="No entries in this range"
              hint="Change the filter above, or click “New Task” to log a video."
            />
          </div>
        ) : (
          <div className="scroll-x border-t border-slate-100">
            <table className="w-full min-w-[900px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className="th">Date</th>
                  <th className="th">Code</th>
                  <th className="th">Title</th>
                  <th className="th">Category</th>
                  <th className="th">Duration</th>
                  <th className="th">Status</th>
                  <th className="th">Links</th>
                  <th className="th"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="td whitespace-nowrap">{prettyDate(e.workDate)}</td>
                    <td className="td whitespace-nowrap font-mono text-xs">{e.videoCode || "—"}</td>
                    <td className="td">
                      <div className="font-medium text-slate-800">{e.title}</div>
                      {e.remarks && (
                        <div className="mt-0.5 text-xs text-slate-400">{e.remarks}</div>
                      )}
                    </td>
                    <td className="td"><CategoryPill category={e.category} /></td>
                    <td className="td whitespace-nowrap">{formatDuration(e.durationSeconds)}</td>
                    <td className="td"><StatusBadge status={e.status} /></td>
                    <td className="td">
                      <div className="flex flex-col gap-1 text-xs">
                        {e.reviewLink && (
                          <a href={e.reviewLink} target="_blank" className="inline-flex items-center gap-1 text-brand-600 hover:underline">
                            Review <Icon name="external" className="h-3 w-3" />
                          </a>
                        )}
                        {e.finalLink && (
                          <a href={e.finalLink} target="_blank" className="inline-flex items-center gap-1 text-emerald-600 hover:underline">
                            Final <Icon name="external" className="h-3 w-3" />
                          </a>
                        )}
                        {!e.reviewLink && !e.finalLink && <span className="text-slate-300">—</span>}
                      </div>
                    </td>
                    <td className="td whitespace-nowrap">
                      <div className="flex gap-1">
                        <button
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600"
                          onClick={() => openEdit(e)}
                          title="Edit"
                        >
                          <Icon name="edit" className="h-4 w-4" />
                        </button>
                        <button
                          className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          onClick={() => {
                            if (confirm("Delete this entry?")) deleteEntry(e.id);
                          }}
                          title="Delete"
                        >
                          <Icon name="trash" className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New / Edit task modal */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm"
          onClick={closeForm}
        >
          <div className="card my-8 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <h3 className="font-semibold text-slate-800">{editing ? "Edit task" : "New task"}</h3>
              <button
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                onClick={closeForm}
                aria-label="Close"
              >
                <Icon name="close" className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              <EntryForm
                key={editing?.id ?? "new"}
                editorId={profile.id}
                existing={editing ?? undefined}
                onSubmit={async (data) => {
                  if (editing) await updateEntry(editing.id, data);
                  else await addEntry(data);
                  closeForm();
                }}
                onCancel={closeForm}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
