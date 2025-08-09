
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Timer, DatabaseZap } from "lucide-react";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { isBrowser } from "@/lib/env-check";

export default function MeshHydrationAudit() {
  const [mountTime, setMountTime] = useState<number | null>(null);
  const [pingTime, setPingTime] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isBrowser()) {
        setLoading(false);
        return;
    }
    setMountTime(Math.round(performance.now()));

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const startTime = performance.now();
          const docRef = doc(db, "intelligence_map_cache", "latest");
          await getDoc(docRef);
          const endTime = performance.now();
          setPingTime(Math.round(endTime - startTime));
        } catch (error) {
          console.error("Firestore ping failed:", error);
          setPingTime(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setPingTime(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const renderMetric = (Icon: React.ElementType, title: string, value: string | null, unit: string, isLoading: boolean) => (
     <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{title}</span>
        </div>
        {isLoading ? <Skeleton className="h-5 w-16" /> : (
            value !== null ? (
                <span className="font-mono text-sm">{value}{unit}</span>
            ) : (
                 <span className="font-mono text-sm text-destructive">Error</span>
            )
        )}
    </div>
  )

  return (
    <Card className="transition-shadow duration-300 hover:shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-2">
            <Timer className="h-6 w-6 text-accent" />
            <CardTitle>Mesh Hydration Audit</CardTitle>
        </div>
        <CardDescription>
          Real-time client mount and data layer latency metrics.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {renderMetric(Timer, "HUD Mount Time", mountTime?.toString() ?? null, "ms", !mountTime)}
        {renderMetric(DatabaseZap, "Firestore Ping", pingTime?.toString() ?? null, "ms", loading)}
      </CardContent>
    </Card>
  );
}
