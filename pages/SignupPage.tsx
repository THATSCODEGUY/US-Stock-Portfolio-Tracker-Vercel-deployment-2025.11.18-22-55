import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ChartBarIcon, AtSymbolIcon, KeyIcon } from '../components/icons';

interface SignupPageProps {
    onShowLogin: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onShowLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setLoading(true);
        const { error } = await signUp(email, password);
        if (error) {
            setError(error.message);
        } else {
            setMessage("Success! Please check your email for a confirmation link.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full mx-auto">
                <div className="flex justify-center items-center mb-6">
                    <ChartBarIcon className="h-10 w-10 text-green-accent" />
                    <h1 className="text-3xl font-bold text-white ml-3">Stock Portfolio Tracker</h1>
                </div>
                <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
                    <h2 className="text-2xl font-bold text-center text-white mb-6">Create Account</h2>
                    {error && <p className="mb-4 text-center text-sm text-red-accent bg-red-500/10 p-3 rounded-md">{error}</p>}
                    {message && <p className="mb-4 text-center text-sm text-green-accent bg-green-500/10 p-3 rounded-md">{message}</p>}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                   <AtSymbolIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-green-accent focus:border-green-accent"
                                    required
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                             <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                   <KeyIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-green-accent focus:border-green-accent"
                                    required
                                    placeholder="6+ characters"
                                    minLength={6}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !!message}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-accent hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Account'}
                        </button>
                    </form>
                     <p className="mt-6 text-center text-sm text-gray-400">
                        Already have an account?{' '}
                        <button onClick={onShowLogin} className="font-medium text-green-accent hover:text-green-500 focus:outline-none focus:underline transition">
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
