"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';
import { ChevronRight, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Domain = {
  name: string;
  slug: string;
  icon: LucideIcon;
  modules: string[];
  status: string;
};

const SENSITIVE_MODULES = ["Consent Ledger", "Medical Vault", "SIM Vault", "Identity Vault", "Secret Vault", "Biometric Router"];

export default function ModuleClient({ domain, moduleName }: { domain: Domain, moduleName: string }) {
  const isSensitive = SENSITIVE_MODULES.includes(moduleName);

  return (
    <div className="space-y-6">
        <div className="flex items-center text-sm text-muted-foreground">
            <Link href={`/domain/${domain.slug}`} className="hover:text-foreground">{domain.name}</Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-foreground">{moduleName}</span>
        </div>
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{moduleName}</h1>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Module Status</CardTitle>
            <CardDescription>Live operational data for this module.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Module-specific intelligence feed coming soon.</p>
             <div className="space-y-2 mt-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
            <CardTitle>Strategist Actions</CardTitle>
            <CardDescription>Perform module-specific actions and overrides.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
            <Button disabled>Action 1</Button>
            <Button disabled variant="secondary">Action 2</Button>
            <Button disabled variant="destructive">Emergency Override</Button>
            {isSensitive && (
                <Button disabled variant="destructive">
                    <Lock className="mr-2 h-4 w-4" />
                    Lock Module
                </Button>
            )}
        </CardContent>
      </Card>

    </div>
  );
}
