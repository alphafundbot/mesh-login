import AppLayout from '@/components/layout/AppLayout';
import DiscoveryClient from './DiscoveryClient';

export default function DiscoveryPage() {
  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">API Discovery</h1>
        </div>
        <p className="text-muted-foreground">
          Dynamically discover external APIs and services to integrate into the mesh.
        </p>
        <DiscoveryClient />
      </div>
    </AppLayout>
  );
}
