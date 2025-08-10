"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp } from "lucide-react";
import { useUser } from "@/hooks/use-user"; // Import useUser
import { canUserPerform } from "@/lib/roles"; // Import canUserPerform
import { useQuery } from '@tanstack/react-query'; // Import useQuery
import axios from 'axios'; // Import axios

// Define the required action to view financial data
const REQUIRED_ACTION = 'viewFinancials';

// Define the type for the financial data fetched from the API
interface RevenueChartDataPoint {
  date: string;
  actual?: number;
  forecast?: number;
}

// Function to fetch financial data from the API
async function fetchRevenueChartData(): Promise<RevenueChartDataPoint[]> {
  const { data } = await axios.get('/api/financial-data');
  return data.revenueChartData; // Assuming the API returns { revenueChartData: [...] }
}

export default function RevenueChart() {
    const { user, loading: userLoading } = useUser(); // Get user and loading state

    // Determine if the user has permission (wait until user data is loaded)
    const hasPermission = !userLoading && user ? canUserPerform(user.role, REQUIRED_ACTION) : false;

    // Fetch data using react-query (only if user has permission)
    const { data: revenueChartData, isLoading: chartLoading, isError: chartError } = useQuery<RevenueChartDataPoint[], Error>(
        ['revenue-chart'],
        fetchRevenueChartData,
        {
            enabled: hasPermission, // Only fetch if user has permission
            staleTime: 60 * 1000, // Data is considered fresh for 60 seconds
        }
    );

    // Display loading state or permission denied message
    if (userLoading || (chartLoading && hasPermission)) {
        return <div>Loading Revenue Chart...</div>; // Or a skeleton loader
    }

    if (!user) {
        return <div>Please log in to view the revenue chart.</div>; // Or handle as unauthorized
    }

    if (!hasPermission) {
        return <div>Your role does not have permission to view the revenue chart.</div>; // Permission denied message
    }

    if (chartError) {
        return <div>Error loading revenue chart.</div>; // Error message
    }

    // If data is loaded and user has permission, display the chart
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-accent" />Revenue Forecast vs Actual</CardTitle>
                <CardDescription>Tracking predictive accuracy for financial planning.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                            dataKey="date"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
                        />
                        <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${new Intl.NumberFormat('en-US', { notation: 'compact' }).format(value)}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                borderColor: "hsl(var(--border))"
                            }}
                            formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="actual"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 8 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="forecast"
                            stroke="hsl(var(--accent))"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}