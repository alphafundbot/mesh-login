"use client";

import { useAuth } from "@/hooks/use-auth";
import React from "react";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  if (!user) {
    // Redirect to login or show a message
    return <div>Please log in to view the dashboard.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Strategist Dashboard</h1>
      <p className="mb-6">Welcome, {user.email || user.uid}!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Login History Placeholder */}
        <div className="bg-gray-100 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Login History</h2>
          <p>
            {/* This section will display login history using ActionLog data */}
            Login history data will be loaded here.
          </p>
        </div>

        {/* Override Events Placeholder */}
        <div className="bg-gray-100 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Override Events</h2>
          <p>
            {/* This section will display override events using ParsedDetails and ActionLog data */}
            Override events data will be loaded here.
          </p>
        </div>

        {/* Risk Clusters Placeholder */}
        <div className="bg-gray-100 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Risk Clusters</h2>
          <p>
            {/* This section will display risk clusters using ClusterMap data */}
            Risk clusters data will be loaded here.
          </p>
        </div>
      </div>

      {/* Additional Dashboard Sections can be added here */}
    </div>
  );
}