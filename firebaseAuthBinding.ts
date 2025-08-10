ts
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
// Assuming STRATEGIST_SIGNATURE is available via process.env
// import { STRATEGIST_SIGNATURE } from process.env;

const auth = getAuth();
const db = getFirestore();

const login = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  // Access STRATEGIST_SIGNATURE from process.env
  const strategistToken = process.env.STRATEGIST_SIGNATURE; // Using process.env directly

  if (userCredential.user) {
    await setDoc(doc(db, "users", userCredential.user.uid), {
      strategist_signature: strategistToken,
      last_login: new Date().toISOString()
    });
  }
};

// This file serves as a blueprint. You need to integrate this logic
// into your actual Firebase Auth login handler.