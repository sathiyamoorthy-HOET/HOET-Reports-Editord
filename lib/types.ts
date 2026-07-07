import type { Role } from "./roster";

export type { Role };

export type Category = "organic" | "ads" | "reash" | "course";

export type Status =
  | "editing"
  | "under_review"
  | "revisions"
  | "approved"
  | "published";

export interface Profile {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  pod?: string | null;
  title?: string | null;
  active: boolean;
}

export interface WorkEntry {
  id: string;
  editorId: string; // profile.id
  editorName: string; // denormalised for convenience in demo mode
  pod?: string | null;
  workDate: string; // YYYY-MM-DD
  videoCode: string;
  title: string;
  category: Category;
  durationSeconds: number;
  reviewLink: string;
  finalLink: string;
  status: Status;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

export type NewWorkEntry = Omit<
  WorkEntry,
  "id" | "createdAt" | "updatedAt" | "editorName" | "pod"
>;
