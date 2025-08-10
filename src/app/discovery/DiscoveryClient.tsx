'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { syncKnownPlatforms, type PlatformMeta } from '@/ai/flows/api-discovery-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { Globe, PlusCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DiscoveryClient() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PlatformMeta[]>([]);
  const { toast } = useToast();

  const handleDiscover = async () => {
    setLoading(true);
    setResults([]);
    try {
      const apis = await syncKnownPlatforms();
      setResults(apis);
      toast({
        title: 'Discovery Complete',
        description: `Found ${apis.length} potential API integrations.`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Discovery Failed',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderLoading = () => (
    <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
    </div>
  )

  const renderResults = () => (
    <ScrollArea className="h-96">
        <div className="space-y-4 pr-4">
            {results.map((api) => (
            <Card key={api.id} className="flex items-center justify-between p-4">
                <div>
                    <h3 className="font-semibold">{api.name}</h3>
                    <p className="text-sm text-muted-foreground">{api.id}</p>
                </div>
                <Button variant="outline" size="icon" disabled>
                    <PlusCircle className="h-4 w-4" />
                </Button>
            </Card>
            ))}
        </div>
    </ScrollArea>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-accent" />
            External API Discovery
        </CardTitle>
        <CardDescription>
          Scan the APIs.guru public registry to find potential external services to integrate into the mesh.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleDiscover} disabled={loading}>
          {loading ? 'Discovering...' : 'Start Discovery'}
        </Button>

        <div className="mt-4">
            {loading && renderLoading()}
            {!loading && results.length > 0 && renderResults()}
            {!loading && results.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                    Click "Start Discovery" to search for APIs.
                </p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
