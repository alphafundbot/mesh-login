
"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, orderBy, Timestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { BrainCircuit } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";

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
  const [metaStrategyFilter, setMetaStrategyFilter] = useState<string>("all");
  const [capitalStateFilter, setCapitalStateFilter] = useState<string>("all");

  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
        if(user) {
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
        } else {
            setLoading(false);
        }
    });
    return () => authUnsubscribe();
  }, []);

  const { uniqueMetaStrategies, uniqueCapitalStates } = useMemo(() => {
    const metaStrategies = new Set<string>();
    const capitalStates = new Set<string>();
    epochs.forEach(e => {
      metaStrategies.add(e.meta_strategy);
      capitalStates.add(e.capital_state);
    });
    return { 
      uniqueMetaStrategies: Array.from(metaStrategies), 
      uniqueCapitalStates: Array.from(capitalStates)
    };
  }, [epochs]);

  const filteredEpochs = useMemo(() => {
    return epochs.filter(e => {
      const metaMatch = metaStrategyFilter === 'all' || e.meta_strategy === metaStrategyFilter;
      const capitalMatch = capitalStateFilter === 'all' || e.capital_state === capitalStateFilter;
      return metaMatch && capitalMatch;
    });
  }, [epochs, metaStrategyFilter, capitalStateFilter]);

  const handleClearFilters = () => {
    setMetaStrategyFilter("all");
    setCapitalStateFilter("all");
  }


  return (
    <Card className="h-full">
        <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-accent"><BrainCircuit className="h-6 w-6" />OMEGA PROTOCOL</CardTitle>
                <CardDescription>Live Epoch Stream: Transcendental Cognition Loop</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={metaStrategyFilter} onValueChange={setMetaStrategyFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by Strategy..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Strategies</SelectItem>
                    {uniqueMetaStrategies.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                 <Select value={capitalStateFilter} onValueChange={setCapitalStateFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by Capital State..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Capital States</SelectItem>
                    {uniqueCapitalStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                 {(metaStrategyFilter !== 'all' || capitalStateFilter !== 'all') && 
                  <Button variant="ghost" onClick={handleClearFilters}>Clear</Button>}
              </div>
            </div>
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            ) : filteredEpochs.length === 0 ? (
                 <p className="text-muted-foreground text-center py-4">{epochs.length > 0 ? "No epochs match the current filters." : "Awaiting Omega Epoch stream..."}</p>
            ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {filteredEpochs.map(e => (
                        <div key={e.id} className="border-b border-border/50 pb-2 text-xs">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-foreground">🧠 Epoch {e.epoch}</span>
                                <span className="text-muted-foreground">{e.timestamp.toLocaleString()}</span>
                            </div>
                            <div className="text-muted-foreground mt-1"><span className="font-semibold text-primary/80">Strategy:</span> {e.meta_strategy}</div>
                            <div className="text-muted-foreground"><span className="font-semibold text-primary/80">Capital:</span> {e.capital_state}</div>
                            <div className="text-muted-foreground italic bg-muted/30 p-2 mt-1 rounded-md"><span className="font-semibold not-italic text-primary/80">Cognition:</span> {e.cognition_loop}</div>
                        </div>
                    ))}
                </div>
            )}
        </CardContent>
    </Card>
  );
}
