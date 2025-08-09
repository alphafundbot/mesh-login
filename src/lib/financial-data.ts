
export const revenueMetricsData = {
    totalRevenueYTD: 12543000,
    mrr: 985000,
    clv: 12500,
    churnRate: 0.02,
    revenueGrowthRate: 0.15,
};

export const resourceAllocationData = [
    { name: 'System Core', budget: 100000, value: 75000 },
    { name: 'Finance', budget: 500000, value: 450000 },
    { name: 'Cloud/DevOps', budget: 120000, value: 95000 },
    { name: 'Telecom/IoT', budget: 80000, value: 60000 },
    { name: 'Medical/Bio', budget: 200000, value: 180000 },
    { name: 'Legal/Identity', budget: 70000, value: 50000 },
    { name: 'UI/Experience', budget: 40000, value: 35000 },
    { name: 'Security', budget: 90000, value: 85000 },
    { name: 'Planetary/Eco', budget: 60000, value: 40000 },
];

export const revenueChartData = [
    { date: "2024-01-01", actual: 850000, forecast: 800000 },
    { date: "2024-02-01", actual: 880000, forecast: 820000 },
    { date: "2024-03-01", actual: 920000, forecast: 900000 },
    { date: "2024-04-01", actual: 950000, forecast: 940000 },
    { date: "2024-05-01", actual: 985000, forecast: 970000 },
    { date: "2024-06-01", actual: 1050000, forecast: 1000000 },
    { date: "2024-07-01", forecast: 1080000 },
    { date: "2024-08-01", forecast: 1120000 },
];

export const domainFinancials: Record<string, { revenue: number; cost: number; assets: number; roi: number; }> = {
    "system-core": { revenue: 500000, cost: 75000, assets: 1000000, roi: 6.67 },
    "finance-trading": { revenue: 4500000, cost: 450000, assets: 25000000, roi: 10.0 },
    "cloud-devops": { revenue: 1200000, cost: 95000, assets: 500000, roi: 12.6 },
    "telecom-iot": { revenue: 850000, cost: 60000, assets: 2000000, roi: 14.1 },
    "medical-bio": { revenue: 2500000, cost: 180000, assets: 10000000, roi: 13.8 },
    "legal-identity": { revenue: 300000, cost: 50000, assets: 250000, roi: 6.0 },
    "ui-experience": { revenue: 100000, cost: 35000, assets: 50000, roi: 2.8 },
    "security-privacy": { revenue: 750000, cost: 85000, assets: 750000, roi: 8.8 },
    "planetary-eco": { revenue: 400000, cost: 40000, assets: 1500000, roi: 10.0 },
};

export const generateCurrencyData = () => {
    const baseCurrency = "USD";
    const currencies = ["EUR", "INR", "JPY", "GBP", "AUD", "CAD", "CHF"];
    const baseRates: { [key: string]: number } = {
        EUR: 0.92,
        INR: 83.5,
        JPY: 157.0,
        GBP: 0.78,
        AUD: 1.5,
        CAD: 1.37,
        CHF: 0.9,
    };

    const currentRates = currencies.map(currency => ({
        currency,
        rate: baseRates[currency] * (1 + (Math.random() - 0.5) * 0.02) // up to 1% fluctuation
    }));

    const historicalRates = [
        {
            date: "2025-08-16",
            rates: currencies.map(currency => ({ currency, rate: baseRates[currency] * (1 + (Math.random() - 0.5) * 0.05) }))
        },
        {
            date: "2025-08-15",
            rates: currencies.map(currency => ({ currency, rate: baseRates[currency] * (1 + (Math.random() - 0.5) * 0.05) }))
        }
    ];

    return { baseCurrency, currentRates, historicalRates };
};
