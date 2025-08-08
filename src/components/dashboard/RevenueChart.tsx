
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { revenueChartData } from "@/lib/financial-data";
import { TrendingUp } from "lucide-react";

export default function RevenueChart() {
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
