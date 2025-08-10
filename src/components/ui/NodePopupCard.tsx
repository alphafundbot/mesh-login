import React from 'react';
import { Card } from './ui/card'; // Assuming Card component path
import { Toggle } from './ui/toggle'; // Assuming Toggle component path
import { Button } from './ui/button'; // Assuming Button component path

// Assume Node type is defined elsewhere
interface Node {
  id: string;
  name: string;
  health: number; // Assuming health is a number between 0 and 1
  revenue: number;
  latency: number;
}

// Assume restartNode and openConfigPage functions are defined elsewhere
declare function restartNode(nodeId: string): void;
declare function openConfigPage(nodeId: string): void;


const NodePopupCard: React.FC<{ node: Node }> = ({ node }) => {
  return (
    <Card>
      <h3>{node.name}</h3>
      <p>📶 Health: {(node.health * 100).toFixed(0)}%</p>
      <p>💰 Revenue: ${node.revenue.toFixed(2)}</p>
      <p>⚡ Latency: {node.latency}ms</p>
      <Toggle label="Restart Node" onToggle={() => restartNode(node.id)} />
      <Button onClick={() => openConfigPage(node.id)}>🔍 Full Config</Button>
    </Card>
  );
};

export default NodePopupCard;
import React from 'react';
import { Card } from './ui/card'; // Assuming Card component path
import { Toggle } from './ui/toggle'; // Assuming Toggle component path
import { Button } from './ui/button'; // Assuming Button component path

// Assume Node type is defined elsewhere
interface Node {
  id: string;
  name: string;
  health: number; // Assuming health is a number between 0 and 1
  revenue: number;
  latency: number;
}

// Assume restartNode and openConfigPage functions are defined elsewhere
declare function restartNode(nodeId: string): void;
declare function openConfigPage(nodeId: string): void;


const NodePopupCard: React.FC<{ node: Node }> = ({ node }) => {
  return (
    <Card>
      <h3>{node.name}</h3>
      <p>📶 Health: {(node.health * 100).toFixed(0)}%</p>
      <p>💰 Revenue: ${node.revenue.toFixed(2)}</p>
      <p>⚡ Latency: {node.latency}ms</p>
      <Toggle label="Restart Node" onToggle={() => restartNode(node.id)} />
      <Button onClick={() => openConfigPage(node.id)}>🔍 Full Config</Button>
    </Card>
  );
};

export default NodePopupCard;