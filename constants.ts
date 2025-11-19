import { type Transaction } from './types';

export const LATEST_CHANGELOG_VERSION = 3;

export const changelog = [
  {
    version: 3,
    date: '2024-07-28',
    title: 'Track Updates with "What\'s New"',
    description: 'Added a changelog modal, accessible from the header, to keep you informed about the latest features and improvements.'
  },
  {
    version: 2,
    date: '2024-07-27',
    title: 'Visualize Performance Over Time',
    description: 'Introduced a 30-day portfolio performance line chart to help you track the historical value of your holdings.'
  },
  {
    version: 1,
    date: '2024-07-26',
    title: 'Portfolio Assistant Chatbot',
    description: 'Added a new AI-powered chatbot to answer questions about your portfolio in plain English. Find it in the bottom-right corner!'
  }
];

export const sampleTransactions: Transaction[] = [
  {
    id: '1',
    // FIX: Add missing properties to conform to Transaction type
    account_id: 'sample_account_id',
    user_id: 'sample_user_id',
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    type: 'BUY',
    shares: 10,
    price: 150.75,
    date: '2023-05-10',
    notes: 'Initial purchase',
  },
  {
    id: '2',
    // FIX: Add missing properties to conform to Transaction type
    account_id: 'sample_account_id',
    user_id: 'sample_user_id',
    ticker: 'GOOGL',
    companyName: 'Alphabet Inc.',
    type: 'BUY',
    shares: 5,
    price: 120.20,
    date: '2023-07-22',
    notes: 'Buy the dip',
  },
  {
    id: '3',
    // FIX: Add missing properties to conform to Transaction type
    account_id: 'sample_account_id',
    user_id: 'sample_user_id',
    ticker: 'TSLA',
    companyName: 'Tesla, Inc.',
    type: 'BUY',
    shares: 15,
    price: 250.00,
    date: '2023-01-15',
    notes: 'Long term hold',
  },
  {
    id: '4',
    // FIX: Add missing properties to conform to Transaction type
    account_id: 'sample_account_id',
    user_id: 'sample_user_id',
    ticker: 'NVDA',
    companyName: 'NVIDIA Corporation',
    type: 'BUY',
    shares: 15,
    price: 450.50,
    date: '2023-09-01',
    notes: 'AI boom',
  },
  {
    id: '5',
    // FIX: Add missing properties to conform to Transaction type
    account_id: 'sample_account_id',
    user_id: 'sample_user_id',
    ticker: 'TSLA',
    companyName: 'Tesla, Inc.',
    type: 'SELL',
    shares: 7,
    price: 280.00,
    date: '2023-10-05',
    notes: 'Take some profit',
  },
];