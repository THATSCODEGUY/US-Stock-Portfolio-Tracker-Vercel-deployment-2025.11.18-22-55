import React, { useState } from 'react';
import { type Transaction, type TransactionType } from '../types';
import { PlusCircleIcon } from './icons';
import { fetchQuote } from '../services/marketApi';

interface AddTransactionFormProps {
  // FIX: The parent component `Dashboard` provides user_id and account_id.
  // This component should not be responsible for them.
  onAddTransaction: (newTransaction: Omit<Transaction, 'id' | 'user_id' | 'account_id'>) => Promise<void>;
  disabled?: boolean;
}

export const AddPositionForm: React.FC<AddTransactionFormProps> = ({ onAddTransaction, disabled = false }) => {
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<TransactionType>('BUY');
  const [notes, setNotes] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker || !shares || !price || !date) {
      setError("Please fill out all required fields.");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const quote = await fetchQuote(ticker);

      await onAddTransaction({
        ticker: ticker.toUpperCase(),
        companyName: quote.companyName,
        shares: parseFloat(shares),
        price: parseFloat(price),
        date,
        type,
        notes,
      });

      setTicker('');
      setShares('');
      setPrice('');
      setDate(new Date().toISOString().split('T')[0]);
      setType('BUY');
      setNotes('');
    } catch (err) {
      if (err instanceof Error) {
        setError(`Could not find a valid ticker for "${ticker}". Please check the symbol and try again.`);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormDisabled = disabled || isLoading;

  return (
    <div className={`bg-gray-800 p-6 rounded-lg shadow-lg sticky top-8 ${disabled ? 'opacity-50' : ''}`}>
      <h3 className="text-xl font-bold mb-4 text-white flex items-center">
        <PlusCircleIcon className="h-6 w-6 mr-2 text-green-accent" />
        Add Transaction
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Type*</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input type="radio" value="BUY" checked={type === 'BUY'} onChange={() => setType('BUY')} className="form-radio h-4 w-4 text-green-accent bg-gray-700 border-gray-600 focus:ring-green-accent" disabled={isFormDisabled} />
              <span className="ml-2 text-white">Buy</span>
            </label>
            <label className="flex items-center">
              <input type="radio" value="SELL" checked={type === 'SELL'} onChange={() => setType('SELL')} className="form-radio h-4 w-4 text-red-accent bg-gray-700 border-gray-600 focus:ring-red-accent" disabled={isFormDisabled}/>
              <span className="ml-2 text-white">Sell</span>
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="ticker" className="block text-sm font-medium text-gray-300 mb-1">Ticker*</label>
          <input
            type="text"
            id="ticker"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-green-accent focus:border-green-accent"
            required
            placeholder="e.g., AAPL"
            disabled={isFormDisabled}
          />
        </div>
       
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="shares" className="block text-sm font-medium text-gray-300 mb-1">Shares*</label>
            <input
              type="number"
              id="shares"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-green-accent focus:border-green-accent"
              required
              min="0"
              step="any"
              placeholder="10"
              disabled={isFormDisabled}
            />
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">Price*</label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-green-accent focus:border-green-accent"
              required
              min="0"
              step="any"
              placeholder="150.75"
              disabled={isFormDisabled}
            />
          </div>
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">Date*</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-green-accent focus:border-green-accent"
            required
            disabled={isFormDisabled}
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-green-accent focus:border-green-accent"
            rows={2}
            placeholder="Optional"
            disabled={isFormDisabled}
          />
        </div>

        {error && <p className="text-sm text-red-accent bg-red-500/10 p-3 rounded-md">{error}</p>}
        
        <button
          type="submit"
          disabled={isFormDisabled}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-accent hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Verifying...' : 'Add Transaction'}
        </button>
      </form>
    </div>
  );
};