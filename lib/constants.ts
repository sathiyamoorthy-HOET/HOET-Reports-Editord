import type { Category, Status } from "./types";

export const CATEGORIES: { value: Category; label: string; short: string; color: string }[] = [
  { value: "organic", label: "Organic", short: "Organic", color: "#10b981" },
  { value: "ads", label: "Ads", short: "Ads", color: "#6366f1" },
  { value: "reash", label: "ReAsh", short: "RAsh", color: "#f59e0b" },
  { value: "course", label: "Course", short: "Course", color: "#ec4899" },
];

export const STATUSES: { value: Status; label: string; color: string }[] = [
  { value: "editing", label: "Editing", color: "#64748b" },
  { value: "under_review", label: "Under Review", color: "#f59e0b" },
  { value: "revisions", label: "Revisions", color: "#ef4444" },
  { value: "approved", label: "Approved", color: "#10b981" },
  { value: "published", label: "Published", color: "#4f46e5" },
];

export function categoryMeta(value: Category) {
  return CATEGORIES.find((c) => c.value === value)!;
}

export function statusMeta(value: Status) {
  return STATUSES.find((s) => s.value === value) ?? STATUSES[0];
}

export const ROLE_LABELS: Record<string, string> = {
  editor: "Editor",
  manager: "Manager",
};
