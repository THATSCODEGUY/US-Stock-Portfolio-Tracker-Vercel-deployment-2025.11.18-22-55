export type TransactionType = 'BUY' | 'SELL' | 'DEPOSIT' | 'WITHDRAWAL';

export interface Transaction {
  id: string;
  account_id: string;
  user_id: string;
  ticker: string;
  companyName: string; // Mapped from company_name
  type: TransactionType;
  shares: number;
  price: number;
  date: string; // Mapped from transaction_date
  notes?: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  cash: number;
}

export interface PortfolioData {
  accounts: Account[];
  transactions: { [accountId: string]: Transaction[] };
  activeAccountId: string | null;
}

export interface Quote {
  ticker: string;
  companyName: string;
  price: number;
  volume: number;
  dayHigh: number;
  dayLow: number;
  previousClose: number;
}

export interface Position {
  ticker: string;
  companyName: string;
  shares: number;
  averageCost: number;
  currentPrice: number;
  // Optional fields from market data API
  volume?: number;
  dayHigh?: number;
  dayLow?: number;
  previousClose?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface HistoricalDataPoint {
  date: string;
  value: number;
}