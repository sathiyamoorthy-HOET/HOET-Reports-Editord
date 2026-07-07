"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import EntryForm from "@/components/EntryForm";
import { CategoryPill, Empty, StatCard, StatusBadge } from "@/components/ui";
import { CATEGORIES } from "@/lib/constants";
import { formatDuration, monthKey, currentMonthKey, prettyDate, todayStr } from "@/lib/format";
import type { WorkEntry } from "@/lib/types";

export default function MyWorkPage() {
  const { profile, entries, addEntry, updateEntry, deleteEntry } = useStore();
  const [editing, setEditing] = useState<WorkEntry | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const mine = useMemo(
    () => entries.filter((e) => e.editorId === profile?.id),
    [entries, profile]
  );

  const today = todayStr();
  const thisMonth = currentMonthKey();
  const todays = mine.filter((e) => e.workDate === today);
  const monthEntries = mine.filter((e) => monthKey(e.workDate) === thisMonth);

  const monthCounts = CATEGORIES.map((c) => ({
    ...c,
    n: monthEntries.filter((e) => e.category === c.value).length,
  }));
  const monthDuration = monthEntries.reduce((a, e) => a + e.durationSeconds, 0);

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

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        <StatCard label="Today" value={todays.length} sub="videos logged" />
        <StatCard label="This month" value={monthEntries.length} sub="total videos" accent="#10b981" />
        <StatCard label="Month duration" value={formatDuration(monthDuration)} accent="#f59e0b" />
        <StatCard
          label="Approved"
          value={monthEntries.filter((e) => e.status === "approved" || e.status === "published").length}
          sub="this month"
          accent="#4f46e5"
        />
        {monthCounts.map((c) => (
          <StatCard key={c.value} label={c.label} value={c.n} accent={c.color} />
        ))}
      </div>

      {/* Entries sheet (default view) */}
      <div className="card">
        <div className="flex items-center justify-between gap-3 px-5 py-3">
          <div>
            <h2 className="font-semibold text-slate-800">My Work</h2>
            <span className="text-xs text-slate-400">{mine.length} entries</span>
          </div>
          <button className="btn-primary" onClick={openNew}>
            + New Task
          </button>
        </div>
        {mine.length === 0 ? (
          <div className="p-5">
            <Empty title="No entries yet" hint="Click “New Task” to log your first video." />
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
                {mine.map((e) => (
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
                          <a href={e.reviewLink} target="_blank" className="text-brand-600 hover:underline">
                            Review ↗
                          </a>
                        )}
                        {e.finalLink && (
                          <a href={e.finalLink} target="_blank" className="text-emerald-600 hover:underline">
                            Final ↗
                          </a>
                        )}
                        {!e.reviewLink && !e.finalLink && <span className="text-slate-300">—</span>}
                      </div>
                    </td>
                    <td className="td whitespace-nowrap">
                      <div className="flex gap-1">
                        <button
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-brand-600"
                          onClick={() => openEdit(e)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          onClick={() => {
                            if (confirm("Delete this entry?")) deleteEntry(e.id);
                          }}
                          title="Delete"
                        >
                          🗑️
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
          <div
            className="card my-8 w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <h3 className="font-semibold text-slate-800">
                {editing ? "Edit task" : "New task"}
              </h3>
              <button
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                onClick={closeForm}
                aria-label="Close"
              >
                ✕
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
