
import { notFound } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import ModuleClient from "./ModuleClient";
import { domainData } from "@/lib/domains";
import { slugify } from "@/lib/utils";

interface PageProps {
  params: {
    slug: string;
    module: string;
  };
}

export default function ModuleDetailPage({ params }: PageProps) {
  const domain = domainData.find((d) => d.slug === params.slug);
  if (!domain) {
    return notFound();
  }

  const moduleName = domain.modules.find((m) => slugify(m) === params.module);
  if (!moduleName) {
    return notFound();
  }

  // Destructure icon to avoid passing non-serializable props to the client component.
  // This resolves potential React Server Component boundary violations.
  const { icon, ...serializableDomain } = domain;

  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <ModuleClient domain={serializableDomain} moduleName={moduleName} />
      </div>
    </AppLayout>
  );
}
