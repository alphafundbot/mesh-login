
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
  TestTube,
  LogOut,
  Code,
  CheckSquare,
  Network,
  Globe,
  DollarSign,
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
import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-user";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/history", label: "Signal Memory", icon: History },
  { href: "/memory-map", label: "Memory Map", icon: Brain },
  { href: "/financials", label: "Financials", icon: DollarSign },
];

const analysisItems = [
  { href: "/audit", label: "Audit Trail AI", icon: ShieldCheck },
  { href: "/validator", label: "Config Validator", icon: Binary },
  { href: "/analysis-archive", label: "Analysis Archive", icon: Archive },
];

const systemItems = [
    { href: "/status", label: "API Status", icon: Wifi },
    { href: "/apis", label: "API Management", icon: Network },
    { href: "/discovery", label: "API Discovery", icon: Globe },
    { href: "/admin", label: "System Admin", icon: Settings },
    { href: "/usage", label: "Usage Dashboard", icon: BarChartHorizontal },
    { href: "/queue", label: "Synthesis Queue", icon: FileClock },
    { href: "/simulation", label: "Simulator", icon: TestTube },
];

const metaItems = [
    { href: "/meta/code-intelligence", label: "Code Intelligence", icon: Code },
    { href: "/meta/meta-audit", label: "Meta-Audit", icon: CheckSquare },
]

const SidebarGroupLabel = ({children}: {children: React.ReactNode}) => (
    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground group-data-[collapsible=icon]:hidden">
        {children}
    </div>
)


export default function Nav() {
  const pathname = usePathname();
  const { user } = useUser();
  const { logOut } = useAuth();

  return (
    <SidebarMenu>
        <div className="flex flex-col h-full">
            <div className="flex-1">
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
                <SidebarMenuItem>
                    <Link href="/forecast-archive">
                        <SidebarMenuButton
                        isActive={pathname === "/forecast-archive"}
                        tooltip={{ children: "Forecast Archive" }}
                        >
                        <Eye />
                        <span>Forecast Archive</span>
                        </SidebarMenuButton>
                    </Link>
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
                
                    <SidebarSeparator className="my-2" />
                    <SidebarGroupLabel>Meta</SidebarGroupLabel>
                    {metaItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                            <Link href={item.href}>
                                <SidebarMenuButton
                                    isActive={pathname.startsWith(item.href)}
                                    tooltip={{ children: item.label }}
                                >
                                    <item.icon />
                                    <span>{item.label}</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    ))}
                </div>
            <div className="mt-auto">
                 <SidebarSeparator className="my-2" />
                 <SidebarMenuItem>
                    <SidebarMenuButton
                        onClick={logOut}
                        tooltip={{ children: "Logout" }}
                    >
                        <LogOut />
                        <span>Logout</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <div className="p-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                    <p className="font-semibold">{user?.name}</p>
                    <p>{user?.role}</p>
                </div>
            </div>
      </div>
    </SidebarMenu>
  );
}
