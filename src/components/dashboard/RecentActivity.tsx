"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bot, AlertTriangle, Filter, CornerDownRight } from "lucide-react";
import { Button } from "../ui/button";

const mockSummary =
  "VaultOperations config updated by admin. Port scan detected from localhost. Unauthorized access attempt by guest on SignalRouter.";
const mockUnusualActivities =
  "- Port scan flagged\n- Unauthorized access attempt\n- Recommend audit lock on SignalRouter";

export default function RecentActivity() {
  return (
    <div className="space-y-6 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-accent" />
            <CardTitle>Recent Activity (AI Summary)</CardTitle>
          </div>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Summary:</h3>
            <p className="text-muted-foreground">{mockSummary}</p>
          </div>
          <div className="border-t border-border pt-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Unusual Activity Detected:
            </h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {mockUnusualActivities}
            </p>
            <div className="flex gap-2 mt-4">
              <Button variant="destructive" size="sm">
                <CornerDownRight className="mr-2 h-4 w-4" />
                Escalate
              </Button>
              <Button variant="secondary" size="sm">
                <CornerDownRight className="mr-2 h-4 w-4" />
                Quarantine
              </Button>
              <Button variant="secondary" size="sm">
                <CornerDownRight className="mr-2 h-4 w-4" />
                Rollback
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
