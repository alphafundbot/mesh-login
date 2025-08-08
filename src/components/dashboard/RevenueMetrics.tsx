
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, TrendingUp, TrendingDown, Target } from "lucide-react";
import { revenueMetricsData } from "@/lib/financial-data";
import { Badge } from "../ui/badge";

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(value);
};

const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 1 }).format(value);
}

const metrics = [
    {
        icon: DollarSign,
        title: "Total Revenue (YTD)",
        value: formatCurrency(revenueMetricsData.totalRevenueYTD),
        description: "Sum of all income streams year-to-date."
    },
    {
        icon: TrendingUp,
        title: "Monthly Recurring Revenue",
        value: formatCurrency(revenueMetricsData.mrr),
        description: "Predictable subscription-based income."
    },
    {
        icon: Target,
        title: "Customer Lifetime Value",
        value: formatCurrency(revenueMetricsData.clv),
        description: "Average total revenue per customer."
    },
    {
        icon: TrendingDown,
        title: "Churn Rate",
        value: formatPercentage(revenueMetricsData.churnRate),
        description: "Percentage of customers lost per period."
    },
    {
        icon: TrendingUp,
        title: "Revenue Growth Rate",
        value: formatPercentage(revenueMetricsData.revenueGrowthRate),
        description: "Month-over-month growth.",
        badge: "YoY"
    }
];

export default function RevenueMetrics() {
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
