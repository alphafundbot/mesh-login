
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, TestTube, TrendingUp, TrendingDown, Save } from "lucide-react";
import { simulateOverride, type PredictiveOverrideOutput, type PredictiveOverrideInput } from "@/ai/flows/predictive-override-flow";
import { domainData } from "@/lib/domains";
import { cn } from "@/lib/utils";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";


const formSchema = z.object({
  action: z.string().min(5, "Action must be at least 5 characters."),
  rationale: z.string().min(10, "Rationale must be at least 10 characters."),
  targetDomain: z.string({ required_error: "Please select a target domain."}),
});

export default function SimulationClient() {
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [result, setResult] = useState<PredictiveOverrideOutput | null>(null);
    const [lastInput, setLastInput] = useState<PredictiveOverrideInput | null>(null);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            action: "",
            rationale: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        setResult(null);
        setLastInput(values);
        try {
            const output = await simulateOverride(values);
            setResult(output);
        } catch (error) {
            console.error("Simulation failed:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({
                variant: "destructive",
                title: "Simulation Failed",
                description: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    }

    const handleSaveAnalysis = async () => {
        if (!result || !lastInput) return;
        setIsSaving(true);
        try {
          await addDoc(collection(db, "simulation_analysis"), {
            input: lastInput,
            output: result,
            timestamp: serverTimestamp(),
          });
          toast({
            title: "Analysis Saved",
            description: "The simulation has been archived.",
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


    const ImpactScore = ({ score }: { score: number }) => {
        const isPositive = score > 0;
        const isNegative = score < 0;
        const Icon = isPositive ? TrendingUp : TrendingDown;
        const color = isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-muted-foreground';

        return (
            <div className={cn("flex items-center font-mono font-bold", color)}>
                <Icon className="h-4 w-4 mr-1" />
                {score > 0 ? `+${score}` : score}
            </div>
        )
    }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Override Scenario Builder</CardTitle>
                <CardDescription>Define a proposed action to simulate its projected impact on the mesh.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="targetDomain"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Target Domain</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a domain to target" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {domainData.map(d => <SelectItem key={d.slug} value={d.name}>{d.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="action"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Proposed Action</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., FORCE_ROUTE_B, BYPASS_AUTH_CHECK" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="rationale"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Strategist Rationale</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="e.g., High latency detected on primary route, attempting to restore service via secondary." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={loading}>
                            {loading ? "Simulating..." : "Run Simulation"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>

        {loading && (
            <Card>
                <CardHeader>
                     <CardTitle className="flex items-center gap-2 text-accent"><Bot className="h-5 w-5" /> AI Impact Assessment</CardTitle>
                    <CardDescription>The AI is calculating the projected ripple effects of the proposed action...</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                </CardContent>
            </Card>
        )}

        {result && (
            <Card>
                 <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-accent"><Bot className="h-5 w-5" /> AI Impact Assessment</CardTitle>
                            <CardDescription>Simulation ID: <span className="font-mono text-xs">{result.simulationId}</span></CardDescription>
                        </div>
                         <Button onClick={handleSaveAnalysis} disabled={isSaving} variant="outline">
                            <Save className="mr-2 h-4 w-4" />
                            {isSaving ? "Archiving..." : "Archive Analysis"}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-semibold mb-2">Overall Assessment</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">{result.overallAssessment}</p>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                        {result.predictedImpacts.map(impact => (
                            <div key={impact.metric} className="p-3 rounded-md bg-muted/30">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-semibold">{impact.metric}</h4>
                                    <ImpactScore score={impact.impactScore} />
                                </div>
                                <p className="text-xs text-muted-foreground">{impact.justification}</p>
                            </div>
                        ))}
                     </div>
                </CardContent>
            </Card>
        )}
    </div>
  );
}

    