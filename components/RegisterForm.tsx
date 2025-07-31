import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';

interface RegisterFormProps {
  showToast: (message: string, type?: 'success' | 'error') => void;
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ showToast, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, login } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
        if (password !== confirmPassword) {
          showToast('Passwords do not match.', 'error');
          setIsLoading(false);
          return;
        }

        const newUser = register({ username, email, password });

        if (newUser) {
          showToast('Profile created! Logging you in...', 'success');
          setTimeout(() => {
            login(username, password);
          }, 1500);
        } else {
          showToast('Username already exists.', 'error');
        }
        setIsLoading(false);
    }, 1000);
  };

  const inputBaseClass = "w-full pl-4 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none transition-all duration-300 rounded-lg input-field";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="relative input-wrapper">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className={inputBaseClass}
          autoComplete="username"
          placeholder="Username"
        />
      </div>
       <div className="relative input-wrapper">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputBaseClass}
          autoComplete="email"
          placeholder="Email"
        />
      </div>
      <div className="relative input-wrapper">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={inputBaseClass}
           autoComplete="new-password"
           placeholder="Password"
        />
      </div>
      <div className="relative input-wrapper">
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className={inputBaseClass}
          autoComplete="new-password"
          placeholder="Confirm Password"
        />
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
              "[ CREATE NEURAL PROFILE ]"
          )}
        </button>
      </div>
       <div className="text-center text-sm text-gray-400">
          Already have a profile?{' '}
          <span onClick={onSwitchToLogin} className="cursor-pointer text-cyan-400 hover:text-cyan-300 font-bold transition">Authenticate</span>
      </div>
    </form>
  );
};

export default RegisterForm;