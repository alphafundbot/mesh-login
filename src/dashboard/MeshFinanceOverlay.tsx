typescriptreact
import React, { useEffect, useState } from 'react';
import { IncomeHeatmap } from './IncomeHeatmap';
import { NodeEarningsRadar } from './NodeEarningsRadar';
import { MeshIncomeEvent } from '../lib/finance-types';
import { NodePerformanceMetrics } from '../lib/mesh-types';
import { collection, onSnapshot, query } from 'firebase/firestore'; // Assuming Firebase SDK is installed and configured
// Assume `db` is your initialized Firestore instance
// import { db } from '../path/to/your/firebase-config'; 

// Placeholder for Firestore instance - replace with your actual import
const db: any = {}; // REMOVE THIS LINE AND UNCOMMENT YOUR FIREBASE CONFIG IMPORT

const MeshFinanceOverlay: React.FC = () => {
  const [incomeData, setIncomeData] = useState<MeshIncomeEvent[]>([]);
  const [nodeMetrics, setNodeMetrics] = useState<NodePerformanceMetrics[]>([]);

  useEffect(() => {
    const incomeCollection = collection(db, 'meshIncomeEvents');
    const nodeMetricsCollection = collection(db, 'nodePerformanceMetrics');

    const unsubscribeIncome = onSnapshot(incomeCollection, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MeshIncomeEvent));
      setIncomeData(data);
    });

    const unsubscribeNodeMetrics = onSnapshot(nodeMetricsCollection, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NodePerformanceMetrics));
      setNodeMetrics(data);
    });

    return () => {
      unsubscribeIncome();
      unsubscribeNodeMetrics();
    };
  }, []);

  return (
    <div>
      <h2>Mesh Finance Overlay</h2>
      <IncomeHeatmap incomeData={incomeData} />
      <NodeEarningsRadar nodeMetrics={nodeMetrics} />
    </div>
  );
};

export default MeshFinanceOverlay;