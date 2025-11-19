import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Dashboard } from './pages/Dashboard';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

const App: React.FC = () => {
    const { session, loading } = useAuth();
    const [showLoginPage, setShowLoginPage] = useState(true);

    if (loading) {
         return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading session...</div>;
    }

    if (!session) {
        return showLoginPage 
            ? <LoginPage onShowSignup={() => setShowLoginPage(false)} /> 
            : <SignupPage onShowLogin={() => setShowLoginPage(true)} />;
    }

    return <Dashboard />;
};

export default App;