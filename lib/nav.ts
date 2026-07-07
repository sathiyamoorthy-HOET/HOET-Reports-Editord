import type { Role } from "./types";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  roles: Role[];
}

export const NAV: NavItem[] = [
  { href: "/my-work", label: "My Work", icon: "🎬", roles: ["editor", "manager"] },
  { href: "/my-week", label: "My Week", icon: "🗓️", roles: ["editor", "manager"] },
  { href: "/my-month", label: "My Month", icon: "📈", roles: ["editor", "manager"] },
  { href: "/daily", label: "Daily Dashboard", icon: "📅", roles: ["editor", "manager"] },
  { href: "/monthly", label: "Monthly Report", icon: "📊", roles: ["editor", "manager"] },
  { href: "/admin", label: "Team & Users", icon: "⚙️", roles: ["manager"] },
];

export function navFor(role: Role): NavItem[] {
  return NAV.filter((n) => n.roles.includes(role));
}

export function landingFor(role: Role): string {
  switch (role) {
    case "manager":
      return "/monthly";
    case "editor":
    default:
      return "/my-work";
  }
}

export function canAccess(role: Role, href: string): boolean {
  const item = NAV.find((n) => href.startsWith(n.href));
  return item ? item.roles.includes(role) : true;
}
