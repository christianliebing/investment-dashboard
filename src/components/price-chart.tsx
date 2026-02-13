"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { MarketIndex } from "@/lib/market-data";

interface PriceChartProps {
    data: MarketIndex;
}

export function PriceChart({ data }: PriceChartProps) {
    // Generate mock historical data (in production, fetch real historical data)
    const generateHistoricalData = () => {
        const points = 30; // 30 days
        const currentPrice = data.price;
        const volatility = 0.02; // 2% daily volatility
        const trend = (currentPrice - (data.twoHundredDayAverage || currentPrice)) / 200; // Trend based on 200DMA

        const historicalData = [];
        let price = currentPrice * 0.95; // Start 5% lower

        for (let i = 0; i < points; i++) {
            const randomChange = (Math.random() - 0.5) * volatility;
            price = price * (1 + randomChange + trend);

            historicalData.push({
                date: new Date(Date.now() - (points - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                price: parseFloat(price.toFixed(2)),
            });
        }

        // Add current price as last point
        historicalData.push({
            date: 'Now',
            price: currentPrice,
        });

        return historicalData;
    };

    const chartData = generateHistoricalData();
    const minPrice = Math.min(...chartData.map(d => d.price));
    const maxPrice = Math.max(...chartData.map(d => d.price));
    const padding = (maxPrice - minPrice) * 0.1;

    return (
        <div className="w-full h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11 }}
                        stroke="#71717a"
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        domain={[minPrice - padding, maxPrice + padding]}
                        tick={{ fontSize: 11 }}
                        stroke="#71717a"
                        tickFormatter={(value) => `$${value.toFixed(0)}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e4e4e7',
                            borderRadius: '8px',
                            fontSize: '12px'
                        }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                    />
                    {data.fiftyDayAverage && (
                        <ReferenceLine
                            y={data.fiftyDayAverage}
                            stroke="#3b82f6"
                            strokeDasharray="3 3"
                            label={{ value: '50 DMA', position: 'right', fontSize: 10, fill: '#3b82f6' }}
                        />
                    )}
                    {data.twoHundredDayAverage && (
                        <ReferenceLine
                            y={data.twoHundredDayAverage}
                            stroke="#8b5cf6"
                            strokeDasharray="3 3"
                            label={{ value: '200 DMA', position: 'right', fontSize: 10, fill: '#8b5cf6' }}
                        />
                    )}
                    <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
