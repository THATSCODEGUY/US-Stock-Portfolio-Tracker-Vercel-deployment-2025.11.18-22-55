import React, { useState, useEffect } from 'react';
import { type Transaction } from '../types';
import { XMarkIcon } from './icons';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
  onSave: (updatedTx: Transaction) => void;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ isOpen, onClose, transaction, onSave }) => {
    const [formData, setFormData] = useState(transaction);

    useEffect(() => {
        setFormData(transaction);
    }, [transaction]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isNumeric = type === 'number';
        setFormData(prev => ({ 
            ...prev, 
            [name]: isNumeric && value !== '' ? parseFloat(value) : value 
        }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">Edit Transaction</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="edit-ticker" className="block text-sm font-medium text-gray-300 mb-1">Ticker</label>
                            <input
                                id="edit-ticker"
                                type="text"
                                value={formData.ticker}
                                disabled
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-md py-2 px-3 text-gray-400"
                            />
                        </div>
                        <div>
                            <label htmlFor="edit-date" className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                            <input
                                id="edit-date"
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-green-accent focus:border-green-accent"
                            />
                        </div>
                    </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="edit-shares" className="block text-sm font-medium text-gray-300 mb-1">Shares</label>
                            <input
                                type="number"
                                id="edit-shares"
                                name="shares"
                                value={formData.shares}
                                onChange={handleChange}
                                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-green-accent focus:border-green-accent"
                                min="0"
                                step="any"
                            />
                        </div>
                        <div>
                            <label htmlFor="edit-price" className="block text-sm font-medium text-gray-300 mb-1">Price</label>
                            <input
                                type="number"
                                id="edit-price"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-green-accent focus:border-green-accent"
                                min="0"
                                step="any"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="edit-notes" className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                        <textarea
                            id="edit-notes"
                            name="notes"
                            value={formData.notes || ''}
                            onChange={handleChange}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-green-accent focus:border-green-accent"
                            rows={3}
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-md text-sm font-medium bg-gray-600 hover:bg-gray-500 text-white transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="py-2 px-4 rounded-md text-sm font-medium bg-green-accent hover:bg-green-700 text-white transition-colors">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};