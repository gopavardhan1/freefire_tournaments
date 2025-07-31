
import React, { useState, useEffect } from 'react';
import AuthTabs from './AuthTabs';

const PhoenixCrestLogo = () => (
    <svg viewBox="0 0 100 100" className="h-16 w-16 mx-auto animate-pulse-glow">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee"/>
            <stop offset="100%" stopColor="#0ea5e9"/>
          </linearGradient>
        </defs>
        <path 
          d="M50,5 L95,20 V65 C95,80 65,95 50,95 C35,95 5,80 5,65 V20 Z" 
          fill="url(#logoGradient)" 
          fillOpacity="0.15" 
          stroke="url(#logoGradient)" 
          strokeWidth="2.5"
        />
        <path 
          d="M30,30 L50,50 L70,30 L50,75 Z" 
          fill="url(#logoGradient)"
        />
    </svg>
);


const CharacterLeft = () => (
    <div className="absolute bottom-0 left-0 w-1/3 max-w-xs md:max-w-sm lg:max-w-md pointer-events-none z-0 animate-breathing opacity-70">
        <svg viewBox="0 0 258 522" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M114.28 16.557C105.47 28.11 91.565 52.89 83.07 63.633L50.487 90.95c-6.155 5.04-14.88 15.116-14.88 15.116s-6.39 6.208-8.23 9.473c-3.172 5.6-3.79 12.87-3.79 12.87s-1.898 12.422.378 18.272c2.276 5.85 6.06 9.722 6.06 9.722s7.697 7.02 11.233 8.72c3.536 1.7 13.926 5.6 13.926 5.6l10.84 3.736h.002l7.152 2.213 13.568 5.768L121.3 268.4l-.234 165.918c0 4.398-.937 8.618-2.73 12.398-3.327 7.01-8.91 12.19-15.65 15.34-6.74 3.15-14.225 3.99-21.734 2.4-7.51-1.59-14.36-5.69-19.49-11.6-5.13-5.91-8.24-13.3-8.86-21.37-.62-8.07.97-16.32 4.45-23.51 3.48-7.19 8.7-13.06 14.88-17.02l44.38-29.08 1.13-17.65-38.62-11.58-15.82 23.36-1.51 1.5-17.74 26.1-2.02 2.97-2.61 3.84-2.9 4.28-2.34 3.44-1.92 2.82c-.8.8-1.5 1.5-2.2 2-3.1 2.4-6.4 3.9-9.8 4.6-3.4.7-6.8 1-10.1 1-6.1 0-11.9-1.3-17-3.8-5.1-2.5-9.3-6.1-12.2-10.5-2.9-4.4-4.4-9.4-4.4-14.8 0-4.1.8-8 2.5-11.5s3.9-6.6 6.6-9.1c2.8-2.5 5.9-4.5 9.4-5.9 3.5-1.4 7.2-2.1 11-2.1h13.9v-5.9l-13.52-5.904C35.9 146 0 167.92 0 167.92V522h258V0L114.28 16.557z" fill="black" fillOpacity="0.8"/>
        </svg>
    </div>
);

