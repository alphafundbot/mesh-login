"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, Code, Cpu, Link2, GitBranchPlus } from "lucide-react";
import { analyzeCode, type CodeAnalysisOutput } from "@/ai/flows/code-intelligence-flow";
import { ALL_FILES } from "@/lib/project-files"; // We will create this file

export default function CodeIntelligenceClient() {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState("");
  const [result, setResult] = useState<CodeAnalysisOutput | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "No File Selected",
        description: "Please select a file to analyze.",
      });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const fileContent = ALL_FILES[selectedFile];
      const output = await analyzeCode({
        filePath: selectedFile,
        fileContent: fileContent,
      });
      setResult(output);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedFileContent = ALL_FILES[selectedFile] || "Select a file to see its content.";

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>File Selection</CardTitle>
            <CardDescription>
              Select a source file from the mesh to begin the analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Select onValueChange={setSelectedFile} value={selectedFile}>
              <SelectTrigger>
                <SelectValue placeholder="Select a file..." />
              </SelectTrigger>
              <SelectContent className="max-h-96">
                {Object.keys(ALL_FILES).map((path) => (
                  <SelectItem key={path} value={path}>
                    {path}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAnalyze} disabled={loading || !selectedFile}>
              {loading ? "Analyzing..." : "Analyze"}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Source Code</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs text-muted-foreground bg-muted/50 p-4 rounded-lg overflow-auto h-[400px]">
              <code>{selectedFileContent}</code>
            </pre>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <Bot className="h-5 w-5" /> AI Code Intelligence
            </CardTitle>
             <CardDescription>
              AI-generated analysis of the selected source file.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
                <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            ) : result ? (
              <>
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2"><Cpu className="h-4 w-4" />Purpose</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.purpose}</p>
                </div>
                 <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2"><Link2 className="h-4 w-4" />Dependencies</h3>
                   <div className="flex flex-wrap gap-2">
                    {result.dependencies.map(dep => <Badge key={dep} variant="secondary">{dep}</Badge>)}
                   </div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2"><GitBranchPlus className="h-4 w-4" />Performance Mapping</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.performanceMapping}</p>
                </div>
                 <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2"><Code className="h-4 w-4" />Quality Assessment</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.qualityAssessment}</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-16">
                Select a file and click "Analyze" to generate insights.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
