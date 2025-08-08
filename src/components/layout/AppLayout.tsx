import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Nav from "./Nav";
import { Button } from "../ui/button";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Button variant="ghost" className="h-10 w-full justify-start px-2 text-lg font-bold tracking-tighter">
            <SidebarTrigger className="mr-2" />
            <span className="group-data-[collapsible=icon]:hidden">Stratagem.ai</span>
          </Button>
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
