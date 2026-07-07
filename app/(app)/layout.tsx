"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { navFor, canAccess, landingFor } from "@/lib/nav";
import { ROLE_LABELS } from "@/lib/constants";
import { Logo, Spinner } from "@/components/ui";
import { Icon } from "@/components/icons";
import SidebarPanel from "@/components/SidebarPanel";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { ready, profile, signOut, mode } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!profile) {
      router.replace("/login");
    } else if (!canAccess(profile.role, pathname)) {
      router.replace(landingFor(profile.role));
    }
  }, [ready, profile, pathname, router]);

  if (!ready || !profile) return <Spinner label="Loading…" />;

  const items = navFor(profile.role);
  const initials = profile.fullName
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white md:flex">
        <div className="flex items-center gap-2.5 px-5 py-4">
          <Logo />
          <div>
            <div className="text-sm font-bold leading-tight text-slate-800">
              House of EduTech
            </div>
            <div className="text-xs text-slate-400">Work Report</div>
          </div>
        </div>
        <nav className="space-y-1 px-3 py-2">
          {items.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon name={item.icon} className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <SidebarPanel />

        <div className="mt-auto border-t border-slate-100 p-3">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                mode === "cloud" ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            <span className="text-xs text-slate-400">
              {mode === "cloud" ? "Cloud — live sync" : "Local demo — tab sync"}
            </span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Menu"
            >
              <Icon name="menu" />
            </button>
            <div>
              <div className="text-sm font-semibold text-slate-800">
                {items.find((i) => pathname.startsWith(i.href))?.label ?? "Dashboard"}
              </div>
              <div className="text-xs text-slate-400">
                {profile.title ?? ROLE_LABELS[profile.role]}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium text-slate-700">
                {profile.fullName}
              </div>
              <div className="text-xs text-slate-400">
                {ROLE_LABELS[profile.role]}
                {profile.pod ? ` · Pod: ${profile.pod}` : ""}
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {initials}
            </div>
            <button
              onClick={async () => {
                await signOut();
                router.replace("/login");
              }}
              className="btn-ghost"
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Mobile nav drawer */}
        {menuOpen && (
          <nav className="border-b border-slate-200 bg-white px-3 py-2 md:hidden">
            {items.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                    active ? "bg-brand-50 text-brand-700" : "text-slate-600"
                  }`}
                >
                  <Icon name={item.icon} className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
