
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  diffSnapshots,
  type SnapshotDiffOutput,
} from "@/ai/flows/snapshot-diff-flow";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, GitCompareArrows, ChevronsRight, FileText, Save } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function SnapshotDiffClient() {
  const [snapshotA, setSnapshotA] = useState<Snapshot | null>(null);
  const [snapshotB, setSnapshotB] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SnapshotDiffOutput | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSelectA = (slug: string) => {
    const selected = snapshotRegistry.find((s) => s.slug === slug) || null;
    setSnapshotA(selected);
    setResult(null);
  };

  const handleSelectB = (slug: string) => {
    const selected = snapshotRegistry.find((s) => s.slug === slug) || null;
    setSnapshotB(selected);
    setResult(null);
  };

  const handleCompare = async () => {
    if (!snapshotA || !snapshotB) {
      toast({
        variant: "destructive",
        title: "Selection Incomplete",
        description: "Please select two snapshots to compare.",
      });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const output = await diffSnapshots({
        snapshotALogs: snapshotA.data.logs,
        snapshotBLogs: snapshotB.data.logs,
      });
      setResult(output);
    } catch (error) {
      console.error("Snapshot comparison failed:", error);
      toast({
        variant: "destructive",
        title: "Comparison Failed",
        description: "Could not get AI analysis for the diff.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveAnalysis = async () => {
    if (!result || !snapshotA || !snapshotB) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, "diff_analysis"), {
        snapshotA: snapshotA.slug,
        snapshotB: snapshotB.slug,
        analysis: result,
        timestamp: serverTimestamp(),
      });
      toast({
        title: "Analysis Saved",
        description: "The trajectory synthesis has been archived.",
      });
    } catch (error) {
      console.error("Failed to save analysis:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not archive the analysis.",
      });
    } finally {
      setIsSaving(false);
    }
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
                <SelectItem key={s.slug} value={s.slug} disabled={s.slug === snapshotB?.slug}>
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
                <SelectItem key={s.slug} value={s.slug} disabled={s.slug === snapshotA?.slug}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="md:col-span-2 flex justify-center">
            <Button
              onClick={handleCompare}
              disabled={!snapshotA || !snapshotB || loading}
            >
              {loading ? (
                "Analyzing..."
              ) : (
                <>
                  <GitCompareArrows className="mr-2 h-4 w-4" /> Compare with AI
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card>
            <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-accent">
                    <Bot className="h-6 w-6" /> AI Trajectory Synthesis
                 </CardTitle>
                 <CardDescription>The AI is comparing the two timelines to generate a strategic analysis.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                 <Skeleton className="h-8 w-1/3 mt-4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="flex items-center gap-2 text-accent">
                        <Bot className="h-6 w-6" /> AI Trajectory Synthesis
                    </CardTitle>
                    <CardDescription>
                        AI-generated analysis of the strategic divergence between{" "}
                        <strong>{snapshotA?.label}</strong> and{" "}
                        <strong>{snapshotB?.label}</strong>.
                    </CardDescription>
                </div>
                <Button onClick={handleSaveAnalysis} disabled={isSaving} variant="outline">
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Archiving..." : "Archive Analysis"}
                </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Comparison Summary
              </h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {result.comparisonSummary}
              </p>
            </div>
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <GitCompareArrows className="h-5 w-5" />
                Key Differences
              </h3>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                {result.keyDifferences.map((diff, index) => (
                  <li key={index}>{diff}</li>
                ))}
              </ul>
            </div>
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <ChevronsRight className="h-5 w-5" />
                Strategic Shift
              </h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {result.strategicShift}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          {snapshotA ? (
            <div className="space-y-2">
               <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{snapshotA.label}</CardTitle>
                  <CardDescription>{snapshotA.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs text-muted-foreground bg-muted/50 p-4 rounded-lg overflow-x-auto">
                    <code>{snapshotA.data.logs}</code>
                  </pre>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="flex items-center justify-center h-full min-h-96">
              <p className="text-muted-foreground">
                Select Snapshot A to view its data
              </p>
            </Card>
          )}
        </div>
        <div>
          {snapshotB ? (
             <div className="space-y-2">
               <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{snapshotB.label}</CardTitle>
                  <CardDescription>{snapshotB.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs text-muted-foreground bg-muted/50 p-4 rounded-lg overflow-x-auto">
                    <code>{snapshotB.data.logs}</code>
                  </pre>
                </CardContent>
              </Card>
            </div>
          ) : (
             <Card className="flex items-center justify-center h-full min-h-96">
              <p className="text-muted-foreground">
                Select Snapshot B to view its data
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

    