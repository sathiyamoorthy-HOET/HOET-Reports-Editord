import type { Role } from "./types";
import type { IconName } from "@/components/icons";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  roles: Role[];
}

export const NAV: NavItem[] = [
  { href: "/daily", label: "Daily Dashboard", icon: "dashboard", roles: ["editor", "manager"] },
  { href: "/my-work", label: "My Work", icon: "work", roles: ["editor", "manager"] },
  { href: "/my-team", label: "My Team", icon: "users", roles: ["editor", "manager"] },
  { href: "/monthly", label: "Monthly Report", icon: "chart", roles: ["editor", "manager"] },
  { href: "/admin", label: "Team & Users", icon: "cog", roles: ["manager"] },
];

export function navFor(role: Role): NavItem[] {
  return NAV.filter((n) => n.roles.includes(role));
}

export function landingFor(_role: Role): string {
  // Daily Dashboard is the common landing for everyone.
  return "/daily";
}

export function canAccess(role: Role, href: string): boolean {
  const item = NAV.find((n) => href.startsWith(n.href));
  return item ? item.roles.includes(role) : true;
}
