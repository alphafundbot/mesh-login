
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BarChartHorizontal } from "lucide-react";

export default function UsageClient() {

  return (
    <div className="space-y-6">
        <Alert>
            <BarChartHorizontal className="h-4 w-4" />
            <AlertTitle>Feature Pending</AlertTitle>
            <AlertDescription>
              The Model Usage Dashboard is planned. To enable this feature, a metrics collection service must be integrated into the Genkit flows to track AI call latency, token counts, and costs.
            </AlertDescription>
        </Alert>

        <Card>
            <CardHeader>
                <CardTitle>Placeholder: Model Usage</CardTitle>
                <CardDescription>
                    This card will display metrics like total requests, tokens used, and average latency per model.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-center py-8">
                    Metrics will be displayed here once a collection service is integrated.
                </p>
            </CardContent>
        </Card>
    </div>
  );
}
