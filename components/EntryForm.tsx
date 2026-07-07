"use client";

import { useState } from "react";
import { CATEGORIES, STATUSES } from "@/lib/constants";
import { splitDuration, toSeconds, todayStr } from "@/lib/format";
import type { Category, NewWorkEntry, Status, WorkEntry } from "@/lib/types";

interface Props {
  editorId: string;
  existing?: WorkEntry;
  onSubmit: (e: NewWorkEntry) => Promise<void>;
  onCancel?: () => void;
}

export default function EntryForm({ editorId, existing, onSubmit, onCancel }: Props) {
  const init = existing;
  const dur = splitDuration(init?.durationSeconds ?? 0);
  const [workDate, setWorkDate] = useState(init?.workDate ?? todayStr());
  const [videoCode, setVideoCode] = useState(init?.videoCode ?? "");
  const [title, setTitle] = useState(init?.title ?? "");
  const [category, setCategory] = useState<Category>(init?.category ?? "ads");
  const [minutes, setMinutes] = useState(dur.minutes);
  const [seconds, setSeconds] = useState(dur.seconds);
  const [status, setStatus] = useState<Status>(init?.status ?? "editing");
  const [reviewLink, setReviewLink] = useState(init?.reviewLink ?? "");
  const [finalLink, setFinalLink] = useState(init?.finalLink ?? "");
  const [remarks, setRemarks] = useState(init?.remarks ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setErr("Video title is required.");
      return;
    }
    setErr("");
    setBusy(true);
    try {
      await onSubmit({
        editorId,
        workDate,
        videoCode: videoCode.trim(),
        title: title.trim(),
        category,
        durationSeconds: toSeconds(minutes, seconds),
        reviewLink: reviewLink.trim(),
        finalLink: finalLink.trim(),
        status,
        remarks: remarks.trim(),
      });
      if (!existing) {
        // reset for the next quick entry
        setVideoCode("");
        setTitle("");
        setMinutes(0);
        setSeconds(0);
        setReviewLink("");
        setFinalLink("");
        setRemarks("");
        setStatus("editing");
      }
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Date</label>
          <input
            type="date"
            className="input"
            value={workDate}
            onChange={(e) => setWorkDate(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Video Code</label>
          <input
            className="input"
            placeholder="e.g. BE-AD-0142"
            value={videoCode}
            onChange={(e) => setVideoCode(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="label">Video Title *</label>
        <input
          className="input"
          placeholder="e.g. Excel AI Workshop – 3hr Promo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c.value}
                onClick={() => setCategory(c.value)}
                className="rounded-lg border px-3 py-1.5 text-sm font-medium transition"
                style={
                  category === c.value
                    ? { backgroundColor: c.color, borderColor: c.color, color: "#fff" }
                    : { borderColor: "#e2e8f0", color: "#475569" }
                }
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Duration</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              className="input"
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
            />
            <span className="text-sm text-slate-400">min</span>
            <input
              type="number"
              min={0}
              max={59}
              className="input"
              value={seconds}
              onChange={(e) => setSeconds(Number(e.target.value))}
            />
            <span className="text-sm text-slate-400">sec</span>
          </div>
        </div>
      </div>

      <div>
        <label className="label">Status</label>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              type="button"
              key={s.value}
              onClick={() => setStatus(s.value)}
              className="rounded-full border px-3 py-1 text-xs font-medium transition"
              style={
                status === s.value
                  ? { backgroundColor: `${s.color}18`, borderColor: s.color, color: s.color }
                  : { borderColor: "#e2e8f0", color: "#64748b" }
              }
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Review Link</label>
          <input
            className="input"
            placeholder="https://drive.google.com/…"
            value={reviewLink}
            onChange={(e) => setReviewLink(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Final Link</label>
          <input
            className="input"
            placeholder="https://youtu.be/…"
            value={finalLink}
            onChange={(e) => setFinalLink(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="label">Daily Report / Remarks</label>
        <textarea
          className="input min-h-[70px]"
          placeholder="Notes, blockers, rework, HeyGen/ElevenLabs work, etc."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </div>

      {err && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}

      <div className="flex items-center gap-2">
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Saving…" : existing ? "Save changes" : "Add entry"}
        </button>
        {onCancel && (
          <button type="button" className="btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
