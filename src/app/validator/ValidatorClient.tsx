"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";

type ValidationResult = {
  status: "success" | "error";
  message: string;
} | null;

export default function ValidatorClient() {
  const [configText, setConfigText] = useState("");
  const [result, setResult] = useState<ValidationResult>(null);

  function handleValidate() {
    if (!configText.trim()) {
      setResult({ status: "error", message: "Configuration cannot be empty." });
      return;
    }

    try {
      JSON.parse(configText);
      setResult({ status: "success", message: "Valid JSON configuration." });
    } catch (error) {
      if (error instanceof Error) {
        setResult({
          status: "error",
          message: `Invalid JSON: ${error.message}`,
        });
      } else {
        setResult({ status: "error", message: "An unknown parsing error occurred." });
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Submit Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder='{ "key": "value" }'
            className="min-h-[300px] font-mono"
            value={configText}
            onChange={(e) => setConfigText(e.target.value)}
          />
          <Button onClick={handleValidate}>Validate</Button>
        </CardContent>
      </Card>

      {result && (
        <Alert variant={result.status === "error" ? "destructive" : "default"} className={result.status === 'success' ? 'border-green-500/50' : ''}>
          {result.status === "success" ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {result.status === "success" ? "Validation Successful" : "Validation Failed"}
          </AlertTitle>
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
