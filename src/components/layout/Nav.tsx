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
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
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
  { href: "/status", label: "API Status", icon: Wifi },
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
                <Link href={`/snapshots/${item.slug}`}>
                    <SidebarMenuSubButton isActive={pathname === `/snapshots/${item.slug}`}>
                        {item.label}
                    </SidebarMenuSubButton>
                </Link>
              </SidebarMenuSubItem>
            ))}
             <SidebarMenuSubItem>
                <Link href="/snapshots/diff">
                    <SidebarMenuSubButton isActive={pathname === '/snapshots/diff'}>
                        <GitCompareArrows className="mr-2 h-4 w-4" />
                        Diff Snapshots
                    </SidebarMenuSubButton>
                </Link>
              </SidebarMenuSubItem>
          </SidebarMenuSub>
        </SidebarMenuItem>
    </SidebarMenu>
  );
}
