// The team roster, derived from the House of EduTech report sheets.
// The data lives in roster.data.json so both the app and the Node
// seed script (scripts/seed.mjs) read the exact same source.

import rosterData from "./roster.data.json";

export type Role = "editor" | "deputy" | "manager" | "admin";

export interface RosterMember {
  username: string;
  fullName: string;
  role: Role;
  pod?: string | null;
  title?: string;
}

// Reporting pods (AI generalists editors report into)
export const PODS = [
  "Sujal",
  "Paras",
  "Debasmitha",
  "Brijesh",
  "Sambhav",
  "Nisha",
  "Palas",
  "Astha",
  "Eshmith",
  "May/Raj",
];

export const ROSTER: RosterMember[] = rosterData as RosterMember[];

export function findMember(username: string): RosterMember | undefined {
  return ROSTER.find((m) => m.username.toLowerCase() === username.toLowerCase());
}
