import AppLayout from "@/components/layout/AppLayout";
import { domainData } from "@/lib/domains";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";

export default function DomainDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const domain = domainData.find((d) => d.slug === params.slug);

  if (!domain) {
    notFound();
  }

  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-4">
            <domain.icon className="h-8 w-8 text-accent" />
            {domain.name}
          </h1>
        </div>
        <p className="text-muted-foreground">{domain.status}</p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Action History</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Detailed action history will be displayed here.</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Configuration Diffs</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Configuration changes and diffs will be displayed here.</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Tactical Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">AI-powered tactical recommendations will be displayed here.</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </AppLayout>
  );
}
