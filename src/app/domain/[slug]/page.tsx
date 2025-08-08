import AppLayout from "@/components/layout/AppLayout";
import { domainData } from "@/lib/domains";
import { notFound } from "next/navigation";
import DomainClient from "./DomainClient";

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

        <DomainClient domain={domain} />
      </div>
    </AppLayout>
  );
}
