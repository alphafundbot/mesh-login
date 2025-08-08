"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, Bot } from "lucide-react";
import { validateConfiguration } from "@/ai/flows/config-validator-flow";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type ValidationResult = {
  status: "success" | "error";
  message: string;
} | null;

export default function ValidatorClient() {
  const [configText, setConfigText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult>(null);
  const { toast } = useToast();

  async function handleValidate() {
    setLoading(true);
    setResult(null);
    if (!configText.trim()) {
      setResult({ status: "error", message: "Configuration cannot be empty." });
      setLoading(false);
      return;
    }

    try {
      const aiResult = await validateConfiguration({ config: configText });
      if (aiResult.isValid) {
        setResult({ status: "success", message: aiResult.suggestions });
      } else {
        setResult({ status: "error", message: aiResult.suggestions });
      }
    } catch (error) {
      console.error("AI validation failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to validate configuration with AI. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Submit Compliance Matrix or Configuration</CardTitle>
          <CardDescription>
            Paste the raw JSON configuration below. The AI will analyze it for structural validity, security, and compliance with relevant standards.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder='{ "complianceRule": "...", "dataHandling": { "encryption": "AES-256" } }'
            className="min-h-[300px] font-mono"
            value={configText}
            onChange={(e) => setConfigText(e.target.value)}
            disabled={loading}
          />
          <Button onClick={handleValidate} disabled={loading}>
            {loading ? "Validating with AI..." : "Validate Compliance"}
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <Alert>
            <Bot className="h-4 w-4" />
            <AlertTitle>AI Validator is thinking...</AlertTitle>
            <AlertDescription>
              <div className="space-y-2 mt-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </AlertDescription>
        </Alert>
      )}

      {result && (
        <Alert
          variant={result.status === "error" ? "destructive" : "default"}
          className={result.status === "success" ? "border-green-500/50" : ""}
        >
          {result.status === "success" ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {result.status === "success"
              ? "Validation Successful"
              : "Validation Failed"}
          </AlertTitle>
          <AlertDescription className="whitespace-pre-wrap">{result.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
