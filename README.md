# Stratagem.ai - Strategist Grade Mesh Manifest

# Strategist IAM Mutation Module

This repository contains the source code for Stratagem.ai, a strategist-grade Heads-Up Display (HUD) for monitoring and interacting with complex, multi-domain mesh systems.

## Core Architecture

This is a [Next.js](https://nextjs.org/) application built with the App Router, leveraging React Server Components (RSC) for performance and a rich, interactive user experience. The backend services, including authentication and database, are powered by [Firebase](https://firebase.google.com/).

### Key Technologies
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **UI**: React, ShadCN, Tailwind CSS
- **AI/Generative**: Firebase Genkit
- **Backend**: Firebase (Authentication, Firestore)

---

## Architectural Principles & Overrides

This mesh adheres to strict architectural principles to ensure stability, performance, and auditability. The following represent key "strategist-grade" overrides that have been implemented to maintain system integrity.

### 1. Hydration Lockdown Protocol (SSR Guarding)

A critical architectural pattern in this application is the strict separation of server-side and client-side execution contexts, particularly concerning Firebase operations.

**Problem:** Initial versions of the application suffered from persistent `FirebaseError: Failed to get document because the client is offline` errors. This was caused by attempts to access the client-side Firebase SDK during Next.js Server-Side Rendering (SSR) or within React Server Components (RSC). The server context has no authenticated Firebase client, leading to hydration failures.

**Solution (The Hydration Override):**
All Firestore (and other client-side Firebase SDK) calls are strictly gated to prevent execution on the server. This is enforced through two primary checks:
1.  A utility function, `isBrowser()`, confirms the code is running in a browser environment.
2.  The `useUser()` hook confirms that a user is authenticated via `onAuthStateChanged`.

This ensures that no database queries are attempted until the application has fully hydrated on the client and a stable, authenticated session is established.

**Example Implementation:**
```tsx
import { isBrowser } from '@/lib/env-check';
import { useUser } from '@/hooks/use-user';

function Component() {
  const { user } = useUser();

  useEffect(() => {
    // Gate ensures code only runs client-side AFTER authentication.
    if (!isBrowser() || !user) {
      return;
    }

    const fetchData = async () => {
      // Safe to perform Firestore operations here
    };

    fetchData();
  }, [user]); // Effect re-runs when user state changes.

  return (
    // ...
  );
}
```

This pattern has been systematically applied across all relevant components to ensure mesh stability.

---

## Getting Started

To get started with local development, first install the dependencies:
```bash
npm install
```

Then, run the development server:
```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result. You can start editing the main page by modifying `src/app/page.tsx`.
