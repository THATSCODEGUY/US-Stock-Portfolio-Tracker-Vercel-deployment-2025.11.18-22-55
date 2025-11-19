import React, { useEffect, useRef } from 'react';
import { type Position } from '../types';

declare global {
    interface Window {
        Chart: any;
    }
}

interface PortfolioPieChartProps {
    positions: Position[];
}

const CHART_COLORS = [
  '#3b82f6', // blue-500
  '#ef4444', // red-500
  '#22c55e', // green-500
  '#eab308', // yellow-500
  '#8b5cf6', // violet-500
  '#f97316', // orange-500
  '#14b8a6', // teal-500
  '#ec4899', // pink-500
  '#6b7280', // gray-500
  '#06b6d4', // cyan-500
];

export const PortfolioPieChart: React.FC<PortfolioPieChartProps> = ({ positions }) => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstance = useRef<any>(null);
    
    const totalMarketValue = positions.reduce((acc, pos) => acc + (pos.shares * pos.currentPrice), 0);

    useEffect(() => {
        if (!chartRef.current || !window.Chart) {
            return;
        }
        
        const ctx = chartRef.current.getContext('2d');
        if (!ctx) {
            return;
        }

        const chartData = {
            labels: positions.map(p => p.ticker),
            datasets: [{
                label: 'Market Value',
                data: positions.map(p => p.shares * p.currentPrice),
                backgroundColor: CHART_COLORS,
                borderColor: '#1e1e1e', // gray-800
                borderWidth: 2,
                hoverOffset: 4,
            }]
        };

        if (chartInstance.current) {
            chartInstance.current.data = chartData;
            chartInstance.current.update();
        } else {
            chartInstance.current = new window.Chart(ctx, {
                type: 'doughnut',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                           display: false, // Disable default legend
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context: any) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed !== null) {
                                        label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed);
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    cutout: '60%',
                }
            });
        }
        
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
                chartInstance.current = null;
            }
        };

    }, [positions]);
    
    if (positions.length === 0) {
        return (
             <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400 shadow-lg h-80 flex items-center justify-center">
                <div>
                    <h3 className="text-xl font-semibold mb-2">No Data for Chart</h3>
                    <p>Add positions to see your portfolio distribution.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 h-80 flex items-center justify-center space-x-6">
            <div className="relative h-full w-1/2 max-w-[280px]">
                <canvas ref={chartRef}></canvas>
            </div>
            <div className="flex flex-col justify-center space-y-3">
                {positions.map((pos, index) => {
                    const marketValue = pos.shares * pos.currentPrice;
                    const percentage = totalMarketValue > 0 ? (marketValue / totalMarketValue) * 100 : 0;
                    const color = CHART_COLORS[index % CHART_COLORS.length];
                    return (
                        <div key={pos.ticker} className="flex items-center text-sm font-medium">
                            <span className="w-12 text-right text-gray-400 mr-2">{percentage.toFixed(1)}%</span>
                            <div style={{ backgroundColor: color }} className="w-4 h-4 rounded-sm mr-3"></div>
                            <span className="text-gray-200">{pos.ticker}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};