
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";
import { UserProvider } from "@/hooks/use-user";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
        <UserProvider>
            <SidebarProvider>
                {children}
                <Toaster />
            </SidebarProvider>
        </UserProvider>
    </QueryClientProvider>
  );
}
