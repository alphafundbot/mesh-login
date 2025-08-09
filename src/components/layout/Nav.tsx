
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
  BarChartHorizontal,
  FileClock,
  ClipboardList,
  TestTube,
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
  { href: "/history", label: "Signal Memory", icon: History },
  { href: "/memory-map", label: "Memory Map", icon: Brain },
];

const analysisItems = [
  { href: "/audit", label: "Audit Trail AI", icon: ShieldCheck },
  { href: "/validator", label: "Config Validator", icon: Binary },
  { href: "/analysis-archive", label: "Analysis Archive", icon: Archive },
];

const systemItems = [
    { href: "/status", label: "API Status", icon: Wifi },
    { href: "/admin", label: "System Admin", icon: Settings },
    { href: "/usage", label: "Usage Dashboard", icon: BarChartHorizontal },
    { href: "/queue", label: "Synthesis Queue", icon: FileClock },
    { href: "/simulation", label: "Simulator", icon: TestTube },
];

const SidebarGroupLabel = ({children}: {children: React.ReactNode}) => (
    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground group-data-[collapsible=icon]:hidden">
        {children}
    </div>
)


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
        <SidebarGroupLabel>Analysis</SidebarGroupLabel>
        {analysisItems.map((item) => (
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

        <SidebarSeparator className="my-2" />
         <SidebarGroupLabel>System</SidebarGroupLabel>
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

    