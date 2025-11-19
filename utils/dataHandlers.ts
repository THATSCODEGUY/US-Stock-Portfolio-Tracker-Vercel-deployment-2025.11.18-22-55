import { type Transaction, type PortfolioData, type Account } from '../types';

const downloadFile = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
};

// --- EXPORT LOGIC ---

export const exportTransactions = (transactions: Transaction[], account: Account | null, format: 'json' | 'csv') => {
    if (!account) return;
    const safeAccountName = account.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `portfolio_backup_${safeAccountName}`;

    if (format === 'json') {
        // New: Export a structured object with both account details (including cash) and transactions.
        const exportData = {
            account: {
                name: account.name,
                cash: account.cash,
            },
            transactions,
        };
        const jsonString = JSON.stringify(exportData, null, 2);
        downloadFile(jsonString, `${fileName}.json`, 'application/json');
    } else if (format === 'csv') {
        // New: Add 'accountCash' column.
        const headers = ['id', 'ticker', 'companyName', 'type', 'shares', 'price', 'date', 'notes', 'accountCash'];
        const csvRows = [
            headers.join(','),
            ...transactions.map(tx => {
                const notes = tx.notes ? `"${tx.notes.replace(/"/g, '""')}"` : '';
                return [tx.id, tx.ticker, `"${tx.companyName}"`, tx.type, tx.shares, tx.price, tx.date, notes, account.cash].join(',');
            })
        ];
        const csvString = csvRows.join('\n');
        downloadFile(csvString, `${fileName}.csv`, 'text/csv;charset=utf-8;');
    }
};

export const exportAllData = (data: PortfolioData, format: 'json' | 'csv') => {
    if (format === 'json') {
        // This is already correct as it saves the full data structure.
        const jsonString = JSON.stringify(data, null, 2);
        downloadFile(jsonString, 'portfolio_full_backup.json', 'application/json');
    } else if (format === 'csv') {
        // New: Add 'accountCash' column.
        const headers = ['accountId', 'accountName', 'accountCash', 'transactionId', 'ticker', 'companyName', 'type', 'shares', 'price', 'date', 'notes'];
        const csvRows = [headers.join(',')];
        
        data.accounts.forEach(account => {
            const accountTransactions = data.transactions[account.id] || [];
            accountTransactions.forEach(tx => {
                const notes = tx.notes ? `"${tx.notes.replace(/"/g, '""')}"` : '';
                csvRows.push([
                    account.id,
                    `"${account.name}"`,
                    account.cash, // Add account cash to each row
                    tx.id,
                    tx.ticker,
                    `"${tx.companyName}"`,
                    tx.type,
                    tx.shares,
                    tx.price,
                    tx.date,
                    notes
                ].join(','));
            });
        });
        
        const csvString = csvRows.join('\n');
        downloadFile(csvString, 'portfolio_full_backup.csv', 'text/csv;charset=utf-8;');
    }
};


// --- IMPORT LOGIC ---

const parseCsv = (csvText: string): Transaction[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const transactions: Transaction[] = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
        
        const txObject: { [key: string]: any } = {};
        headers.forEach((header, index) => {
            let value = values[index] || '';
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1).replace(/""/g, '"');
            }
            txObject[header] = value;
        });
        
        const id = txObject.id || txObject.transactionId; // Handle both single and all export formats

        if (id && txObject.ticker) {
            transactions.push({
                id,
                // FIX: Add missing properties to conform to Transaction type
                account_id: txObject.accountId || '', // accountId from "export all" format, fallback to empty
                user_id: '', // user_id is not available in CSV exports
                ticker: txObject.ticker,
                companyName: txObject.companyName,
                type: txObject.type === 'BUY' || txObject.type === 'SELL' ? txObject.type : 'BUY',
                shares: parseFloat(txObject.shares) || 0,
                price: parseFloat(txObject.price) || 0,
                date: txObject.date,
                notes: txObject.notes || undefined,
            });
        }
    }
    return transactions;
};


// New: Define a type for the single-account backup format
type SingleAccountBackup = {
  account: { name: string; cash: number };
  transactions: Transaction[];
}

export const parseImportedFile = (file: File): Promise<Transaction[] | PortfolioData | SingleAccountBackup> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                if (file.type === 'application/json' || file.name.endsWith('.json')) {
                    const parsed = JSON.parse(content);
                    // Check for full backup format
                    if (parsed.accounts && parsed.transactions && Array.isArray(parsed.accounts)) {
                        resolve(parsed as PortfolioData);
                    // Check for new single-account backup format
                    } else if (parsed.account && parsed.transactions && typeof parsed.account === 'object') {
                        resolve(parsed as SingleAccountBackup);
                    // Check for simple transaction list format
                    } else if (Array.isArray(parsed) && (parsed.length === 0 || (parsed[0].id && parsed[0].ticker))) {
                        resolve(parsed as Transaction[]);
                    } else {
                        reject(new Error('Invalid JSON format. Expected an array of transactions or a full portfolio backup file.'));
                    }
                } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                    // CSV import only restores transactions, not cash balances, due to its flat structure.
                    resolve(parseCsv(content));
                } else {
                    reject(new Error('Unsupported file type. Please upload a .json or .csv file.'));
                }
            } catch (e) {
                reject(new Error('Failed to read or parse the file. Please ensure it is correctly formatted.'));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
};