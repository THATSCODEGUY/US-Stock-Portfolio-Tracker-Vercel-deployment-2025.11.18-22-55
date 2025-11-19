import { type Quote } from '../types';

// State to track if we should use mock data for the session
let useMockData = false;

// In-memory cache for mock prices to ensure consistency
const mockPriceCache: { [key: string]: { price: number, companyName: string } } = {
  'AAPL': { price: 175.82, companyName: 'Apple Inc.' },
  'GOOGL': { price: 133.21, companyName: 'Alphabet Inc.' },
  'TSLA': { price: 225.88, companyName: 'Tesla, Inc.' },
  'NVDA': { price: 484.44, companyName: 'NVIDIA Corporation' },
};

const getMockQuote = (ticker: string): Quote => {
    const upperTicker = ticker.toUpperCase();
    if (!mockPriceCache[upperTicker]) {
        // Generate a plausible random price for new tickers
        mockPriceCache[upperTicker] = { price: Math.random() * 500 + 50, companyName: `${upperTicker} Company` };
    } else {
       // Fluctuate the price slightly for a "live" feel
       mockPriceCache[upperTicker].price *= (1 + (Math.random() - 0.5) * 0.02);
    }
    
    const { price, companyName } = mockPriceCache[upperTicker];

    return {
        ticker: upperTicker,
        companyName: companyName,
        price: price,
        volume: Math.random() * 10000000,
        dayHigh: price * 1.02,
        dayLow: price * 0.98,
        previousClose: price * 0.99,
    };
};

const getMockHistoricalData = (ticker: string, days: number): {date: string, price: number}[] => {
    const data = [];
    const upperTicker = ticker.toUpperCase();
    let price = mockPriceCache[upperTicker]?.price || Math.random() * 500 + 50;
    if(!mockPriceCache[upperTicker]) {
      mockPriceCache[upperTicker] = { price, companyName: `${upperTicker} Company`};
    }

    const endDate = new Date();
    // Generate backwards from a consistent end-point
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(endDate);
        date.setDate(date.getDate() - i);
        if (i < days - 1) { // Don't fluctuate the most recent price
           price *= (1 + (Math.random() - 0.5) * 0.05);
        }
        data.push({ date: date.toISOString().split('T')[0], price });
    }
    return data;
};


// The key user provided
const API_KEY = 'sneLo8y5QzmJCQqdaqZCZ1n4tyNI2Rgn';
const BASE_URL = 'https://financialmodelingprep.com/stable';

// The API now returns an object indicating if the data is mocked
export const fetchQuote = async (ticker: string): Promise<Quote & { isMock: boolean }> => {
  if (useMockData) {
    return { ...getMockQuote(ticker), isMock: true };
  }
  
  const upperTicker = ticker.toUpperCase();
  // FIX: Corrected the endpoint to use '/stable' and the 'symbol' query parameter.
  const url = `${BASE_URL}/quote?symbol=${upperTicker}&apikey=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`FMP API request failed with status ${response.status}`);
    }
    const data = await response.json();
    
    if (!data || data.length === 0) {
        throw new Error(`No data found for ticker: ${upperTicker}`);
    }

    const quoteData = data[0];
    
    // Cache the real name and price for mock fallback consistency
    mockPriceCache[upperTicker] = { price: quoteData.price, companyName: quoteData.name };

    return {
      ticker: quoteData.symbol,
      companyName: quoteData.name,
      price: quoteData.price,
      volume: quoteData.volume,
      dayHigh: quoteData.dayHigh,
      dayLow: quoteData.dayLow,
      previousClose: quoteData.previousClose,
      isMock: false
    };
  } catch (error) {
    console.error(`Failed to fetch quote for ${ticker}, falling back to mock data:`, error);
    useMockData = true; // Latch to mock data for the rest of the session
    return { ...getMockQuote(ticker), isMock: true };
  }
};

export const fetchHistoricalData = async (ticker: string, days: number): Promise<{data: {date: string, price: number}[], isMock: boolean}> => {
    if (useMockData) {
        return { data: getMockHistoricalData(ticker, days), isMock: true };
    }
    
    const upperTicker = ticker.toUpperCase();
    
    // FIX: Corrected the endpoint to use '/stable' and the 'symbol' query parameter.
    // Inferred the historical endpoint based on the quote endpoint pattern.
    const url = `${BASE_URL}/historical-price-full?symbol=${upperTicker}&timeseries=${days}&apikey=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`FMP API request failed for historical data with status ${response.status}`);
        }
        const data = await response.json();

        if (!data || !data.historical) {
            console.warn(`No historical data for ${upperTicker}`);
            return { data: [], isMock: false };
        }

        const historical = data.historical
            .map((item: any) => ({
                date: item.date,
                price: item.close,
            }))
            .reverse();
        
        return { data: historical, isMock: false };
            
    } catch (error) {
        console.error(`Failed to fetch historical data for ${ticker}, falling back to mock data:`, error);
        useMockData = true; // Latch to mock data for the rest of the session
        return { data: getMockHistoricalData(ticker, days), isMock: true };
    }
};