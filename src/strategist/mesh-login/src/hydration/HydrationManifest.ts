// src/init/HydrationManifest.ts

interface HydratedFile {
  filePath: string;
  metadata: any; // Flexible metadata structure
}

const hydratedFiles: HydratedFile[] = [];

export function addHydratedFile(filePath: string, metadata: any): void {
  const existingIndex = hydratedFiles.findIndex(file => file.filePath === filePath);
  if (existingIndex > -1) {
    // Update metadata if file already exists
    hydratedFiles[existingIndex].metadata = metadata;
  } else {
    hydratedFiles.push({ filePath, metadata });
  }
}

export function getHydrationStatus(filePath: string): any | undefined {
  const file = hydratedFiles.find(file => file.filePath === filePath);
  return file ? file.metadata : undefined;
}

export function getHydratedFiles(): { filePath: string; metadata: any }[] {
  return [...hydratedFiles]; // Return a copy to prevent external modification
}