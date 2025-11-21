import React, { useState, useRef, useEffect } from 'react';
import { ChatBubbleOvalLeftEllipsisIcon, PaperAirplaneIcon, XMarkIcon } from './icons';
import { type ChatMessage, type Position } from '../types';
import { getChatResponse } from '../services/geminiApi';

interface SummaryData {
    totalMarketValue: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
    tradingCash: number;
    originalInvestment: number;
}
  
interface ChatBotProps {
    positions: Position[];
    summaryData: SummaryData;
}

export const ChatBot: React.FC<ChatBotProps> = ({ positions, summaryData }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                { role: 'assistant', content: "Hello! I'm your portfolio assistant. Ask me anything about your current holdings, like 'What's my best performing stock?' or 'Summarize my portfolio'." }
            ]);
        }
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userInput }];
        setMessages(newMessages);
        const question = userInput;
        setUserInput('');
        setIsLoading(true);

        try {
            const response = await getChatResponse(question, positions, summaryData);
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="fixed bottom-6 right-6 z-40">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-green-accent text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-900"
                    aria-label={isOpen ? "Close chat" : "Open chat"}
                >
                    {isOpen ? <XMarkIcon className="h-7 w-7" /> : <ChatBubbleOvalLeftEllipsisIcon className="h-7 w-7" />}
                </button>
            </div>
            
            {isOpen && (
                <div 
                    className="fixed bottom-24 right-6 w-[calc(100%-3rem)] max-w-md h-[70vh] max-h-[600px] bg-gray-800 rounded-xl shadow-2xl flex flex-col z-50 border border-gray-700 overflow-hidden"
                    aria-modal="true"
                    role="dialog"
                >
                    <header className="bg-gray-700 p-4 flex items-center justify-between flex-shrink-0">
                        <h2 className="text-lg font-bold text-white">Portfolio Assistant</h2>
                    </header>

                    <div className="flex-grow p-4 overflow-y-auto space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                        msg.role === 'user'
                                            ? 'bg-green-accent/80 text-white'
                                            : 'bg-gray-700 text-gray-200'
                                    }`}
                                >
                                    <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-[80%] rounded-lg px-4 py-2 bg-gray-700 text-gray-200">
                                     <div className="flex items-center space-x-2">
                                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                         <div ref={messagesEndRef} />
                    </div>

                    <footer className="p-4 border-t border-gray-700 bg-gray-800">
                        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder="Ask about your portfolio..."
                                className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-green-accent focus:border-green-accent"
                                disabled={isLoading}
                                aria-label="Chat input"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !userInput.trim()}
                                className="bg-green-accent text-white p-2 rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Send message"
                            >
                                <PaperAirplaneIcon className="h-5 w-5" />
                            </button>
                        </form>
                    </footer>
                </div>
            )}
        </>
    );
};