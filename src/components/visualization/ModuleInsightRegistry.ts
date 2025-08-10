export const ModuleInsightRegistry = {
  AuditEngine: {
    type: '2D' as '2D' | '3D',
    dataSource: 'AuditTrailData',
    visualSchema: 'Timeline with event markers'
  },
  SignalRouter: {
    type: '3D' as '2D' | '3D',
    dataSource: 'SignalFlowData',
    visualSchema: 'Network graph with animated signal paths'
  },
  FreeAccountConnector: {
    type: '2D' as '2D' | '3D',
    dataSource: 'SIMProvisioningData',
    visualSchema: 'Regional heatmap'
  }
};