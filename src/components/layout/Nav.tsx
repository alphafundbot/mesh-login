
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Binary,
  LayoutDashboard,
  ShieldCheck,
  History,
  Palette,
  Camera,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/audit", label: "Audit Trail AI", icon: ShieldCheck },
  { href: "/validator", label: "Config Validator", icon: Binary },
  { href: "/history", label: "Signal Memory", icon: History },
];

const snapshotItems = [
    { href: "/snapshots/telecom-anomaly", label: "Telecom Anomaly 2025-08-08"},
]

export default function Nav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              tooltip={{ children: item.label }}
            >
              <a>
                <item.icon />
                <span>{item.label}</span>
              </a>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
       <SidebarMenuItem>
          <SidebarMenuButton
            tooltip={{ children: "Snapshots" }}
            isActive={pathname.startsWith('/snapshots')}
          >
            <Camera />
            <span>Snapshots</span>
          </SidebarMenuButton>
          <SidebarMenuSub>
            {snapshotItems.map((item) => (
              <SidebarMenuSubItem key={item.href}>
                <Link href={item.href} passHref legacyBehavior>
                    <SidebarMenuSubButton asChild isActive={pathname === item.href}>
                        <a>{item.label}</a>
                    </SidebarMenuSubButton>
                </Link>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </SidebarMenuItem>
    </SidebarMenu>
  );
}
