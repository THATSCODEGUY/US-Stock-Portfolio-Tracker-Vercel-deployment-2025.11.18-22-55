import React, { useState, useEffect } from 'react';
import { TrendingUpIcon, DollarSignIcon, WalletIcon, PencilIcon, XMarkIcon, CheckIcon } from './icons';

interface SummaryData {
  totalMarketValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  tradingCash: number;
}

interface PortfolioSummaryProps {
  data: SummaryData;
  onUpdateCash: (newCash: number) => void;
}

const SummaryCard: React.FC<{ 
  title: string; 
  value: number; 
  change?: number; 
  changePercent?: number; 
  icon: React.ReactElement<{ className?: string }>; 
  isPositive?: boolean;
  isEditable?: boolean;
  onSave?: (newValue: number) => void;
}> = ({ title, value, change, changePercent, icon, isPositive, isEditable = false, onSave }) => {
    
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value.toString());

    useEffect(() => {
        if (!isEditing) {
            setEditValue(value.toString());
        }
    }, [value, isEditing]);

    const handleSave = () => {
        const newValue = parseFloat(editValue);
        if (!isNaN(newValue) && onSave) {
            onSave(newValue);
        }
        setIsEditing(false);
    };

    const iconBgColor = isPositive === true ? 'bg-green-900/50' : isPositive === false ? 'bg-red-900/50' : 'bg-blue-900/50';
    const iconTextColor = isPositive === true ? 'text-green-accent' : isPositive === false ? 'text-red-accent' : 'text-blue-400';
    
    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg flex items-start space-x-4">
            <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full ${iconBgColor}`}>
                {React.cloneElement(icon, { className: `h-6 w-6 ${iconTextColor}` })}
            </div>
            <div className="flex-grow">
                <p className="text-sm text-gray-400">{title}</p>
                {isEditing ? (
                    <div className="flex items-center mt-1">
                        <input 
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                          className="w-full bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-2xl font-bold text-white focus:outline-none focus:ring-green-accent focus:border-green-accent"
                          autoFocus
                        />
                    </div>
                ) : (
                    <p className="text-3xl font-bold text-white tracking-tight">
                        {value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </p>
                )}
                {change !== undefined && changePercent !== undefined && !isEditing && (
                    <div className={`flex items-center text-sm mt-1 ${isPositive ? 'text-green-accent' : 'text-red-accent'}`}>
                        <TrendingUpIcon className={`h-4 w-4 mr-1 ${isPositive ? '' : 'transform rotate-180'}`} />
                        <span>
                            {change.toLocaleString('en-US', { style: 'currency', currency: 'USD', signDisplay: 'always' })} ({changePercent.toFixed(2)}%)
                        </span>
                    </div>
                )}
            </div>
            {isEditable && (
                <div className="flex-shrink-0">
                    {isEditing ? (
                         <div className="flex space-x-1">
                            <button onClick={handleSave} className="p-1.5 text-green-accent hover:bg-gray-700 rounded-full"><CheckIcon className="h-4 w-4" /></button>
                            <button onClick={() => setIsEditing(false)} className="p-1.5 text-red-accent hover:bg-gray-700 rounded-full"><XMarkIcon className="h-4 w-4" /></button>
                         </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full">
                           <PencilIcon className="h-4 w-4" />
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ data, onUpdateCash }) => {
  const { totalMarketValue, totalGainLoss, totalGainLossPercent, tradingCash } = data;
  const isPositive = totalGainLoss >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <SummaryCard 
        title="Portfolio Market Value"
        value={totalMarketValue}
        icon={<DollarSignIcon />}
      />
      <SummaryCard
        title="Total Gain / Loss"
        value={totalGainLoss}
        change={totalGainLoss}
        changePercent={totalGainLossPercent}
        icon={<TrendingUpIcon />}
        isPositive={isPositive}
      />
       <SummaryCard 
        title="Trading Cash"
        value={tradingCash}
        icon={<WalletIcon />}
        isEditable={true}
        onSave={onUpdateCash}
      />
    </div>
  );
};