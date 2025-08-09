// src/replay/firestoreReplayViewer.tsx
import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseApp } from '../lib/firebaseConfig';

const db = getFirestore(firebaseApp);

export function FirestoreReplayViewer() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    async function fetchLogs() {
      const snapshot = await getDocs(collection(db, 'overrideLogs'));
      const data = snapshot.docs.map(doc => doc.data());
      setLogs(data);
    }
    fetchLogs();
  }, []);

  return (
    <div>
      <h2>Persistent Override Replay</h2>
      <ul>
        {logs.map((log, i) => (
          <li key={i}><strong>{log.timestamp}</strong>: {log.signal}</li>
        ))}
      </ul>
    </div>
  );
}