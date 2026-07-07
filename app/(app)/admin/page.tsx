"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { PODS } from "@/lib/roster";
import { ROLE_LABELS } from "@/lib/constants";
import type { Profile, Role } from "@/lib/types";

const ROLES: Role[] = ["editor", "deputy", "manager", "admin"];

export default function AdminPage() {
  const { profiles, upsertProfile, mode, entries } = useStore();
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", fullName: "", role: "editor" as Role, pod: "" });

  const filtered = profiles
    .filter(
      (p) =>
        p.fullName.toLowerCase().includes(q.toLowerCase()) ||
        p.username.toLowerCase().includes(q.toLowerCase())
    )
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

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
      role: newUser.role,
      pod: newUser.pod || null,
      title: null,
      active: true,
    });
    setNewUser({ username: "", fullName: "", role: "editor", pod: "" });
    setAdding(false);
  }

  return (
    <div className="space-y-5">
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
          dashboard. You can still edit roles &amp; pods here.
        </div>
      )}

      {adding && mode === "local" && (
        <div className="card grid grid-cols-1 gap-3 p-4 sm:grid-cols-4">
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
          <select
            className="input"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <select
              className="input"
              value={newUser.pod}
              onChange={(e) => setNewUser({ ...newUser, pod: e.target.value })}
            >
              <option value="">No pod</option>
              {PODS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <button className="btn-primary" onClick={addUser}>Save</button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="scroll-x">
          <table className="w-full min-w-[720px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="th">Name</th>
                <th className="th">Username</th>
                <th className="th">Role</th>
                <th className="th">Pod</th>
                <th className="th text-center">Entries</th>
                <th className="th text-center">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="td font-medium text-slate-800">{p.fullName}</td>
                  <td className="td font-mono text-xs text-slate-500">{p.username}</td>
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
                    <select
                      className="input py-1 text-xs"
                      value={p.pod ?? ""}
                      onChange={(e) => patch(p, { pod: e.target.value || null })}
                    >
                      <option value="">—</option>
                      {PODS.map((pod) => (
                        <option key={pod} value={pod}>{pod}</option>
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
