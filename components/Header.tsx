import React, { useState, useRef, useEffect } from 'react';
import { ChartBarIcon, GiftIcon, UserGroupIcon, Cog6ToothIcon, ChevronDownIcon, ArrowRightOnRectangleIcon } from './icons';
import { type Account } from '../types';

interface HeaderProps {
  accounts: Account[];
  activeAccount: Account | null;
  onSwitchAccount: (accountId: string) => void;
  onManageAccounts: () => void;
  onOpenChangelog: () => void;
  showUpdateBadge: boolean;
  onSignOut: () => void;
}


export const Header: React.FC<HeaderProps> = ({ accounts, activeAccount, onSwitchAccount, onManageAccounts, onOpenChangelog, showUpdateBadge, onSignOut }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAccountSelect = (accountId: string) => {
    onSwitchAccount(accountId);
    setIsDropdownOpen(false);
  }

  return (
    <header className="bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ChartBarIcon className="h-8 w-8 text-green-accent" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            US Stock Portfolio Tracker
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
           <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(prev => !prev)}
                className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md transition-colors"
              >
                 <UserGroupIcon className="h-5 w-5 text-gray-300" />
                 <span className="font-medium text-white">{activeAccount?.name || 'No Account'}</span>
                 <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                 <div className="absolute right-0 mt-2 w-56 bg-gray-700 rounded-md shadow-lg z-20 border border-gray-600">
                    <div className="py-1">
                        {accounts.map(account => (
                           <a
                              key={account.id}
                              href="#"
                              onClick={(e) => { e.preventDefault(); handleAccountSelect(account.id); }}
                              className={`block px-4 py-2 text-sm ${activeAccount?.id === account.id ? 'bg-green-accent/20 text-green-accent' : 'text-gray-200 hover:bg-gray-600'}`}
                           >
                              {account.name}
                           </a>
                        ))}
                         <div className="border-t border-gray-600 my-1" />
                         <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); onManageAccounts(); setIsDropdownOpen(false); }}
                            className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                          >
                           <Cog6ToothIcon className="h-5 w-5 mr-2" />
                           Manage Accounts
                         </a>
                         <div className="border-t border-gray-600 my-1" />
                         <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); onSignOut(); setIsDropdownOpen(false); }}
                            className="flex items-center px-4 py-2 text-sm text-red-accent/80 hover:bg-red-accent/20 hover:text-red-accent"
                          >
                           <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                           Sign Out
                         </a>
                    </div>
                 </div>
              )}
           </div>

           <button 
             onClick={onOpenChangelog} 
             className="relative text-gray-400 hover:text-white transition-colors"
             aria-label="View recent updates"
           >
             <GiftIcon className="h-6 w-6" />
             {showUpdateBadge && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-accent ring-2 ring-gray-800" />
             )}
           </button>
        </div>
      </div>
    </header>
  );
};