"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { BrainCircuit } from "lucide-react";

interface Epoch {
    id: string;
    epoch: number;
    meta_strategy: string;
    capital_state: string;
    cognition_loop: string;
    timestamp: Date;
}

export default function OmegaEpochStream() {
  const [epochs, setEpochs] = useState<Epoch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'omega_epochs'),
      orderBy('epoch', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ 
          id: doc.id,
          ...doc.data(),
          timestamp: (doc.data().timestamp as Timestamp)?.toDate() || new Date()
      })) as Epoch[];
      setEpochs(data);
      setLoading(false);
    }, (error) => {
        console.error("Omega Epoch Stream Error:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Card className="h-full">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent"><BrainCircuit className="h-6 w-6" />OMEGA PROTOCOL</CardTitle>
            <CardDescription>Live Epoch Stream: Transcendental Cognition Loop</CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            ) : epochs.length === 0 ? (
                 <p className="text-muted-foreground text-center py-4">Awaiting Omega Epoch stream...</p>
            ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {epochs.map(e => (
                        <div key={e.id} className="border-b border-border/50 pb-2 text-xs">
                            <div className="font-bold text-foreground">🧠 Epoch {e.epoch}</div>
                            <div className="text-muted-foreground"><span className="font-semibold text-primary/80">Strategy:</span> {e.meta_strategy}</div>
                            <div className="text-muted-foreground"><span className="font-semibold text-primary/80">Capital:</span> {e.capital_state}</div>
                            <div className="text-muted-foreground"><span className="font-semibold text-primary/80">Cognition:</span> {e.cognition_loop}</div>
                        </div>
                    ))}
                </div>
            )}
        </CardContent>
    </Card>
  );
}
