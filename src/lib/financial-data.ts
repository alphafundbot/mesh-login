
import { domainData } from './domains';

// Mock financial data for each domain
export const domainFinancials: Record<string, { revenue: number, cost: number, roi: number }> = {};

domainData.forEach(domain => {
    const revenue = Math.random() * 500000 + 100000; // Random revenue between 100k and 600k
    const cost = Math.random() * 80000 + 20000; // Random cost between 20k and 100k
    domainFinancials[domain.slug] = {
        revenue,
        cost,
        roi: revenue / cost,
    };
});


// Mock data for the revenue chart
export const revenueChartData = [
    { date: "2024-01-01", actual: 2890, forecast: 2200 },
    { date: "2024-02-01", actual: 2756, forecast: 2500 },
    { date: "2024-03-01", actual: 3322, forecast: 3100 },
    { date: "2024-04-01", actual: 3470, forecast: 3400 },
    { date: "2024-05-01", actual: 3475, forecast: 3600 },
    { date: "2024-06-01", actual: 3129, forecast: 3200 },
    { date: "2024-07-01", actual: 3780, forecast: 3800 },
    { date: "2024-08-01", actual: 4100, forecast: 4000 },
];

// Mock data for revenue metrics
export const revenueMetricsData = {
    totalRevenueYTD: 3450000,
    mrr: 287500,
    clv: 1250,
    churnRate: 0.023,
    revenueGrowthRate: 0.15,
};

// Generates simulated currency data for the CurrencySignalModule
export const generateCurrencyData = () => {
    const baseCurrency = 'USD';
    const currencies = ['EUR', 'JPY', 'GBP', 'CAD'];

    const generateRates = (offset = 0) => {
        return currencies.map(currency => {
            let baseRate;
            switch (currency) {
                case 'EUR': baseRate = 0.92; break;
                case 'JPY': baseRate = 157; break;
                case 'GBP': baseRate = 0.78; break;
                case 'CAD': baseRate = 1.37; break;
                default: baseRate = 1;
            }
            return {
                currency,
                rate: baseRate + (Math.random() - 0.5) * 0.1 + offset, // Add offset for historical data
            }
        });
    };

    const historicalRates = [
        { date: '2024-08-01', rates: generateRates(-0.05) },
        { date: '2024-07-01', rates: generateRates(-0.02) },
        { date: '2024-06-01', rates: generateRates(0.03) },
    ];
    
    const currentRates = generateRates();

    return { baseCurrency, historicalRates, currentRates };
};
