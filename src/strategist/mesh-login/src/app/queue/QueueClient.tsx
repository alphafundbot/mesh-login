
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileClock } from "lucide-react";

export default function QueueClient() {

  return (
    <div className="space-y-6">
        <Alert>
            <FileClock className="h-4 w-4" />
            <AlertTitle>Feature Pending</AlertTitle>
            <AlertDescription>
              The Synthesis Queue is a planned feature. To enable it, a background job processor and queueing system (like Redis or RabbitMQ) must be integrated to manage and execute AI synthesis tasks asynchronously.
            </AlertDescription>
        </Alert>

        <Card>
            <CardHeader>
                <CardTitle>Placeholder: Synthesis Task Queue</CardTitle>
                <CardDescription>
                    This card will display the status of pending, active, and completed AI synthesis tasks.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-center py-8">
                    Queue status will be displayed here once the backend is integrated.
                </p>
            </CardContent>
        </Card>
    </div>
  );
}