const CharacterRight = () => (
    <div className="absolute bottom-0 right-0 w-1/3 max-w-xs md:max-w-sm lg:max-w-md pointer-events-none z-0 animate-breathing opacity-70">
        <svg viewBox="0 0 258 483" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M109.914 10.37L100.8 21.054c-11.83 13.9-22.98 33.54-22.98 33.54l-5.46 8.7-3.9 6.273-10.52 14.346-13.15 15.33-11.75 12.1c-1.8 1.4-3.5 2.5-5.1 3.3-3.1 1.6-6 2.4-8.7 2.4-3.5 0-6.8-.9-9.8-2.8-3-1.9-5.3-4.4-6.9-7.5-1.6-3.1-2.4-6.5-2.4-10.1 0-4.5 1.1-8.7 3.3-12.5 2.2-3.8 5.1-7 8.7-9.4 3.6-2.4 7.7-3.9 12.2-4.6l7.3-1V56.53l-7.3-1.6c-4.9-.7-9.4-2.1-13.2-4.3-3.8-2.2-6.9-5-9.1-8.3-2.2-3.3-3.3-6.9-3.3-10.8 0-3.3.6-6.4 1.8-9.1 1.2-2.7 2.8-5.1 4.8-7.1 2-2 4.3-3.6 6.9-4.8 2.6-1.2 5.3-1.8 8.1-1.8h11l-2.6-11.4L0 0v483h258V21.054l-148.086-10.684zM137.8 143.73l-12.4 13.2-30.8 30.1-15.6 15.2-11.2 11.2-10.8 10.4-8.8 8.8-1.2 1.2-16.4 24.8-10.4 17.2-8.8 13.2-1.6 2.4-12.4 31.5-8.4 20.3-6.4 16.4-1.2 2.8c-1.6 3.9-2.4 8-2.4 12.2 0 4.1.8 7.9 2.5 11.2 1.7 3.3 3.9 6.2 6.6 8.5 2.8 2.3 5.9 4.1 9.4 5.1 3.5 1 7.2 1.6 11 1.6 4.9 0 9.6-1 13.9-2.9 4.3-1.9 8-4.7 10.8-8.3 2.8-3.6 4.5-7.8 5.1-12.5l3.3-24.3 11.2-4.1 17.6-6.2 36-12.4 16.8-5.8 1.2-.4 10.8-23.5 8.4-18.4 6-13.6 1.6-3.7 2.4-18.3 1.2-13.9c-.3-2.7-.4-5.4-.4-8.1 0-5.3 1-10.4 2.9-15.2 1.9-4.8 4.6-9.1 7.9-12.9 3.3-3.8 7.1-6.9 11.2-9.1 4.1-2.2 8.5-3.3 13.2-3.3h.8c4.3 0 8.4.9 12.1 2.8 3.8 1.9 6.9 4.4 9.4 7.5 2.5 3.1 4.1 6.6 4.8 10.4.7 3.8 1.1 7.7 1.1 11.5 0 3.7-.3 7.3-.8 10.8l-3.3 21.5-1.2 8.3-2.5 16.8-5.6 18-9.1 16.8-11.2 13.6-12.4 7.9-13.2 4.1-13.6 1.2h-11.5l1.6-17.6 5.6-16 8.8-13.6 10.4-10.8 11.2-7.1 15.6-3.3 31.9-2.8 13.2-.8h1.2l-10.8-30.7-8.8-25.1-6.4-18.4-3.7-10.4-1.2-3.3-.8-9.9.4-11.5.8-8.8 1.2-6.2c.4-2.1.6-4.3.6-6.4 0-4.1-.8-8.1-2.5-11.9-1.7-3.8-3.9-7.1-6.6-9.8s-5.9-4.8-9.4-6.4c-3.5-1.6-7.2-2.4-11-2.4-4.5 0-8.7.9-12.5 2.8s-7.1 4.4-9.8 7.5c-2.8 3.1-4.8 6.6-6.2 10.4-1.4 3.8-2.1 7.7-2.1 11.5z" fill="black" fill-opacity="0.8"/>
        </svg>
    </div>
);

const AppFooter = () => (
    <footer className="app-footer">
        <p className="footer-line text-sm font-semibold">v1.0.0</p>
        <p className="footer-line text-xs mt-1">⚡ Powered by Vardhan Technologies</p>
    </footer>
);


const LoginPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowForm(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden">
        <div className="battlefield-bg"></div>
        <div className="fog-overlay"></div>
      
      <CharacterLeft />
      <CharacterRight />

      {toast && (
        <div className={`fixed top-5 right-5 z-50 p-4 rounded-lg border text-white glass-card ${toast.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
          {toast.message}
        </div>
      )}

      <div className={`relative z-10 w-full max-w-md transition-all duration-700 ${showForm ? 'opacity-100' : 'opacity-0 -translate-y-5'}`}>
        <div className="w-full max-w-md p-6 md:p-8 rounded-2xl glass-card">
          <div className="text-center mb-6">
            <PhoenixCrestLogo />
            <h1 className="text-3xl font-extrabold tracking-wider uppercase text-cyan-300 mt-4">BATTLE ARENA</h1>
            <p className="text-md font-semibold text-gray-400">Authentication Required</p>
          </div>
          <AuthTabs showToast={showToast} />
        </div>
      </div>
      
      <AppFooter />
    </div>
  );
};

export default LoginPage;
