import React, { useState, useEffect, useRef } from 'react';
import { type Position } from '../types';

interface PortfolioTableProps {
  positions: Position[];
  isLoading: boolean;
}

const PortfolioTableRow: React.FC<{ position: Position }> = ({ position }) => {
  const { ticker, shares, averageCost, currentPrice } = position;

  const costBasis = shares * averageCost;
  const marketValue = shares * currentPrice;
  const gainLoss = marketValue - costBasis;
  const gainLossPercent = costBasis === 0 ? 0 : (gainLoss / costBasis) * 100;
  const isPositiveGain = gainLoss >= 0;

  const [flashClass, setFlashClass] = useState('');
  const prevPriceRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (prevPriceRef.current !== undefined && prevPriceRef.current !== currentPrice) {
      const flash = currentPrice > prevPriceRef.current ? 'flash-green' : 'flash-red';
      setFlashClass(flash);
      const timer = setTimeout(() => setFlashClass(''), 700);
      return () => clearTimeout(timer);
    }
    prevPriceRef.current = currentPrice;
  }, [currentPrice]);

  return (
    <tr className="border-b border-gray-700">
      <td className="p-4 font-medium text-white font-bold text-base">{ticker}</td>
      <td className="p-4 text-left">{shares.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
      <td className="p-4 text-left">{averageCost.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
      <td className="p-4 text-left">{costBasis.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
      <td className={`p-4 text-left font-semibold relative ${flashClass}`}>
        {currentPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
      </td>
      <td className="p-4 text-left">{marketValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
      <td className={`p-4 text-left font-semibold ${isPositiveGain ? 'text-green-accent' : 'text-red-accent'}`}>
        {gainLoss.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
      </td>
      <td className={`p-4 text-left font-semibold ${isPositiveGain ? 'text-green-accent' : 'text-red-accent'}`}>
        {gainLossPercent.toFixed(2)}%
      </td>
    </tr>
  );
};


export const PortfolioTable: React.FC<PortfolioTableProps> = ({ positions, isLoading }) => {
  if (isLoading && positions.length === 0) {
     return (
      <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400 shadow-lg">
        <h3 className="text-xl font-semibold mb-2">Loading portfolio...</h3>
        <p>Fetching the latest market data for your holdings.</p>
      </div>
    );
  }
  
  if (positions.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400 shadow-lg">
        <h3 className="text-xl font-semibold mb-2">Your portfolio is empty</h3>
        <p>Add a new transaction using the form on the right to start tracking your stocks.</p>
      </div>
    );
  }
  
  return (
    <>
    <style>{`
      @keyframes flash-green-bg {
        from { background-color: rgba(16, 185, 129, 0.4); }
        to { background-color: transparent; }
      }
      .flash-green {
        animation: flash-green-bg 0.7s ease-out;
      }
      @keyframes flash-red-bg {
        from { background-color: rgba(239, 68, 68, 0.4); }
        to { background-color: transparent; }
      }
      .flash-red {
        animation: flash-red-bg 0.7s ease-out;
      }
    `}</style>
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-gray-700">
            <tr>
              <th scope="col" className="p-4">Ticker</th>
              <th scope="col" className="p-4 text-left">Shares</th>
              <th scope="col" className="p-4 text-left">Avg. Cost</th>
              <th scope="col" className="p-4 text-left">Total Cost</th>
              <th scope="col" className="p-4 text-left">Current Price</th>
              <th scope="col" className="p-4 text-left">Market Value</th>
              <th scope="col" className="p-4 text-left">Gain/Loss</th>
              <th scope="col" className="p-4 text-left">Return</th>
            </tr>
          </thead>
          <tbody>
            {positions.map(pos => (
              <PortfolioTableRow key={pos.ticker} position={pos} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
};