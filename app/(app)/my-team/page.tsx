"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/constants";
import { currentMonthKey, formatDuration, monthKey } from "@/lib/format";
import { Empty, StatCard } from "@/components/ui";
import type { Category, Profile } from "@/lib/types";

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function MyTeamPage() {
  const { profile, profiles, entries } = useStore();

  // The team label: a manager owns the team named after their username;
  // an editor belongs to the team stored in their pod.
  const teamLabel =
    profile?.role === "manager" ? cap(profile.username) : profile?.pod ?? null;

  const lead = useMemo(
    () =>
      profiles.find(
        (p) => p.role === "manager" && cap(p.username) === teamLabel
      ) ?? null,
    [profiles, teamLabel]
  );

  const members = useMemo(
    () =>
      profiles
        .filter((p) => p.role === "editor" && p.active && p.pod === teamLabel)
        .sort((a, b) => a.fullName.localeCompare(b.fullName)),
    [profiles, teamLabel]
  );

  const mk = currentMonthKey();
  function statsFor(id: string) {
    const list = entries.filter((e) => e.editorId === id && monthKey(e.workDate) === mk);
    const counts: Record<Category, number> = { organic: 0, ads: 0, reash: 0, course: 0 };
    let dur = 0;
    list.forEach((e) => {
      counts[e.category] += 1;
      dur += e.durationSeconds;
    });
    return { total: list.length, dur, counts };
  }

  const teamTotals = members.reduce(
    (acc, m) => {
      const s = statsFor(m.id);
      acc.total += s.total;
      acc.dur += s.dur;
      if (s.total > 0) acc.active += 1;
      return acc;
    },
    { total: 0, dur: 0, active: 0 }
  );

  if (!profile) return null;

  if (!teamLabel) {
    return (
      <Empty
        title="No team assigned yet"
        hint="Ask a manager to assign you to a team on the Team & Users page."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Team header */}
      <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{teamLabel}'s Team</h2>
          <p className="text-sm text-slate-500">
            Lead: {lead ? lead.fullName : teamLabel} · {members.length} editors
          </p>
        </div>
        <div className="text-xs text-slate-400">Figures shown for the current month</div>
      </div>

      {/* Team totals this month */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Team videos" value={teamTotals.total} sub="this month" />
        <StatCard label="Active editors" value={`${teamTotals.active}/${members.length}`} accent="#10b981" />
        <StatCard label="Team duration" value={formatDuration(teamTotals.dur)} accent="#f59e0b" />
      </div>

      {/* Members */}
      {members.length === 0 ? (
        <Empty title="No editors in this team yet" hint="Assign editors on the Team & Users page." />
      ) : (
        <div className="card">
          <div className="scroll-x">
            <table className="w-full min-w-[820px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className="th">Editor</th>
                  <th className="th">Email</th>
                  <th className="th">Focus</th>
                  {CATEGORIES.map((c) => (
                    <th key={c.value} className="th text-center">{c.label}</th>
                  ))}
                  <th className="th text-center">Total</th>
                  <th className="th">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m: Profile) => {
                  const s = statsFor(m.id);
                  return (
                    <tr key={m.id} className={s.total === 0 ? "text-slate-400" : "hover:bg-slate-50"}>
                      <td className="td">
                        <div className="font-medium text-slate-800">
                          {m.fullName}
                          {m.wfh && (
                            <span className="ml-1.5 rounded bg-slate-100 px-1 text-[10px] font-semibold text-slate-500">
                              WFH
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="td text-xs text-slate-500">{m.email ?? "—"}</td>
                      <td className="td">
                        {m.focus ? (
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                            {m.focus}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      {CATEGORIES.map((c) => (
                        <td key={c.value} className="td text-center">
                          {s.counts[c.value] || <span className="text-slate-300">·</span>}
                        </td>
                      ))}
                      <td className="td text-center font-semibold">
                        {s.total || <span className="text-slate-300">·</span>}
                      </td>
                      <td className="td whitespace-nowrap">
                        {s.dur ? formatDuration(s.dur) : <span className="text-slate-300">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
