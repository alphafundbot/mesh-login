import React, { useState } from 'react';

interface InsightSelectorProps {
  onSelectInsightType: (type: 'operational' | 'psychographic') => void;
}

const InsightSelector: React.FC<InsightSelectorProps> = ({ onSelectInsightType }) => {
  const [selectedType, setSelectedType] = useState<'operational' | 'psychographic'>('operational');

  const handleSelect = (type: 'operational' | 'psychographic') => {
    setSelectedType(type);
    onSelectInsightType(type);
  };

  return (
    <div>
      <button
        onClick={() => handleSelect('operational')}
        style={{ fontWeight: selectedType === 'operational' ? 'bold' : 'normal' }}
      >
        Operational Insights
      </button>
      <button
        onClick={() => handleSelect('psychographic')}
        style={{ fontWeight: selectedType === 'psychographic' ? 'bold' : 'normal' }}
      >
        Psychographic Insights
      </button>
    </div>
  );
};

export default InsightSelector;