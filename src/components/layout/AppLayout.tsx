
"use client";

import React, { useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import { useRouter, usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Nav from "./Nav";
import { Button, buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== "/login") {
      router.push("/login");
    }
  }, [user, loading, router, pathname]);
  
  if (loading || !user) {
    return (
       <div className="flex min-h-screen items-center justify-center">
          <div className="space-y-4">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-6 w-48" />
          </div>
       </div>
    );
  }

  return (
      <div className="flex min-h-screen">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "h-10 w-full justify-start px-2 text-lg font-bold tracking-tighter"
              )}
            >
              <SidebarTrigger className="mr-2" />
              <span className="group-data-[collapsible=icon]:hidden">
                Stratagem.ai
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <Nav />
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:hidden">
            <SidebarTrigger />
            <h1 className="text-lg font-bold tracking-tighter">Stratagem.ai</h1>
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </SidebarInset>
      </div>
  );
}
