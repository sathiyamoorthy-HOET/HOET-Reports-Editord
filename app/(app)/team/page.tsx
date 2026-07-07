"use client";

import { useState } from "react";
import { RESPONSIBILITY_MATRIX, SOP_SECTIONS } from "@/lib/team";

const PRIORITY_COLORS: Record<string, string> = {
  P1: "#ef4444",
  P2: "#f59e0b",
  P3: "#64748b",
};

export default function TeamPage() {
  const [tab, setTab] = useState<"matrix" | "sop">("matrix");

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          className={`btn ${tab === "matrix" ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
          onClick={() => setTab("matrix")}
        >
          Responsibility Matrix
        </button>
        <button
          className={`btn ${tab === "sop" ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
          onClick={() => setTab("sop")}
        >
          SOP Checklist
        </button>
      </div>

      {tab === "matrix" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {RESPONSIBILITY_MATRIX.map((m) => (
            <div key={m.manager} className="card p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">{m.manager}</div>
                  <div className="text-xs text-slate-400">{m.role}</div>
                </div>
              </div>
              <ul className="space-y-2">
                {m.items.map((it, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span
                      className="mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold"
                      style={{
                        backgroundColor: it.scope === "Own Team" ? "#eef2ff" : "#f1f5f9",
                        color: it.scope === "Own Team" ? "#4f46e5" : "#64748b",
                      }}
                    >
                      {it.scope === "Own Team" ? "OWN" : "TEAM"}
                    </span>
                    <span className="flex-1 text-slate-600">{it.task}</span>
                    {it.priority && (
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white"
                        style={{ backgroundColor: PRIORITY_COLORS[it.priority] ?? "#64748b" }}
                      >
                        {it.priority}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {tab === "sop" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {SOP_SECTIONS.map((s) => (
            <div key={s.title} className="card p-5">
              <h3 className="mb-3 font-semibold text-slate-800">{s.title}</h3>
              <ul className="space-y-2">
                {s.items.map((it, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
