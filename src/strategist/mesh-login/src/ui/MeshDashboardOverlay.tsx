import React, { useState, useEffect } from 'react';

interface Module {
  name: string;
  domain: string;
  dependencies: string[];
  status: string;
  audit_ready: boolean;
}

interface MeshManifest {
  mesh_manifest: {
    modules: Module[];
    meta: {
      version: string;
      strategist: string;
      activation_state: string;
      next_steps: string[];
    };
  };
}

const MeshDashboardOverlay: React.FC = () => {
  const [manifest, setManifest] = useState<MeshManifest | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchManifest = async () => {
      try {
        const response = await fetch('/mesh_manifest.json'); // Assuming the manifest is served from the root
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: MeshManifest = await response.json();
        setManifest(data);
      } catch (e: any) {
        setError(e.message);
      }
    };

    fetchManifest();
  }, []);

  if (error) {
    return <div className="text-red-500">Error loading manifest: {error}</div>;
  }

  if (!manifest) {
    return <div>Loading Mesh Manifest...</div>;
  }

  const { modules, meta } = manifest.mesh_manifest;

  return (
    <div className="p-4 border rounded-md shadow-sm bg-gray-800 text-white">
      <h2 className="text-xl font-bold mb-4">Mesh Dashboard Overlay</h2>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Meta Information</h3>
        <p><strong>Version:</strong> {meta.version}</p>
        <p><strong>Strategist:</strong> {meta.strategist}</p>
        <p><strong>Activation State:</strong> {meta.activation_state}</p>
        <div>
          <strong>Next Steps:</strong>
          <ul className="list-disc ml-5">
            {meta.next_steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Modules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module) => (
            <div key={module.name} className="border rounded-md p-4 bg-gray-700">
              <h4 className="font-bold text-lg">{module.name}</h4>
              <p><strong>Domain:</strong> {module.domain}</p>
              <p><strong>Status:</strong> <span className={`px-2 py-0.5 rounded-full text-xs ${module.status === 'integrated' ? 'bg-green-500' : module.status === 'core' ? 'bg-blue-500' : module.status === 'active' ? 'bg-yellow-500' : 'bg-gray-500'}`}>{module.status}</span></p>
              <p><strong>Audit Ready:</strong> <span className={`px-2 py-0.5 rounded-full text-xs ${module.audit_ready ? 'bg-green-500' : 'bg-red-500'}`}>{module.audit_ready ? 'Yes' : 'No'}</span></p>
              <div>
                <strong>Dependencies:</strong>
                <ul className="list-disc ml-5 text-sm">
                  {module.dependencies.length > 0 ? (
                    module.dependencies.map((dep, index) => (
                      <li key={index}>{dep}</li>
                    ))
                  ) : (
                    <li>None</li>
                  )}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MeshDashboardOverlay;