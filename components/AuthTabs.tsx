import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthTabsProps {
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const AuthTabs: React.FC<AuthTabsProps> = ({ showToast }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  return (
    <div className="w-full relative">
      {activeTab === 'login' ? (
          <LoginForm showToast={showToast} onSwitchToRegister={() => setActiveTab('register')} />
        ) : (
          <RegisterForm showToast={showToast} onSwitchToLogin={() => setActiveTab('login')} />
      )}
    </div>
  );
};

export default AuthTabs;