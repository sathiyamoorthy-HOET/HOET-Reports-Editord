// The team roster, derived from the House of EduTech report sheets.
// The data lives in roster.data.json so both the app and the Node
// seed script (scripts/seed.mjs) read the exact same source.

import rosterData from "./roster.data.json";

export type Role = "editor" | "manager";

export interface RosterMember {
  username: string;
  fullName: string;
  email?: string;
  role: Role;
  pod?: string | null; // manager's team
  focus?: string | null; // content specialization
  wfh?: boolean;
  title?: string;
}

// Manager teams (editors are grouped under a manager)
export const TEAMS = ["Vyshak", "Sathiya", "Mukesh", "Kaustubh", "Dheemanth"];

// Content specializations
export const FOCUS_OPTIONS = ["Organic", "Course", "Ads", "Podcast"];

// Back-compat alias (older code referred to pods)
export const PODS = TEAMS;

export const ROSTER: RosterMember[] = rosterData as RosterMember[];

export function findMember(input: string): RosterMember | undefined {
  const q = input.trim().toLowerCase();
  return ROSTER.find(
    (m) =>
      m.username.toLowerCase() === q ||
      (m.email && m.email.toLowerCase() === q) ||
      m.fullName.toLowerCase() === q
  );
}
