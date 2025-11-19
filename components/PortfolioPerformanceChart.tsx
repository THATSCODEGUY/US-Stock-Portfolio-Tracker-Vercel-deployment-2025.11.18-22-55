import React, { useEffect, useRef, useState } from 'react';
import { type HistoricalDataPoint } from '../types';

declare global {
    interface Window {
        Chart: any;
    }
}

interface PortfolioPerformanceChartProps {
    data: HistoricalDataPoint[];
    onTimeRangeChange: (days: number) => void;
    isLoading: boolean;
}

export const PortfolioPerformanceChart: React.FC<PortfolioPerformanceChartProps> = ({ data, onTimeRangeChange, isLoading }) => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstance = useRef<any>(null);
    const [activeRange, setActiveRange] = useState('1M');

    const ranges: { [key: string]: number } = {
        '1M': 30,
        '6M': 182,
        '1Y': 365,
        '5Y': 1825,
        'All': 10000,
    };

    const handleRangeClick = (range: string) => {
        setActiveRange(range);
        onTimeRangeChange(ranges[range]);
    };

    useEffect(() => {
        if (!chartRef.current || !window.Chart || isLoading || data.length === 0) return;
        
        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

        const chartData = {
            labels: data.map(d => d.date),
            datasets: [{
                label: 'Portfolio Value',
                data: data.map(d => d.value),
                borderColor: '#10b981', // green-accent
                backgroundColor: gradient,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointBackgroundColor: '#10b981',
                tension: 0.1,
                fill: true,
            }]
        };
        
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: {
                        color: '#9ca3af', // gray-400
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 7,
                    },
                    grid: {
                        color: 'rgba(156, 163, 175, 0.1)' // gray-400 with opacity
                    }
                },
                y: {
                    ticks: {
                        color: '#9ca3af', // gray-400
                        callback: function(value: number) {
                             if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M';
                             if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'K';
                             return '$' + value.toFixed(0);
                        }
                    },
                    grid: {
                        color: 'rgba(156, 163, 175, 0.1)' // gray-400 with opacity
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context: any) {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false,
            },
        };

        if (chartInstance.current) {
            chartInstance.current.data = chartData;
            chartInstance.current.options = chartOptions;
            chartInstance.current.update();
        } else {
            chartInstance.current = new window.Chart(ctx, {
                type: 'line',
                data: chartData,
                options: chartOptions
            });
        }
        
        return () => {
            if(chartInstance.current) {
                chartInstance.current.destroy();
                chartInstance.current = null;
            }
        }

    }, [data, isLoading]);
    

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 h-80 flex flex-col">
             <div className="flex-shrink-0">
                <div className="flex space-x-1 mb-4">
                    {Object.keys(ranges).map(range => (
                        <button
                            key={range}
                            onClick={() => handleRangeClick(range)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                                activeRange === range
                                    ? 'bg-green-accent text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-grow relative">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-gray-400">Loading chart data...</p>
                    </div>
                ) : data.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-gray-400">
                         <h3 className="text-xl font-semibold mb-2">No Performance Data</h3>
                         <p>Add transactions to see your portfolio's performance over time.</p>
                    </div>
                ) : (
                    <canvas ref={chartRef}></canvas>
                )}
            </div>
        </div>
    );
};
