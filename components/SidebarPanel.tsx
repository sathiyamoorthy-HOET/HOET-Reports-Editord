"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Icon } from "./icons";
import {
  currentMonthKey,
  daysInMonth,
  formatDuration,
  monthLabel,
  todayStr,
} from "@/lib/format";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function shiftMonth(mk: string, delta: number): string {
  const [y, m] = mk.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function SidebarPanel() {
  const { entries } = useStore();
  const router = useRouter();
  const today = todayStr();
  const [mk, setMk] = useState(currentMonthKey());

  // Today's quick summary (global)
  const todays = entries.filter((e) => e.workDate === today);
  const todayDuration = todays.reduce((a, e) => a + e.durationSeconds, 0);
  const activeToday = new Set(todays.map((e) => e.editorId)).size;

  // Days in the viewed month that have any entries
  const daysWithWork = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => {
      if (e.workDate.startsWith(mk)) set.add(e.workDate);
    });
    return set;
  }, [entries, mk]);

  const [y, m] = mk.split("-").map(Number);
  const firstWeekday = new Date(y, m - 1, 1).getDay();
  const total = daysInMonth(mk);
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];

  function goToDay(day: number) {
    const dateStr = `${mk}-${String(day).padStart(2, "0")}`;
    router.push(`/daily?date=${dateStr}`);
  }

  return (
    <div className="space-y-3 px-3 py-2">
      {/* Today mini-summary */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Today
        </div>
        <div className="grid grid-cols-3 gap-1 text-center">
          <div>
            <div className="text-lg font-bold text-brand-600">{todays.length}</div>
            <div className="text-[10px] text-slate-400">videos</div>
          </div>
          <div>
            <div className="text-lg font-bold text-emerald-600">{activeToday}</div>
            <div className="text-[10px] text-slate-400">editors</div>
          </div>
          <div>
            <div className="text-sm font-bold text-amber-600">{formatDuration(todayDuration)}</div>
            <div className="text-[10px] text-slate-400">duration</div>
          </div>
        </div>
      </div>

      {/* Monthly calendar */}
      <div className="rounded-xl border border-slate-200 p-3">
        <div className="mb-2 flex items-center justify-between">
          <button
            className="rounded p-1 text-slate-400 hover:bg-slate-100"
            onClick={() => setMk((k) => shiftMonth(k, -1))}
            aria-label="Previous month"
          >
            <Icon name="chevronLeft" className="h-4 w-4" />
          </button>
          <span className="text-xs font-semibold text-slate-700">{monthLabel(mk)}</span>
          <button
            className="rounded p-1 text-slate-400 hover:bg-slate-100"
            onClick={() => setMk((k) => shiftMonth(k, 1))}
            aria-label="Next month"
          >
            <Icon name="chevronRight" className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className="py-1 text-[10px] font-medium text-slate-400">
              {d}
            </div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={i} />;
            const dateStr = `${mk}-${String(day).padStart(2, "0")}`;
            const isToday = dateStr === today;
            const hasWork = daysWithWork.has(dateStr);
            return (
              <button
                key={i}
                onClick={() => goToDay(day)}
                className={`relative flex h-7 items-center justify-center rounded-md text-xs transition ${
                  isToday
                    ? "bg-brand-600 font-semibold text-white"
                    : hasWork
                    ? "font-medium text-slate-700 hover:bg-slate-100"
                    : "text-slate-400 hover:bg-slate-100"
                }`}
                title={hasWork ? "Has entries — open in Daily" : "Open in Daily"}
              >
                {day}
                {hasWork && !isToday && (
                  <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
