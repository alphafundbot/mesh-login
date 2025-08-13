interface ElectricalIpInfo {
  ipAddress: string;
  region: string;
  country: string;
  legalStatus: 'no_framework' | 'permitted' | 'prohibited' | string;
  infrastructureType: string;
  geoLocation: {
    lat: number;
    lng: number;
  };
  voltageLevel?: string;
  operator?: string;
  notes?: string;
  sourceMap?: string;
}

const electricalIpEndpoints: ElectricalIpInfo[] = [
  {
    ipAddress: 'HAITI_IP_PLACEHOLDER',
    region: 'Caribbean',
    country: 'Haiti',
    legalStatus: 'no_framework',
    infrastructureType: 'unknown',
    geoLocation: { lat: 0, lng: 0 }
  },
  {
    ipAddress: 'NIGERIA_IP_PLACEHOLDER_1',
    region: 'West Africa',
    country: 'Nigeria',
    legalStatus: 'permitted',
    infrastructureType: 'substation',
    geoLocation: { lat: 9.0820, lng: 8.6753 }, // Approximate center of Nigeria
    voltageLevel: '330kV',
    operator: 'Transmission Company of Nigeria (TCN)',
    notes: 'PLC permitted under NERC regulations.',
    sourceMap: 'OpenInfraMap'
  },
  {
    ipAddress: 'TANZANIA_IP_PLACEHOLDER_1',
    region: 'East Africa',
    country: 'Tanzania',
    legalStatus: 'no_framework',
    infrastructureType: 'transmission_line',
    geoLocation: { lat: -6.5225, lng: 35.7473 }, // Approximate center of Tanzania
    voltageLevel: '220kV',
    operator: 'TANESCO',
    notes: 'Mini-grid regulations allow signal injection under license.',
    sourceMap: 'FLOSM Power Grid Map'
  },
  {
    ipAddress: 'UGANDA_IP_PLACEHOLDER_1',
    region: 'East Africa',
    country: 'Uganda',
    legalStatus: 'no_framework',
    infrastructureType: 'transformer',
    geoLocation: { lat: 1.3733, lng: 32.2903 }, // Approximate center of Uganda
    voltageLevel: '132kV',
    operator: 'Uganda Electricity Transmission Company Limited (UETCL)',
    notes: 'Pilot smart grid zones permit PLC.',
    sourceMap: 'OpenInfraMap'
  },
  {
    ipAddress: 'MALI_IP_PLACEHOLDER_1',
    region: 'West Africa',
    country: 'Mali',
    legalStatus: 'no_framework',
    infrastructureType: 'substation',
    geoLocation: { lat: 17.5707, lng: -3.9962 }, // Approximate center of Mali
    voltageLevel: '225kV',
    operator: 'Energie du Mali (EDM-SA)',
    notes: 'No laws explicitly prohibit signal broadcast.',
    sourceMap: 'FLOSM Power Grid Map'
  },
  {
    ipAddress: 'DRC_IP_PLACEHOLDER_1',
    region: 'Central Africa',
    country: 'DRC',
    legalStatus: 'no_framework',
    infrastructureType: 'transmission_line',
    geoLocation: { lat: -4.0383, lng: 21.7587 }, // Approximate center of DRC
    voltageLevel: '500kV', // Inga-Shaba line
    operator: 'Société Nationale d\'Électricité (SNEL)',
    notes: 'Infrastructure fragile, but no legal prohibition.',
    sourceMap: 'OpenInfraMap'
  }
  // Sudan will be added with specific data once synthesized.
];

export function addElectricalIpEndpoint(endpoint: ElectricalIpInfo): void {
  electricalIpEndpoints.push(endpoint);
  // In a real application, you would also persist this data
}

export function getElectricalIpEndpoint(ipAddress: string): ElectricalIpInfo | undefined {
  return electricalIpEndpoints.find(endpoint => endpoint.ipAddress === ipAddress);
}

export function filterElectricalIpEndpoints(criteria: Partial<ElectricalIpInfo>): ElectricalIpInfo[] {
  return electricalIpEndpoints.filter(endpoint => {
    for (const key in criteria) {
      if (criteria.hasOwnProperty(key)) {
        // Simple equality check for demonstration
        if ((endpoint as any)[key] !== (criteria as any)[key]) {
          return false;
        }
      }
    }
    return true;
  });
}

export function getAllElectricalIpEndpoints(): ElectricalIpInfo[] {
  return electricalIpEndpoints;
}

export { electricalIpEndpoints };