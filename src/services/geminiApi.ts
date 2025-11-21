import { GoogleGenAI } from "@google/genai";
import { type Position } from '../types';

interface SummaryData {
  totalMarketValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  tradingCash: number;
  originalInvestment: number;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `You are a helpful and friendly US stock portfolio assistant.
Analyze the provided JSON data which contains the user's current portfolio positions, trading cash, original investment, and a summary.
The user will ask questions about their portfolio. Provide concise and accurate answers based *only* on the data provided.
Format numerical values as currency where appropriate (e.g., $1,234.56).
Do not provide financial advice or make any predictions.
Current portfolio data is as follows:
`;

export const getChatResponse = async (
    question: string, 
    positions: Position[], 
    summary: SummaryData
): Promise<string> => {
    try {
        const portfolioContext = JSON.stringify({ summary, positions }, null, 2);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `${question}`,
            config: {
                systemInstruction: `${systemInstruction}\n${portfolioContext}`,
            },
        });

        return response.text;
    } catch (error) {
        console.error("Error fetching chat response from Gemini API:", error);
        return "Sorry, I'm having trouble connecting to my brain right now. Please try again in a moment.";
    }
};