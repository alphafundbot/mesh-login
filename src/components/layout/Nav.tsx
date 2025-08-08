
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
  GitCompareArrows,
  Archive,
  Eye,
  Brain,
  Wifi,
  Settings,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { snapshotRegistry } from "@/lib/snapshots";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/audit", label: "Audit Trail AI", icon: ShieldCheck },
  { href: "/validator", label: "Config Validator", icon: Binary },
  { href: "/history", label: "Signal Memory", icon: History },
  { href: "/memory-map", label: "Memory Map", icon: Brain },
  { href: "/analysis-archive", label: "Analysis Archive", icon: Archive },
  { href: "/forecast-archive", label: "Forecast Archive", icon: Eye },
];

const systemItems = [
    { href: "/status", label: "API Status", icon: Wifi },
    { href: "/admin", label: "System Admin", icon: Settings },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href}>
            <SidebarMenuButton
              isActive={pathname === item.href}
              tooltip={{ children: item.label }}
            >
              <item.icon />
              <span>{item.label}</span>
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
            {snapshotRegistry.map((item) => (
              <SidebarMenuSubItem key={item.slug}>
                <SidebarMenuSubButton asChild isActive={pathname === `/snapshots/${item.slug}`}>
                    <Link href={`/snapshots/${item.slug}`}>
                        {item.label}
                    </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
             <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild isActive={pathname === '/snapshots/diff'}>
                    <Link href="/snapshots/diff">
                        <GitCompareArrows className="mr-2 h-4 w-4" />
                        Diff Snapshots
                    </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
          </SidebarMenuSub>
        </SidebarMenuItem>
        <SidebarSeparator className="my-2" />
        {systemItems.map((item) => (
            <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                    <SidebarMenuButton
                        isActive={pathname === item.href}
                        tooltip={{ children: item.label }}
                    >
                        <item.icon />
                        <span>{item.label}</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
        ))}
    </SidebarMenu>
  );
}
