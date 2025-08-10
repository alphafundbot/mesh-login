import React, { useState } from 'react';
import { ModuleInsightRegistry } from '../visualization/ModuleInsightRegistry';

interface ModuleSelectorProps {
  onSelectModule: (moduleName: string) => void;
}

const ModuleSelector: React.FC<ModuleSelectorProps> = ({ onSelectModule }) => {
  const [selectedModule, setSelectedModule] = useState<string>('');

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const moduleName = event.target.value;
    setSelectedModule(moduleName);
    onSelectModule(moduleName);
  };

  return (
    <select value={selectedModule} onChange={handleSelectChange}>
      <option value="">-- Select a Module --</option>
      {Object.keys(ModuleInsightRegistry).map((moduleName) => (
        <option key={moduleName} value={moduleName}>
          {moduleName}
        </option>
      ))}
    </select>
  );
};

export default ModuleSelector;