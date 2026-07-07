"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { TEAMS, FOCUS_OPTIONS } from "@/lib/roster";
import { ROLE_LABELS } from "@/lib/constants";
import type { Profile, Role } from "@/lib/types";

const ROLES: Role[] = ["editor", "manager"];

export default function AdminPage() {
  const { profiles, upsertProfile, mode, entries } = useStore();
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", fullName: "", email: "", role: "editor" as Role, pod: "", focus: "" });

  const filtered = profiles
    .filter(
      (p) =>
        p.fullName.toLowerCase().includes(q.toLowerCase()) ||
        p.username.toLowerCase().includes(q.toLowerCase()) ||
        (p.email ?? "").toLowerCase().includes(q.toLowerCase())
    )
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  // Teams = the known managers' teams plus any team already assigned to
  // someone (so a manager can create a brand-new team just by typing it).
  const allTeams = useMemo(() => {
    const set = new Set<string>(TEAMS);
    profiles.forEach((p) => p.pod && set.add(p.pod));
    return Array.from(set).sort();
  }, [profiles]);

  function entryCount(id: string) {
    return entries.filter((e) => e.editorId === id).length;
  }

  async function patch(p: Profile, changes: Partial<Profile>) {
    await upsertProfile({ ...p, ...changes });
  }

  async function addUser() {
    if (!newUser.username.trim() || !newUser.fullName.trim()) return;
    await upsertProfile({
      id: "u_" + newUser.username.trim().toLowerCase(),
      username: newUser.username.trim().toLowerCase(),
      fullName: newUser.fullName.trim(),
      email: newUser.email.trim() || null,
      role: newUser.role,
      pod: newUser.pod || null,
      focus: newUser.focus || null,
      wfh: false,
      title: null,
      active: true,
    });
    setNewUser({ username: "", fullName: "", email: "", role: "editor", pod: "", focus: "" });
    setAdding(false);
  }

  return (
    <div className="space-y-5">
      <datalist id="teams-list">
        {allTeams.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          className="input w-64"
          placeholder="Search users…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {mode === "local" && (
          <button className="btn-primary" onClick={() => setAdding((a) => !a)}>
            {adding ? "Close" : "+ Add user"}
          </button>
        )}
      </div>

      {mode === "cloud" && (
        <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Cloud mode: new sign-in accounts are created with the seed script
          (<code className="rounded bg-amber-100 px-1">npm run seed</code>) or the Supabase
          dashboard. You can still edit roles, teams &amp; focus here.
        </div>
      )}

      {adding && mode === "local" && (
        <div className="card grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-6">
          <input
            className="input"
            placeholder="username"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          />
          <input
            className="input"
            placeholder="Full name"
            value={newUser.fullName}
            onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
          />
          <input
            className="input"
            placeholder="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <select
            className="input"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
          <input
            className="input"
            list="teams-list"
            placeholder="Team (type to add new)"
            value={newUser.pod}
            onChange={(e) => setNewUser({ ...newUser, pod: e.target.value })}
          />
          <div className="flex gap-2">
            <select
              className="input"
              value={newUser.focus}
              onChange={(e) => setNewUser({ ...newUser, focus: e.target.value })}
            >
              <option value="">Focus…</option>
              {FOCUS_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <button className="btn-primary" onClick={addUser}>Save</button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="scroll-x">
          <table className="w-full min-w-[960px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="th">Name</th>
                <th className="th">Email</th>
                <th className="th">Role</th>
                <th className="th">Team</th>
                <th className="th">Focus</th>
                <th className="th text-center">Entries</th>
                <th className="th text-center">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="td">
                    <div className="font-medium text-slate-800">
                      {p.fullName}
                      {p.wfh && (
                        <span className="ml-1.5 rounded bg-slate-100 px-1 text-[10px] font-semibold text-slate-500">WFH</span>
                      )}
                    </div>
                    <div className="font-mono text-[11px] text-slate-400">{p.username}</div>
                  </td>
                  <td className="td text-xs text-slate-500">{p.email ?? "—"}</td>
                  <td className="td">
                    <select
                      className="input py-1 text-xs"
                      value={p.role}
                      onChange={(e) => patch(p, { role: e.target.value as Role })}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="td">
                    <input
                      className="input py-1 text-xs"
                      list="teams-list"
                      value={p.pod ?? ""}
                      placeholder="—"
                      onChange={(e) => patch(p, { pod: e.target.value || null })}
                    />
                  </td>
                  <td className="td">
                    <select
                      className="input py-1 text-xs"
                      value={p.focus ?? ""}
                      onChange={(e) => patch(p, { focus: e.target.value || null })}
                    >
                      <option value="">—</option>
                      {FOCUS_OPTIONS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </td>
                  <td className="td text-center text-slate-500">{entryCount(p.id)}</td>
                  <td className="td text-center">
                    <button
                      onClick={() => patch(p, { active: !p.active })}
                      className={`h-5 w-9 rounded-full transition ${
                        p.active ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`block h-4 w-4 rounded-full bg-white transition ${
                          p.active ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
