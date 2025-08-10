
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = async (email: string, password: string): Promise<Error | null> => {
    setLoading(true);
    try {
      if (!auth) {
        throw new Error("Firebase Auth is not initialized. Check your Firebase config.");
      }
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
      return null;
    } catch (error: any) {
      console.error("Login failed:", error);
      return error;
    } finally {
      setLoading(false);
    }
  };

  const logOut = async () => {
    setLoading(true);
    try {
      if (auth) {
        await signOut(auth);
      }
      router.push("/login");
    } catch (error: any) {
      console.error("Logout failed:", error);
      // Optionally show a toast notification on logout failure
    } finally {
      setLoading(false);
    }
  };

  return { login, logOut, loading };
}
