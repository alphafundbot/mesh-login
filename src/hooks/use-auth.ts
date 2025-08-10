// src/hooks/use-auth.ts

import { useState, useEffect, useCallback } from 'react';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { setStrategistSession, clearStrategistSession } from '@/lib/StrategistSession';
import { requestKeysFromMPC } from '@/lib/mpc-client'; // Stubbed call
import { logAuditEvent, logTelemetry } from '@/lib/telemetry';
import { StrategistUser } from '@/types/auth-models'; // Defined in data model spec

/**
 * useAuth — Ritualized strategist authentication hook.
 * Implements login, logout, session handoff, MPC key retrieval, and audit-grade introspection.
 */
export function useAuth() {
  const [user, setUser] = useState<StrategistUser | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const auth = getAuth();

  // 🔑 Login function: Firebase Auth + session + MPC + audit
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = credential.user;

      // 🌐 Transform FirebaseUser into StrategistUser
      const strategistUser: StrategistUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email ?? '',
        displayName: firebaseUser.displayName ?? '',
        photoURL: firebaseUser.photoURL ?? '',
        providerId: firebaseUser.providerId,
        lastLogin: new Date().toISOString(),
      };

      // 🧠 MPC key retrieval (stubbed)
      await requestKeysFromMPC(strategistUser.uid);

      // 🧭 Session handoff
      setStrategistSession(strategistUser);

      // 📡 Audit + telemetry
      logAuditEvent('LOGIN_SUCCESS', strategistUser);
      logTelemetry('auth:login', { uid: strategistUser.uid });

      setUser(strategistUser);
    } catch (err: any) {
      const message = err.message || 'Login failed';
      setError(message);
      logAuditEvent('LOGIN_FAILURE', { email, error: message });
    } finally {
      setLoading(false);
    }
  }, [auth]);

  // 🚪 Logout function: session clear + audit
  const logOut = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await signOut(auth);
      clearStrategistSession();
      logAuditEvent('LOGOUT_SUCCESS', { uid: user?.uid });
      logTelemetry('auth:logout', { uid: user?.uid });
      setUser(null);
    } catch (err: any) {
      const message = err.message || 'Logout failed';
      setError(message);
      logAuditEvent('LOGOUT_FAILURE', { uid: user?.uid, error: message });
    } finally {
      setLoading(false);
    }
  }, [auth, user]);

  // 🔄 Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const strategistUser: StrategistUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          displayName: firebaseUser.displayName ?? '',
          photoURL: firebaseUser.photoURL ?? '',
          providerId: firebaseUser.providerId,
          lastLogin: new Date().toISOString(),
        };
        setUser(strategistUser);
        setStrategistSession(strategistUser);
      } else {
        setUser(null);
        clearStrategistSession();
      }
    });

    return () => unsubscribe();
  }, [auth]);

  return {
    user,
    loading,
    error,
    login,
    logOut,
  };
}

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
