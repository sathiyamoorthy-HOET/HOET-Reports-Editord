import type { Role } from "./types";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  roles: Role[];
}

export const NAV: NavItem[] = [
  { href: "/my-work", label: "My Work", icon: "🎬", roles: ["editor", "deputy", "manager", "admin"] },
  { href: "/daily", label: "Daily Dashboard", icon: "📅", roles: ["deputy", "manager", "admin"] },
  { href: "/monthly", label: "Monthly Report", icon: "📊", roles: ["manager", "admin"] },
  { href: "/team", label: "Team & SOP", icon: "🗂️", roles: ["deputy", "manager", "admin"] },
  { href: "/admin", label: "Users", icon: "⚙️", roles: ["admin"] },
];

export function navFor(role: Role): NavItem[] {
  return NAV.filter((n) => n.roles.includes(role));
}

export function landingFor(role: Role): string {
  switch (role) {
    case "editor":
      return "/my-work";
    case "deputy":
      return "/daily";
    case "manager":
      return "/monthly";
    case "admin":
      return "/admin";
    default:
      return "/my-work";
  }
}

export function canAccess(role: Role, href: string): boolean {
  const item = NAV.find((n) => href.startsWith(n.href));
  return item ? item.roles.includes(role) : true;
}
