// src/replication/multiRegionReplicator.ts
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { firebaseApp } from '../lib/firebaseConfig';

export async function replicateToRegions(docPath: string, regions: string[]) {
  const db = getFirestore(firebaseApp);
  for (const region of regions) {
    // write copy to each regional endpoint
    await setDoc(doc(db, docPath), { region, replicatedAt: Date.now() }, { merge: true });
  }
}
