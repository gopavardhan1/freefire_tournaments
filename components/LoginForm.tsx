import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { EyeIcon, EyeSlashIcon, UserCircleIcon, KeyIcon } from '@heroicons/react/24/solid';

interface LoginFormProps {
  showToast: (message: string, type?: 'success' | 'error') => void;
  onSwitchToRegister: () => void;
}

const UserIconAnimated = () => (
    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
)

const KeyIconAnimated = () => (
     <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 10H20M20 10L18 8M20 10L18 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 10H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 10C7 8.89543 7.89543 8 9 8H9C10.1046 8 11 8.89543 11 10V10C11 11.1046 10.1046 12 9 12H9C7.89543 12 7 11.1046 7 10V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
)

const LoginForm: React.FC<LoginFormProps> = ({ showToast, onSwitchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { login } = useAppContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setHasError(false);

    setTimeout(() => {
      const loginResult = login(username, password);
      
      if (loginResult !== 'success') {
        if (loginResult === 'banned') {
            showToast('Your account has been banned.', 'error');
        } else {
            showToast('Authentication Failed!', 'error');
        }
        setHasError(true);
      }
      setIsLoading(false);
    }, 1000);
  };
  
  useEffect(() => {
    if(hasError) {
        const timer = setTimeout(() => setHasError(false), 500);
        return () => clearTimeout(timer);
    }
  }, [hasError]);
  
  const formClass = hasError ? 'animate-shake' : '';
  const inputBaseClass = "w-full pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none transition-all duration-300 rounded-lg input-field";

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${formClass}`}>
      <div className="relative input-wrapper">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <UserIconAnimated />
          </div>
          <input
              type="text" id="login-username" value={username}
              onChange={(e) => setUsername(e.target.value)}
              required className={inputBaseClass}
              autoComplete="username" placeholder="Username / ID"
          />
      </div>
      <div className="relative input-wrapper">
         <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <KeyIconAnimated />
          </div>
          <input
              type={isPasswordVisible ? "text" : "password"}
              id="login-password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              required className={inputBaseClass}
              autoComplete="current-password" placeholder="Password"
          />
          <button
              type="button"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-cyan-400"
          >
              {isPasswordVisible ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
          </button>
      </div>
      
      <div className="flex justify-between items-center text-sm">
        <label className="flex items-center space-x-2 text-gray-400 custom-checkbox">
            <input type="checkbox" className="absolute opacity-0 w-0 h-0" />
            <div className="checkbox-bg h-5 w-9 rounded-full bg-gray-700/50 border border-gray-600 transition-colors flex items-center p-0.5">
                <div className="checkbox-dot h-4 w-4 bg-white rounded-full shadow transition-transform duration-300 ease-in-out"></div>
            </div>
            <span>Remember Me</span>
        </label>
        <a href="#" className="text-cyan-400 hover:underline">Forgot Password?</a>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 flex items-center justify-center submit-btn text-white font-bold tracking-wider py-3 px-4 rounded-lg"
        >
          {isLoading ? (
              <div className="h-6 w-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
          ) : (
              "LOGIN"
          )}
        </button>
      </div>

      <div className="text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <span onClick={onSwitchToRegister} className="cursor-pointer text-cyan-400 hover:underline font-bold transition">Register Now</span>
      </div>
    </form>
  );
};

export default LoginForm;