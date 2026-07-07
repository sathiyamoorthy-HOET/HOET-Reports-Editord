"use client";

import React from "react";
import { statusMeta, categoryMeta } from "@/lib/constants";
import type { Category, Status } from "@/lib/types";
import { Icon } from "./icons";

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl bg-brand-600 font-bold text-white shadow-sm"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      HE
    </div>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const m = statusMeta(status);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${m.color}18`, color: m.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.color }} />
      {m.label}
    </span>
  );
}

export function CategoryPill({ category }: { category: Category }) {
  const m = categoryMeta(category);
  return (
    <span
      className="inline-flex rounded-md px-2 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: `${m.color}18`, color: m.color }}
    >
      {m.label}
    </span>
  );
}

export function StatCard({
  label,
  value,
  sub,
  accent = "#4f46e5",
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="card p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-slate-800" style={{ color: accent }}>
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
    </div>
  );
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center">
      <Icon name="inbox" className="h-8 w-8 text-slate-300" />
      <div className="mt-2 font-medium text-slate-600">{title}</div>
      {hint && <div className="mt-1 max-w-sm text-sm text-slate-400">{hint}</div>}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-20 text-slate-400">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
