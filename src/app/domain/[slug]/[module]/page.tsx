

import AppLayout from "@/components/layout/AppLayout";
import { domainData } from "@/lib/domains";
import { notFound } from "next/navigation";
import { slugify } from "@/lib/utils";
import ModuleClient from "./ModuleClient";

export default function ModuleDetailPage({
  params,
}: {
  params: { slug: string; module: string };
}) {
  const domain = domainData.find((d) => d.slug === params.slug);
  const moduleName = domain?.modules.find(m => slugify(m) === params.module);

  if (!domain || !moduleName) {
    notFound();
  }

  // Destructure icon to avoid passing non-serializable props to the client component.
  // This resolves the React Server Component boundary violation.
  const { icon, ...serializableDomain } = domain;

  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <ModuleClient domain={serializableDomain} moduleName={moduleName} />
      </div>
    </AppLayout>
  );
}

