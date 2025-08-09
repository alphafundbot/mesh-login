
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { useUser } from "./use-user";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  const signIn = async (email: string, password: string):Promise<Error | null> => {
    setLoading(true);
    try {
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
      await signOut(auth);
      router.push("/login");
    } catch (error: any) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, signIn, logOut };
}
