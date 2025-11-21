import React, { useState } from 'react';
import { type Transaction, type TransactionType } from '../types';
import { XMarkIcon, PlusCircleIcon, TrashIcon, ArrowUpCircleIcon, ArrowDownCircleIcon, BanknotesIcon } from './icons';

interface InvestmentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onAdd: (date: string, type: 'DEPOSIT' | 'WITHDRAWAL', amount: number, notes: string) => Promise<void>;
  onDelete: (transaction: Transaction) => Promise<void>;
}

export const InvestmentHistoryModal: React.FC<InvestmentHistoryModalProps> = ({ isOpen, onClose, transactions, onAdd, onDelete }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !date) return;
        
        setIsSubmitting(true);
        await onAdd(date, type, parseFloat(amount), notes);
        setIsSubmitting(false);
        
        // Reset form
        setAmount('');
        setNotes('');
        setDate(new Date().toISOString().split('T')[0]);
    };

    // Filter only deposits and withdrawals and sort by date
    const investmentTransactions = transactions
        .filter(tx => tx.type === 'DEPOSIT' || tx.type === 'WITHDRAWAL')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-800 rounded-t-lg">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <BanknotesIcon className="h-6 w-6 mr-2 text-blue-400" />
                        Original Investment History
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-grow overflow-hidden flex flex-col md:flex-row">
                    
                    {/* Left Side: Add Form */}
                    <div className="p-4 md:w-1/3 border-b md:border-b-0 md:border-r border-gray-700 bg-gray-800/50">
                        <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Add New Entry</h3>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Date</label>
                                <input 
                                    type="date" 
                                    value={date} 
                                    onChange={(e) => setDate(e.target.value)} 
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-1.5 px-2 text-sm text-white focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Type</label>
                                <div className="flex space-x-2">
                                    <label className={`flex-1 cursor-pointer flex items-center justify-center py-1.5 rounded-md border ${type === 'DEPOSIT' ? 'bg-green-900/30 border-green-500/50 text-green-400' : 'bg-gray-700 border-gray-600 text-gray-400'}`}>
                                        <input type="radio" className="hidden" checked={type === 'DEPOSIT'} onChange={() => setType('DEPOSIT')} />
                                        <span className="text-xs font-medium">Deposit</span>
                                    </label>
                                    <label className={`flex-1 cursor-pointer flex items-center justify-center py-1.5 rounded-md border ${type === 'WITHDRAWAL' ? 'bg-red-900/30 border-red-500/50 text-red-400' : 'bg-gray-700 border-gray-600 text-gray-400'}`}>
                                        <input type="radio" className="hidden" checked={type === 'WITHDRAWAL'} onChange={() => setType('WITHDRAWAL')} />
                                        <span className="text-xs font-medium">Withdraw</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Amount</label>
                                <input 
                                    type="number" 
                                    value={amount} 
                                    onChange={(e) => setAmount(e.target.value)} 
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-1.5 px-2 text-sm text-white focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Notes (Optional)</label>
                                <input 
                                    type="text" 
                                    value={notes} 
                                    onChange={(e) => setNotes(e.target.value)} 
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-1.5 px-2 text-sm text-white focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium transition-colors flex items-center justify-center disabled:opacity-50"
                            >
                                {isSubmitting ? 'Saving...' : (
                                    <>
                                        <PlusCircleIcon className="h-4 w-4 mr-1.5" />
                                        Add Entry
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Right Side: History List */}
                    <div className="flex-grow flex flex-col p-4 md:w-2/3">
                        <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Transaction Log</h3>
                        <div className="flex-grow overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            {investmentTransactions.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">
                                    <p>No history yet.</p>
                                    <p className="text-xs">Add your first deposit to start tracking.</p>
                                </div>
                            ) : (
                                investmentTransactions.map(tx => (
                                    <div key={tx.id} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-full ${tx.type === 'DEPOSIT' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                                {tx.type === 'DEPOSIT' ? <ArrowUpCircleIcon className="h-5 w-5" /> : <ArrowDownCircleIcon className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">
                                                    {tx.type === 'DEPOSIT' ? 'Deposit' : 'Withdrawal'}
                                                </p>
                                                <p className="text-xs text-gray-400">{tx.date}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-mono font-medium ${tx.type === 'DEPOSIT' ? 'text-green-400' : 'text-red-400'}`}>
                                                {tx.type === 'DEPOSIT' ? '+' : '-'}{(tx.shares * tx.price).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                            </p>
                                            {tx.notes && <p className="text-xs text-gray-500 max-w-[120px] truncate">{tx.notes}</p>}
                                        </div>
                                        <button 
                                            onClick={() => onDelete(tx)}
                                            className="ml-3 text-gray-500 hover:text-red-400 p-1.5 rounded-full hover:bg-gray-600 transition-colors"
                                            title="Delete Entry"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};