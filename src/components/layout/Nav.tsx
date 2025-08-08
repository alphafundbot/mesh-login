
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
  { href: "/analysis-archive", label: "Analysis Archive", icon: Archive },
  { href: "/forecast-archive", label: "Forecast Archive", icon: Eye },
];

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
            {snapshotRegistry.map((item) => (
              <SidebarMenuSubItem key={item.slug}>
                <Link href={`/snapshots/${item.slug}`} passHref legacyBehavior>
                    <SidebarMenuSubButton asChild isActive={pathname === `/snapshots/${item.slug}`}>
                        <a>{item.label}</a>
                    </SidebarMenuSubButton>
                </Link>
              </SidebarMenuSubItem>
            ))}
             <SidebarMenuSubItem>
                <Link href="/snapshots/diff" passHref legacyBehavior>
                    <SidebarMenuSubButton asChild isActive={pathname === '/snapshots/diff'}>
                        <a><GitCompareArrows className="mr-2 h-4 w-4" />Diff Snapshots</a>
                    </SidebarMenuSubButton>
                </Link>
              </SidebarMenuSubItem>
          </SidebarMenuSub>
        </SidebarMenuItem>
    </SidebarMenu>
  );
}
