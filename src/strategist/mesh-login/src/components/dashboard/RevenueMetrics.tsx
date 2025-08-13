"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, TrendingUp, TrendingDown, Target } from "lucide-react";
import { Badge } from "../ui/badge";
import { useUser } from "@/hooks/use-user"; // Import useUser
import { canUserPerform } from "@/lib/roles"; // Import canUserPerform
import { useQuery } from '@tanstack/react-query'; // Import useQuery
import axios from 'axios'; // Import axios

// Define the required action to view financial data
const REQUIRED_ACTION = 'viewFinancials';

// Define the type for the financial data fetched from the API
interface RevenueMetricsData {
    totalRevenueYTD: number;
    mrr: number;
    clv: number;
    churnRate: number;
    revenueGrowthRate: number;
}

// Function to fetch financial data from the API
async function fetchRevenueMetricsData(): Promise<RevenueMetricsData> {
  const { data } = await axios.get('/api/financial-data');
  return data.revenueMetricsData; // Assuming the API returns { revenueMetricsData: {...} }
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(value);
};

const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 1 }).format(value);
}

export default function RevenueMetrics() {
    const { user, loading: userLoading } = useUser(); // Get user and loading state

    // Determine if the user has permission (wait until user data is loaded)
    const hasPermission = !userLoading && user ? canUserPerform(user.role, REQUIRED_ACTION) : false;

    // Fetch data using react-query (only if user has permission)
    const { data: revenueMetrics, isLoading: metricsLoading, isError: metricsError } = useQuery<RevenueMetricsData, Error>(
        ['revenue-metrics'],
        fetchRevenueMetricsData,
        {
            enabled: hasPermission, // Only fetch if user has permission
            staleTime: 60 * 1000, // Data is considered fresh for 60 seconds
        }
    );

    // Display loading state or permission denied message
    if (userLoading || (metricsLoading && hasPermission)) {
        return <div>Loading Financial Metrics...</div>; // Or a skeleton loader
    }

    if (!user) {
        return <div>Please log in to view financial metrics.</div>; // Or handle as unauthorized
    }

    if (!hasPermission) {
        return <div>Your role does not have permission to view financial metrics.</div>; // Permission denied message
    }

    if (metricsError) {
        return <div>Error loading financial metrics.</div>; // Error message
    }

    // If data is loaded and user has permission, display the metrics
    const metrics = [
        {
            icon: DollarSign,
            title: "Total Revenue (YTD)",
            value: formatCurrency(revenueMetrics.totalRevenueYTD),
            description: "Sum of all income streams year-to-date."
        },
        {
            icon: TrendingUp,
            title: "Monthly Recurring Revenue",
            value: formatCurrency(revenueMetrics.mrr),
            description: "Predictable subscription-based income."
        },
        {
            icon: Target,
            title: "Customer Lifetime Value",
            value: formatCurrency(revenueMetrics.clv),
            description: "Average total revenue per customer."
        },
        {
            icon: TrendingDown,
            title: "Churn Rate",
            value: formatPercentage(revenueMetrics.churnRate),
            description: "Percentage of customers lost per period."
        },
        {
            icon: TrendingUp,
            title: "Revenue Growth Rate",
            value: formatPercentage(revenueMetrics.revenueGrowthRate),
            description: "Month-over-month growth.",
            badge: "YoY"
        }
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {metrics.map((metric, index) => (
                <Card key={index} className="transition-shadow duration-300 hover:shadow-xl hover:border-accent/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                        <metric.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metric.value}</div>
                        <p className="text-xs text-muted-foreground">{metric.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}