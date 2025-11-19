import React, { useState, useEffect } from 'react';
import { type Account } from '../types';
import { XMarkIcon, PencilIcon, TrashIcon, PlusIcon } from './icons';

interface ManageAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onAdd: (name: string) => void;
  onUpdate: (id: string, name: string) => void;
  onDelete: (account: Account) => void;
}

export const ManageAccountsModal: React.FC<ManageAccountsModalProps> = ({ isOpen, onClose, accounts, onAdd, onUpdate, onDelete }) => {
  const [newAccountName, setNewAccountName] = useState('');
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setNewAccountName('');
      setEditingAccountId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAccountName.trim()) {
      onAdd(newAccountName.trim());
      setNewAccountName('');
    }
  };
  
  const handleStartEditing = (account: Account) => {
      setEditingAccountId(account.id);
      setEditingName(account.name);
  };
  
  const handleCancelEditing = () => {
      setEditingAccountId(null);
      setEditingName('');
  };

  const handleSaveUpdate = (id: string) => {
      if (editingName.trim()) {
          onUpdate(id, editingName.trim());
          handleCancelEditing();
      }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Manage Accounts</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-3">
            {accounts.map(account => (
              <div key={account.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-md">
                {editingAccountId === account.id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => handleSaveUpdate(account.id)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveUpdate(account.id)}
                    className="flex-grow bg-gray-600 border border-gray-500 rounded-md py-1 px-2 text-white focus:outline-none focus:ring-2 focus:ring-green-accent"
                    autoFocus
                  />
                ) : (
                  <span className="text-white flex-grow">{account.name}</span>
                )}
                
                <div className="flex items-center space-x-2 ml-4">
                   {editingAccountId === account.id ? (
                      <>
                        <button onClick={() => handleSaveUpdate(account.id)} className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-gray-600 transition-colors" aria-label="Save">
                           Save
                        </button>
                        <button onClick={handleCancelEditing} className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-gray-600 transition-colors" aria-label="Cancel">
                           Cancel
                        </button>
                      </>
                   ) : (
                      <>
                        <button onClick={() => handleStartEditing(account)} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-600 transition-colors" aria-label="Rename">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button onClick={() => onDelete(account)} className="text-gray-400 hover:text-red-accent p-2 rounded-full hover:bg-gray-600 transition-colors" aria-label="Delete">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </>
                   )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 border-t border-gray-700">
          <form onSubmit={handleAddAccount} className="flex items-center space-x-2">
            <input
              type="text"
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
              placeholder="New account name"
              className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-green-accent focus:border-green-accent"
            />
            <button
              type="submit"
              className="flex items-center py-2 px-4 rounded-md shadow-sm font-medium text-white bg-green-accent hover:bg-green-700 transition-colors disabled:opacity-50"
              disabled={!newAccountName.trim()}
            >
              <PlusIcon className="h-5 w-5 mr-1" /> Add
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
