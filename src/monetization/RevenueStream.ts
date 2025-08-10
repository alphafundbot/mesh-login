interface SignalNode {
  bandwidth: number;
  monetizationRate: number;
}

function calculateRevenue(node: SignalNode): number {
  return node.bandwidth * node.monetizationRate;
}