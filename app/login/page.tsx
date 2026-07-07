"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { landingFor } from "@/lib/nav";
import { Logo } from "@/components/ui";
import { ROSTER } from "@/lib/roster";
import { ROLE_LABELS } from "@/lib/constants";

export default function LoginPage() {
  const { ready, profile, mode, signIn } = useStore();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && profile) router.replace(landingFor(profile.role));
  }, [ready, profile, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await signIn(username, password);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Sign in failed");
      return;
    }
  }

  const demoAccounts = [
    ROSTER.find((r) => r.username === "krishna"),
    ROSTER.find((r) => r.username === "sathiya"),
    ROSTER.find((r) => r.username === "vyshak"),
    ROSTER.find((r) => r.username === "admin"),
  ].filter(Boolean) as typeof ROSTER;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-slate-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo size={52} />
          <h1 className="mt-3 text-2xl font-bold text-slate-800">
            House of EduTech
          </h1>
          <p className="text-sm text-slate-500">Video Editing — Work Report</p>
        </div>

        <form onSubmit={submit} className="card p-6">
          <div className="mb-4">
            <label className="label">Username</label>
            <input
              className="input"
              placeholder="e.g. krishna"
              autoCapitalize="none"
              autoCorrect="off"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>
          <div className="mb-4">
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              placeholder={mode === "local" ? "Hoet@2026" : "••••••••"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {mode === "local" && (
          <div className="card mt-4 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-700">
                Demo mode
              </span>
              Quick sign-in
            </div>
            <p className="mb-3 text-xs text-slate-500">
              Password for all demo accounts:{" "}
              <code className="rounded bg-slate-100 px-1">Hoet@2026</code> (or leave
              blank). Try each role:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((a) => (
                <button
                  key={a.username}
                  onClick={() => {
                    setUsername(a.username);
                    setPassword("Hoet@2026");
                  }}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-left text-sm hover:border-brand-300 hover:bg-brand-50"
                >
                  <div className="font-medium text-slate-700">{a.fullName}</div>
                  <div className="text-xs text-slate-400">
                    {ROLE_LABELS[a.role]}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-slate-400">
          {mode === "cloud"
            ? "Connected to shared cloud database — updates sync across all devices."
            : "Running locally — data is saved in this browser and syncs across tabs."}
        </p>
      </div>
    </div>
  );
}
