"use client";

import { useState } from "react";
import { snapshotRegistry, type Snapshot } from "@/lib/snapshots";
import SnapshotClient from "../[slug]/SnapshotClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SnapshotDiffClient() {
  const [snapshotA, setSnapshotA] = useState<Snapshot | null>(null);
  const [snapshotB, setSnapshotB] = useState<Snapshot | null>(null);

  const handleSelectA = (slug: string) => {
    const selected = snapshotRegistry.find((s) => s.slug === slug) || null;
    setSnapshotA(selected);
  };

  const handleSelectB = (slug: string) => {
    const selected = snapshotRegistry.find((s) => s.slug === slug) || null;
    setSnapshotB(selected);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Snapshots to Compare</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4 items-center">
            <Select onValueChange={handleSelectA}>
              <SelectTrigger>
                <SelectValue placeholder="Select Snapshot A" />
              </SelectTrigger>
              <SelectContent>
                {snapshotRegistry.map((s) => (
                  <SelectItem key={s.slug} value={s.slug}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={handleSelectB}>
              <SelectTrigger>
                <SelectValue placeholder="Select Snapshot B" />
              </SelectTrigger>
              <SelectContent>
                {snapshotRegistry.map((s) => (
                  <SelectItem key={s.slug} value={s.slug}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          {snapshotA ? (
            <div className="space-y-2">
                 <h2 className="text-2xl font-bold tracking-tight">{snapshotA.label}</h2>
                 <p className="text-muted-foreground">{snapshotA.description}</p>
                 <SnapshotClient snapshot={snapshotA} />
            </div>
          ) : (
            <Card className="flex items-center justify-center h-96">
                <p className="text-muted-foreground">Select Snapshot A to view its data</p>
            </Card>
          )}
        </div>
        <div>
          {snapshotB ? (
            <div className="space-y-2">
                 <h2 className="text-2xl font-bold tracking-tight">{snapshotB.label}</h2>
                 <p className="text-muted-foreground">{snapshotB.description}</p>
                 <SnapshotClient snapshot={snapshotB} />
            </div>
          ) : (
             <Card className="flex items-center justify-center h-96">
                <p className="text-muted-foreground">Select Snapshot B to view its data</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
