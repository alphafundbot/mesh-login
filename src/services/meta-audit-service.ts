
'use server';
/**
 * @fileOverview A service for interacting with the meta-audit results in Firestore.
 */

import { firestore } from "@/lib/firebaseConfig";
import type { CodeAnalysisOutput } from "@/ai/flows/code-intelligence-flow";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

export interface AuditResult {
  analysis: CodeAnalysisOutput;
  auditedAt: Date;
}

// Function to escape characters that are invalid for Firestore document IDs
const sanitizeDocId = (id: string): string => {
  return id.replace(/[\/.]/g, '_');
};

const desanitizeDocId = (id: string): string => {
  // This is a best-effort reversal. It assumes original didn't have underscores.
  // A more robust solution would store the original path in the document itself.
  return id.replace(/_/g, '/');
}

/**
 * Updates or creates an audit result in Firestore.
 * @param filePath The path of the file that was audited.
 * @param analysis The analysis output from the Code Intelligence flow.
 */
export async function updateAuditResult(
  filePath: string,
  analysis: CodeAnalysisOutput
): Promise<void> {
  const docId = sanitizeDocId(filePath);
  const docRef = doc(firestore, "meta_audit_results", docId);
  await setDoc(docRef, {
    analysis,
    filePath, // Store original path
    auditedAt: serverTimestamp(),
  });
}

/**
 * Fetches all audit results from Firestore.
 * @returns A record mapping file paths to their audit results.
 */
export async function getAuditResults(): Promise<Record<string, AuditResult>> {
  const collectionRef = collection(firestore, "meta_audit_results");
  const snapshot = await getDocs(collectionRef);
  
  const results: Record<string, AuditResult> = {};
  
  snapshot.forEach((doc) => {
    const data = doc.data();
    // Convert Firestore Timestamp to JS Date
    const auditedAt = (data.auditedAt as Timestamp)?.toDate();
    
    // Use the stored original file path, or fall back to desanitizing the ID
    const originalFilePath = data.filePath || desanitizeDocId(doc.id);

    if (auditedAt) {
        results[originalFilePath] = {
            analysis: data.analysis,
            auditedAt: auditedAt,
        };
    }
  });
  
  return results;
}
