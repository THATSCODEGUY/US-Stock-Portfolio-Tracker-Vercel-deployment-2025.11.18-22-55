import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';

import { Header } from '../components/Header';
import { PortfolioSummary } from '../components/PortfolioSummary';
import { PortfolioTable } from '../components/PortfolioTable';
import { AddPositionForm } from '../components/AddPositionForm';
import { TransactionHistoryTable } from '../components/TransactionHistoryTable';
import { PortfolioPieChart } from '../components/PortfolioPieChart';
import { EditTransactionModal } from '../components/EditTransactionModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { ManageAccountsModal } from '../components/ManageAccountsModal';
import { ChatBot } from '../components/ChatBot';
import { PortfolioPerformanceChart } from '../components/PortfolioPerformanceChart';
import { ChangelogModal } from '../components/ChangelogModal';
import { ApiErrorBanner } from '../components/ApiErrorBanner';

import { fetchQuote, fetchHistoricalData } from '../services/marketApi';
import { exportTransactions, exportAllData, parseImportedFile } from '../utils/dataHandlers';
import { LATEST_CHANGELOG_VERSION } from '../constants';

import { type PortfolioData, type Transaction, type Account, type Position, type HistoricalDataPoint } from '../types';

export const Dashboard: React.FC = () => {
    const { user, signOut } = useAuth();
    const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
    const [positions, setPositions] = useState<Position[]>([]);
    const [historicalPortfolioValue, setHistoricalPortfolioValue] = useState<HistoricalDataPoint[]>([]);
    const [historicalDays, setHistoricalDays] = useState<number>(30);
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isMarketDataLoading, setIsMarketDataLoading] = useState(true);
    const [isApiError, setIsApiError] = useState(false);
    
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
    const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
    const [isManageAccountsOpen, setIsManageAccountsOpen] = useState(false);
    const [isChangelogOpen, setIsChangelogOpen] = useState(false);
    const [importConfirmation, setImportConfirmation] = useState<{ message: string; data: any } | null>(null);

    const [seenChangelogVersion, setSeenChangelogVersion] = useState(() => {
       return parseInt(localStorage.getItem('seenChangelogVersion') || '0', 10);
    });

    const loadOfflineData = useCallback(() => {
        try {
            const cachedData = localStorage.getItem('portfolioManagerData');
            if (cachedData) {
                const parsedData: PortfolioData = JSON.parse(cachedData);
                 // FIX: Validate the structure of the cached data before using it.
                 // This prevents crashes if the cache is from an older, incompatible version.
                if (parsedData && Array.isArray(parsedData.accounts) && typeof parsedData.transactions === 'object' && parsedData.activeAccountId) {
                    setPortfolioData(parsedData);
                } else {
                    // Cached data is invalid or old, discard it.
                    throw new Error("Invalid or outdated cache structure.");
                }
            }
        } catch (error) {
            console.error("Failed to load or parse offline data, starting fresh:", error);
            // Fallback to null to trigger loading state or default account creation
            setPortfolioData(null); 
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    // Extracted fetch logic so it can be called after import
    const fetchPortfolioData = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);

        // Fetch accounts for the current user
        const { data: accountsData, error: accountsError } = await supabase
            .from('accounts')
            .select('*')
            .eq('user_id', user.id);
        
        if (accountsError) {
            console.error('Error fetching accounts:', accountsError);
            setIsLoading(false);
            return;
        }

        let finalAccounts: Account[] = accountsData || [];
        
        // If it's a new user with no accounts, create a default one
        if (finalAccounts.length === 0) {
            const { data: newAccountData, error: newAccountError } = await supabase
                .from('accounts')
                .insert({ user_id: user.id, name: 'My First Account', cash: 10000 })
                .select()
                .single();

            if (newAccountError || !newAccountData) {
                console.error('Error creating default account:', newAccountError);
                setIsLoading(false);
                return;
            }
            finalAccounts = [newAccountData];
        }

        // Fetch all transactions for the current user
        const { data: transactionsData, error: transactionsError } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id);
        
        if (transactionsError) {
            console.error('Error fetching transactions:', transactionsError);
            setIsLoading(false);
            return;
        }

        // Group transactions by their account ID for the local state structure
        const transactionsByAccount: { [accountId: string]: Transaction[] } = {};
        finalAccounts.forEach(acc => {
            transactionsByAccount[acc.id] = [];
        });
        transactionsData?.forEach(tx => {
            // Ensure tx.account_id exists before trying to push
            if (tx.account_id && transactionsByAccount.hasOwnProperty(tx.account_id)) {
                transactionsByAccount[tx.account_id].push({
                    ...tx,
                    date: tx.transaction_date,
                    companyName: tx.company_name || '',
                });
            }
        });

        // Restore the last active account for this user or default to the first one
        const lastActiveId = localStorage.getItem(`activeAccountId_${user.id}`);
        const activeId = finalAccounts.some(a => a.id === lastActiveId) ? lastActiveId : finalAccounts[0].id;

        setPortfolioData({
            accounts: finalAccounts,
            transactions: transactionsByAccount,
            activeAccountId: activeId,
        });
        setIsLoading(false);
    }, [user]);

    // Load data from Supabase or cache
    useEffect(() => {
        if (user) {
            fetchPortfolioData();
        }
    }, [user, fetchPortfolioData]);

    // Save data to localStorage as a cache whenever it changes
    useEffect(() => {
        if (portfolioData) {
            localStorage.setItem('portfolioManagerData', JSON.stringify(portfolioData));
            if (user && portfolioData.activeAccountId) {
                localStorage.setItem(`activeAccountId_${user.id}`, portfolioData.activeAccountId);
            }
        }
    }, [portfolioData, user]);

    const activeAccount = useMemo(() => {
        if (!portfolioData) return null;
        return portfolioData.accounts.find(a => a.id === portfolioData.activeAccountId) || null;
    }, [portfolioData]);

    const activeTransactions = useMemo(() => {
        if (!activeAccount || !portfolioData) return [];
        return portfolioData.transactions[activeAccount.id] || [];
    }, [activeAccount, portfolioData]);


    const calculatePositions = (transactions: Transaction[]): { [key: string]: { shares: number, cost: number, companyName: string } } => {
        const pos: { [key: string]: { shares: number, cost: number, companyName: string } } = {};
        transactions.forEach(tx => {
            if (!pos[tx.ticker]) {
                pos[tx.ticker] = { shares: 0, cost: 0, companyName: tx.companyName };
            }
            if (tx.type === 'BUY') {
                pos[tx.ticker].shares += tx.shares;
                pos[tx.ticker].cost += tx.shares * tx.price;
            } else {
                const costBasisPerShare = pos[tx.ticker].shares > 0 ? pos[tx.ticker].cost / pos[tx.ticker].shares : 0;
                pos[tx.ticker].cost -= tx.shares * costBasisPerShare;
                pos[tx.ticker].shares -= tx.shares;
            }
            pos[tx.ticker].companyName = tx.companyName;
        });
        return pos;
    };

    useEffect(() => {
        const posMap = calculatePositions(activeTransactions);
        const uniqueTickers = Object.keys(posMap).filter(ticker => posMap[ticker].shares > 0.00001);

        if (uniqueTickers.length === 0) {
            setPositions([]);
            setIsMarketDataLoading(false);
            return;
        }

        setIsMarketDataLoading(true);
        const fetchMarketData = async () => {
            const quotePromises = uniqueTickers.map(ticker => fetchQuote(ticker));
            const quotes = await Promise.all(quotePromises);

            let hasMockData = false;
            
            const newPositions: Position[] = quotes.map(quote => {
                if (quote.isMock) hasMockData = true;

                const pos = posMap[quote.ticker];
                return {
                    ticker: quote.ticker,
                    companyName: pos.companyName,
                    shares: pos.shares,
                    averageCost: pos.shares > 0 ? pos.cost / pos.shares : 0,
                    currentPrice: quote.price,
                };
            });
            setPositions(newPositions);
            setIsApiError(hasMockData);
            setIsMarketDataLoading(false);
        };
        fetchMarketData();
    }, [activeTransactions]);

    const handleTimeRangeChange = useCallback((days: number) => {
        setHistoricalDays(days);
    }, []);

    useEffect(() => {
        const calculateHistory = async () => {
            setIsHistoryLoading(true);
            const posMap = calculatePositions(activeTransactions);
            const uniqueTickers = Object.keys(posMap).filter(ticker => posMap[ticker].shares > 0);
            if (uniqueTickers.length === 0) {
                setHistoricalPortfolioValue([]);
                setIsHistoryLoading(false);
                return;
            }

            const historyPromises = uniqueTickers.map(ticker => fetchHistoricalData(ticker, historicalDays));
            const histories = await Promise.all(historyPromises);

            const portfolioHistory: { [date: string]: number } = {};

            histories.forEach((history, index) => {
                const ticker = uniqueTickers[index];
                const shares = posMap[ticker].shares;
                history.data.forEach(day => {
                    if (!portfolioHistory[day.date]) {
                        portfolioHistory[day.date] = 0;
                    }
                    portfolioHistory[day.date] += day.price * shares;
                });
            });

            const sortedHistory: HistoricalDataPoint[] = Object.entries(portfolioHistory)
                .map(([date, value]) => ({ date, value }))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            setHistoricalPortfolioValue(sortedHistory);
            setIsHistoryLoading(false);
        };
        if (!isMarketDataLoading) {
            calculateHistory();
        }
    }, [activeTransactions, isMarketDataLoading, historicalDays]);


    const summaryData = useMemo(() => {
        const totalMarketValue = positions.reduce((acc, pos) => acc + pos.shares * pos.currentPrice, 0);
        const totalCostBasis = positions.reduce((acc, pos) => acc + pos.shares * pos.averageCost, 0);
        const totalGainLoss = totalMarketValue - totalCostBasis;
        const totalGainLossPercent = totalCostBasis === 0 ? 0 : (totalGainLoss / totalCostBasis) * 100;

        return {
            totalMarketValue,
            totalGainLoss,
            totalGainLossPercent,
            tradingCash: activeAccount?.cash ?? 0
        };
    }, [positions, activeAccount]);


    const handleAddTransaction = async (newTransaction: Omit<Transaction, 'id' | 'user_id' | 'account_id'>) => {
        if (!activeAccount || !portfolioData || !user) return;
        
        const newCash = activeAccount.cash + (newTransaction.type === 'SELL' ? (newTransaction.shares * newTransaction.price) : -(newTransaction.shares * newTransaction.price));

        const { error: accountUpdateError } = await supabase
            .from('accounts')
            .update({ cash: newCash })
            .eq('id', activeAccount.id);

        if (accountUpdateError) return console.error("Failed to update cash:", accountUpdateError.message);

        const { data: insertedTx, error: txInsertError } = await supabase
            .from('transactions')
            .insert({
                user_id: user.id,
                account_id: activeAccount.id,
                ticker: newTransaction.ticker,
                company_name: newTransaction.companyName,
                type: newTransaction.type,
                shares: newTransaction.shares,
                price: newTransaction.price,
                transaction_date: newTransaction.date,
                notes: newTransaction.notes,
            })
            .select()
            .single();

        if (txInsertError || !insertedTx) return console.error("Failed to add transaction:", txInsertError?.message);

        const addedTx: Transaction = { ...insertedTx, date: insertedTx.transaction_date, companyName: insertedTx.company_name || '' };
        const updatedAccount = { ...activeAccount, cash: newCash };
        
        setPortfolioData(prev => ({
            ...prev!,
            accounts: prev!.accounts.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc),
            transactions: {
                ...prev!.transactions,
                [activeAccount.id]: [...(prev!.transactions[activeAccount.id] || []), addedTx]
            }
        }));
    };

    const handleUpdateTransaction = async (updatedTx: Transaction) => {
         if (!activeAccount || !portfolioData) return;

        const { error } = await supabase
            .from('transactions')
            .update({
                shares: updatedTx.shares,
                price: updatedTx.price,
                transaction_date: updatedTx.date,
                notes: updatedTx.notes
            })
            .eq('id', updatedTx.id);
        
        if (error) return console.error("Failed to update transaction:", error.message);
        
        const updatedTransactions = activeTransactions.map(tx => tx.id === updatedTx.id ? updatedTx : tx);
        
        setPortfolioData(prev => ({
            ...prev!,
            transactions: { ...prev!.transactions, [activeAccount.id]: updatedTransactions }
        }));
        setEditingTransaction(null);
    };

    const handleDeleteTransaction = async () => {
        if (!deletingTransaction || !activeAccount || !portfolioData) return;
        
        const newCash = activeAccount.cash + (deletingTransaction.type === 'BUY' ? (deletingTransaction.shares * deletingTransaction.price) : -(deletingTransaction.shares * deletingTransaction.price));

        const { error: accountUpdateError } = await supabase
            .from('accounts')
            .update({ cash: newCash })
            .eq('id', activeAccount.id);

        if (accountUpdateError) return console.error("Failed to update cash on delete:", accountUpdateError.message);
        
        const { error: deleteError } = await supabase.from('transactions').delete().eq('id', deletingTransaction.id);
        
        if (deleteError) return console.error("Failed to delete transaction:", deleteError.message);

        const updatedAccount = { ...activeAccount, cash: newCash };
        const updatedTransactions = activeTransactions.filter(tx => tx.id !== deletingTransaction.id);

        setPortfolioData(prev => ({
            ...prev!,
            accounts: prev!.accounts.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc),
            transactions: { ...prev!.transactions, [activeAccount.id]: updatedTransactions }
        }));
        setDeletingTransaction(null);
    };
    
    const handleUpdateCash = async (newCash: number) => {
        if (!activeAccount || !portfolioData) return;
        const { error } = await supabase.from('accounts').update({ cash: newCash }).eq('id', activeAccount.id);

        if (error) return console.error("Failed to update cash:", error.message);
        
        const updatedAccount = { ...activeAccount, cash: newCash };
        setPortfolioData(prev => ({ 
            ...prev!, 
            accounts: prev!.accounts.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc)
        }));
    };

    const handleSwitchAccount = (accountId: string) => {
        setPortfolioData(prev => ({ ...prev!, activeAccountId: accountId }));
    };

    const handleAddAccount = async (name: string) => {
        if (!user) return;
        const { data, error } = await supabase
            .from('accounts')
            .insert({ user_id: user.id, name, cash: 0 })
            .select()
            .single();
        
        if (error || !data) return console.error("Failed to add account:", error?.message);

        const newAccount: Account = data;
        setPortfolioData(prev => ({
            accounts: [...prev!.accounts, newAccount],
            transactions: { ...prev!.transactions, [newAccount.id]: [] },
            activeAccountId: newAccount.id
        }));
    };
    
    const handleUpdateAccount = async (id: string, name: string) => {
        const { error } = await supabase.from('accounts').update({ name }).eq('id', id);

        if (error) return console.error("Failed to update account:", error.message);
        
        setPortfolioData(prev => ({ 
            ...prev!, 
            accounts: prev!.accounts.map(acc => acc.id === id ? { ...acc, name } : acc)
        }));
    };

    const handleDeleteAccount = async () => {
        if (!deletingAccount || !portfolioData || portfolioData.accounts.length <= 1) return;
        
        const { error } = await supabase.from('accounts').delete().eq('id', deletingAccount.id);

        if (error) return console.error("Failed to delete account:", error.message);
        
        const newAccounts = portfolioData.accounts.filter(acc => acc.id !== deletingAccount.id);
        const newTransactions = { ...portfolioData.transactions };
        delete newTransactions[deletingAccount.id];
        const newActiveId = deletingAccount.id === portfolioData.activeAccountId ? newAccounts[0].id : portfolioData.activeAccountId;
        
        setPortfolioData({
            accounts: newAccounts,
            transactions: newTransactions,
            activeAccountId: newActiveId
        });
        setDeletingAccount(null);
    };

    const handleImport = async (file: File) => {
       try {
           const data = await parseImportedFile(file);
           let message = '';
           
           if (Array.isArray(data)) {
               message = `Found ${data.length} transactions. These will be imported into your active account.`;
           } else if ('account' in data) {
               message = `Found account "${data.account.name}" with ${data.transactions.length} transactions.`;
           } else {
                const numAccounts = data.accounts.length;
                const numTransactions = Object.values(data.transactions).flat().length;
               message = `Found full portfolio backup: ${numAccounts} accounts and ${numTransactions} transactions.`;
           }
           
           setImportConfirmation({ message, data });
       } catch (error) {
           if (error instanceof Error) {
               alert(error.message);
           } else {
               alert("Failed to import file.");
           }
       }
    };

    const handleConfirmImport = async () => {
        if (!importConfirmation || !user) return;
        setIsLoading(true);
        setImportConfirmation(null);
        
        try {
            const { data } = importConfirmation;
            
            // Case 1: Full Portfolio Backup
            if (data.accounts && Array.isArray(data.accounts)) {
                 const importedData = data as PortfolioData;
                 for (const acc of importedData.accounts) {
                    // Create Account
                    const { data: newAcc, error: accError } = await supabase
                        .from('accounts')
                        .insert({ user_id: user.id, name: acc.name, cash: acc.cash })
                        .select()
                        .single();
                    
                    if (accError || !newAcc) throw new Error(`Failed to create account ${acc.name}`);
                    
                    // Create Transactions for this account
                    const transactions = importedData.transactions[acc.id] || [];
                    if (transactions.length > 0) {
                         const txsToInsert = transactions.map(tx => ({
                             user_id: user.id,
                             account_id: newAcc.id,
                             ticker: tx.ticker,
                             company_name: tx.companyName,
                             type: tx.type,
                             shares: tx.shares,
                             price: tx.price,
                             transaction_date: tx.date,
                             notes: tx.notes
                         }));
                         
                         const { error: txError } = await supabase.from('transactions').insert(txsToInsert);
                         if (txError) throw new Error(`Failed to import transactions for ${acc.name}`);
                    }
                 }
            } 
            // Case 2: Single Account Backup
            else if ('account' in data) {
                 const importedData = data as { account: { name: string, cash: number }, transactions: Transaction[] };
                 const { data: newAcc, error: accError } = await supabase
                        .from('accounts')
                        .insert({ user_id: user.id, name: importedData.account.name, cash: importedData.account.cash })
                        .select()
                        .single();
                 
                 if (accError || !newAcc) throw new Error(`Failed to create account`);
                 
                 if (importedData.transactions.length > 0) {
                      const txsToInsert = importedData.transactions.map(tx => ({
                             user_id: user.id,
                             account_id: newAcc.id,
                             ticker: tx.ticker,
                             company_name: tx.companyName,
                             type: tx.type,
                             shares: tx.shares,
                             price: tx.price,
                             transaction_date: tx.date,
                             notes: tx.notes
                         }));
                      const { error: txError } = await supabase.from('transactions').insert(txsToInsert);
                      if (txError) throw new Error(`Failed to import transactions`);
                 }

            }
            // Case 3: Simple Transaction List (CSV or JSON array)
            else if (Array.isArray(data) && activeAccount) {
                const transactions = data as Transaction[];
                const txsToInsert = transactions.map(tx => ({
                     user_id: user.id,
                     account_id: activeAccount.id,
                     ticker: tx.ticker,
                     company_name: tx.companyName,
                     type: tx.type,
                     shares: tx.shares,
                     price: tx.price,
                     transaction_date: tx.date,
                     notes: tx.notes
                 }));
                 const { error: txError } = await supabase.from('transactions').insert(txsToInsert);
                 if (txError) throw new Error(`Failed to import transactions`);
            }

            // Refresh data from Supabase to get new IDs and sync local state
            await fetchPortfolioData();

        } catch (error) {
            console.error("Import failed:", error);
            alert("Import failed. Please check console for details.");
            setIsLoading(false); // Stop loading if error, fetchPortfolioData stops it on success
        }
    };
    
    const handleExport = (format: 'json' | 'csv') => {
        exportTransactions(activeTransactions, activeAccount, format);
    };
    
    const handleExportAll = (format: 'json' | 'csv') => {
        if (portfolioData) {
            exportAllData(portfolioData, format);
        }
    };

    const handleOpenChangelog = () => {
        setIsChangelogOpen(true);
        setSeenChangelogVersion(LATEST_CHANGELOG_VERSION);
        localStorage.setItem('seenChangelogVersion', LATEST_CHANGELOG_VERSION.toString());
    };

    if (isLoading || !portfolioData) {
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading your portfolio...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200">
            <Header 
                accounts={portfolioData.accounts}
                activeAccount={activeAccount}
                onSwitchAccount={handleSwitchAccount}
                onManageAccounts={() => setIsManageAccountsOpen(true)}
                onOpenChangelog={handleOpenChangelog}
                showUpdateBadge={seenChangelogVersion < LATEST_CHANGELOG_VERSION}
                onSignOut={signOut}
            />
            {isApiError && <ApiErrorBanner onDismiss={() => setIsApiError(false)} />}
            <main className="container mx-auto p-4 md:p-8 space-y-8">
                <PortfolioSummary data={summaryData} onUpdateCash={handleUpdateCash} />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                       <PortfolioTable positions={positions} isLoading={isMarketDataLoading} />
                       <div className="mt-8">
                            <h2 className="text-2xl font-bold text-white mb-4">Portfolio Analysis</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <PortfolioPerformanceChart 
                                    key={activeAccount?.id} 
                                    data={historicalPortfolioValue} 
                                    onTimeRangeChange={handleTimeRangeChange} 
                                    isLoading={isHistoryLoading} 
                                />
                                <PortfolioPieChart positions={positions} />
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <AddPositionForm onAddTransaction={handleAddTransaction} disabled={!activeAccount} />
                    </div>
                </div>

                <TransactionHistoryTable 
                   transactions={activeTransactions}
                   onEdit={(tx) => setEditingTransaction(tx)}
                   onDelete={(tx) => setDeletingTransaction(tx)}
                   onImport={handleImport}
                   onExport={handleExport}
                   onExportAll={handleExportAll}
               />

            </main>
            
            <ChatBot positions={positions} summaryData={summaryData} />

            {editingTransaction && (
                <EditTransactionModal 
                    isOpen={!!editingTransaction}
                    onClose={() => setEditingTransaction(null)}
                    transaction={editingTransaction}
                    onSave={handleUpdateTransaction}
                />
            )}
            
            {deletingTransaction && (
                <ConfirmationModal
                    isOpen={!!deletingTransaction}
                    onClose={() => setDeletingTransaction(null)}
                    onConfirm={handleDeleteTransaction}
                    title="Delete Transaction"
                    message={`Are you sure you want to delete this transaction for ${deletingTransaction.ticker}? This will adjust your cash balance and cannot be undone.`}
                />
            )}
            
            {deletingAccount && (
                <ConfirmationModal
                    isOpen={!!deletingAccount}
                    onClose={() => setDeletingAccount(null)}
                    onConfirm={handleDeleteAccount}
                    title="Delete Account"
                    message={`Are you sure you want to delete the account "${deletingAccount.name}"? All associated transactions will be lost. This action cannot be undone.`}
                />
            )}
            
            {importConfirmation && (
                 <ConfirmationModal
                    isOpen={!!importConfirmation}
                    onClose={() => setImportConfirmation(null)}
                    onConfirm={handleConfirmImport}
                    title="Confirm Data Import"
                    message={importConfirmation.message}
                />
            )}

            <ManageAccountsModal 
                isOpen={isManageAccountsOpen}
                onClose={() => setIsManageAccountsOpen(false)}
                accounts={portfolioData.accounts}
                onAdd={handleAddAccount}
                onUpdate={handleUpdateAccount}
                onDelete={(acc) => setDeletingAccount(acc)}
            />

            <ChangelogModal isOpen={isChangelogOpen} onClose={() => setIsChangelogOpen(false)} />
        </div>
    );
};