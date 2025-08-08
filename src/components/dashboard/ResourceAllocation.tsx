
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { resourceAllocationData } from "@/lib/financial-data";
import { Package } from "lucide-react";

export default function ResourceAllocation() {
    const chartData = resourceAllocationData.map(item => ({
        ...item,
        utilization: (item.value / item.budget) * 100,
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-accent" />Resource Allocation & Burn</CardTitle>
                <CardDescription>Current utilization against budget for key operational areas.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} layout="vertical">
                        <XAxis
                            type="number"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickFormatter={(value) => `${value}%`}
                            domain={[0, 100]}
                        />
                        <YAxis
                            dataKey="name"
                            type="category"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            width={110}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                borderColor: "hsl(var(--border))"
                            }}
                            formatter={(value, name, props) => {
                                if (name === 'utilization') {
                                    return [`${Number(value).toFixed(1)}%`, 'Utilization'];
                                }
                                return [value, name];
                            }}
                        />
                        <Legend />
                        <Bar
                            dataKey="utilization"
                            fill="hsl(var(--primary))"
                            radius={[0, 4, 4, 0]}
                            background={{ fill: 'hsl(var(--muted))', radius: 4 }}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
