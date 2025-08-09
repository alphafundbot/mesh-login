
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Globe, RefreshCw, AlertTriangle } from 'lucide-react';
import { analyzeCurrencyVolatility } from '@/ai/flows/currency-volatility-flow';
import type { CurrencyVolatilityOutput } from '@/lib/types/currency';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { generateCurrencyData } from '@/lib/financial-data';


export default function CurrencySignalModule() {
    const [loading, setLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<CurrencyVolatilityOutput | null>(null);
    const { toast } = useToast();

    const handleAnalysis = async () => {
        setLoading(true);
        setAnalysisResult(null);
        try {
            const { currentRates, historicalRates, baseCurrency } = generateCurrencyData();

            const result = await analyzeCurrencyVolatility({
                baseCurrency: baseCurrency,
                currentRates: currentRates,
                historicalRates: historicalRates,
            });
            setAnalysisResult(result);

        } catch (error) {
             console.error("Currency analysis failed:", error);
             toast({ variant: 'destructive', title: 'Analysis Error', description: 'Could not perform volatility analysis.' });
        } finally {
            setLoading(false);
        }
    }
    
    useEffect(() => {
        handleAnalysis();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const renderLoading = () => (
        <CardContent>
             <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </div>
        </CardContent>
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-accent" />Currency Signals</CardTitle>
                    <Button onClick={handleAnalysis} disabled={loading} size="icon" variant="ghost" className="h-8 w-8">
                        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                    </Button>
                </div>
                <CardDescription>Live Forex rates (USD base). Free plan data is delayed.</CardDescription>
            </CardHeader>
            {loading ? renderLoading() : analysisResult && (
                <CardContent className="space-y-4">
                    <div className={cn("p-3 rounded-lg border", analysisResult.isVolatile ? 'bg-destructive/10 border-destructive/20' : 'bg-green-500/10 border-green-500/20')}>
                       <div className="font-semibold flex items-center gap-2 mb-2">
                        {analysisResult.isVolatile && <AlertTriangle className="h-4 w-4 text-destructive" />}
                        AI Volatility Analysis
                       </div>
                       <p className="text-sm text-muted-foreground">{analysisResult.analysis}</p>
                       {analysisResult.isVolatile && analysisResult.volatileCurrencies.length > 0 && (
                         <div className="flex flex-wrap gap-2 mt-2">
                           {analysisResult.volatileCurrencies.map(c => <Badge key={c} variant="destructive">{c}</Badge>)}
                         </div>
                       )}
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
