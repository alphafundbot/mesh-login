// src/hooks/use-auth.ts

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { setSession, clearSession } from '../strategist/StrategistSession'; // Use centralized StrategistSession
import { requestKeysFromMPC } from '../lib/mpc-client'; // Stubbed call
import { logAuditEvent } from '../lib/authAuditLogger'; // Use centralized audit logger
import { logTelemetryEvent } from '../monitoring/LoginTelemetry'; // Use centralized telemetry logger
import { StrategistUser } from '../lib/types'; // Use centralized StrategistUser type

/**
 * useAuth — Ritualized strategist authentication hook.
 * Implements login, logout, session handoff, MPC key retrieval, and audit-grade introspection.
 */
export function useAuth() {
  const [user, setUser] = useState<StrategistUser | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const auth = getAuth();
  const router = useRouter(); // Initialize useRouter

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
 setSession(strategistUser); // Use centralized setSession

      // 📡 Audit + telemetry
      logAuditEvent('LOGIN_SUCCESS', strategistUser);
      logTelemetryEvent('auth:login_success', { uid: strategistUser.uid, metadata: { email: strategistUser.email } }); // Use logTelemetryEvent

      // Redirect on successful login
      router.push('/');
      
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
      clearSession(); // Use centralized clearSession
      logAuditEvent('LOGOUT_SUCCESS', { uid: user?.uid });
      logTelemetryEvent('auth:logout_success', { uid: user?.uid }); // Use logTelemetryEvent

      // Redirect on logout
      router.push('/login');

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
