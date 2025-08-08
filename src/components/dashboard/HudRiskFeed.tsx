
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot, Timestamp } from "firebase/firestore";
import { Skeleton } from "../ui/skeleton";
import { Bot, AlertTriangle, ShieldAlert, History, ShieldX, CheckCircle, CornerDownRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface HudAction {
  id: string;
  action: string;
  strategist: string;
  role: string;
  details: string;
  timestamp: Date;
}

const ACTION_ICONS: Record<string, React.ElementType> = {
    "Escalate": AlertTriangle,
    "Quarantine": ShieldAlert,
    "Rollback": History,
    "STRATEGIST_RESPONSE": Bot,
    "AUTO_ESCALATE": Bot,
    "DISMISS": CheckCircle,
    "TAKE_ACTION": ShieldX,
    "Acknowledge": CheckCircle,
}

const getActionColor = (action: string) => {
    switch (action) {
        case "Escalate": return "text-destructive";
        case "Quarantine": return "text-orange-400";
        case "Rollback": return "text-yellow-400";
        case "TAKE_ACTION": return "text-red-500";
        default: return "text-accent";
    }
}

export default function HudRiskFeed() {
    const [actions, setActions] = useState<HudAction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "hud_actions"), orderBy("timestamp", "desc"), limit(5));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedActions = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    action: data.action,
                    strategist: data.strategist,
                    role: data.role,
                    details: data.details,
                    timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(),
                }
            });
            setActions(fetchedActions);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching HUD actions:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const parseDetailsForDisplay = (action: string, details: string) => {
      if (action === 'STRATEGIST_RESPONSE') {
        const rationaleMatch = details.match(/Rationale: "([^"]*)"/);
        return rationaleMatch ? `Responded with rationale: "${rationaleMatch[1]}"` : details;
      }
      return details;
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History className="h-6 w-6 text-accent" />
                    HUD Action Feed
                </CardTitle>
                <CardDescription>
                    Live feed of high-level strategist actions.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {loading && Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                           <Skeleton className="h-6 w-6 rounded-full" />
                           <div className="space-y-1 w-full">
                             <Skeleton className="h-4 w-4/5" />
                             <Skeleton className="h-3 w-full" />
                             <Skeleton className="h-3 w-1/2" />
                           </div>
                        </div>
                    ))}
                    {!loading && actions.map((action) => {
                        const Icon = ACTION_ICONS[action.action] || Bot;
                        const color = getActionColor(action.action);
                        return (
                            <div key={action.id} className="flex items-start gap-4">
                                <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", color)} />
                                <div className="text-sm">
                                    <p><span className="font-semibold">{action.strategist}</span> ({action.role}) initiated <span className={cn("font-semibold", color)}>{action.action}</span></p>
                                    <p className="text-xs text-muted-foreground mt-1 italic">
                                      {parseDetailsForDisplay(action.action, action.details)}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2">{formatDistanceToNow(action.timestamp, { addSuffix: true })}</p>
                                </div>
                            </div>
                        )
                    })}
                     {!loading && actions.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-4">No actions logged yet.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
