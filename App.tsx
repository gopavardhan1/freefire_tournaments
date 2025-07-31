import React, { useState, useMemo, useCallback } from 'react';
import { AppContext } from './hooks/useAppContext';
import LoginPage from './components/LoginPage';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import BossDashboard from './components/BossDashboard';
import Header from './components/Header';
import MatchDetailsPage from './components/MatchDetailsPage';
import JoinMatchModal from './components/JoinMatchModal';
import { User, Match, Admin, Role, Transaction, AppState, LoginResult } from './types';
import { INITIAL_USERS, INITIAL_MATCHES, INITIAL_ADMINS, BOSS_CREDENTIALS, INITIAL_WITHDRAWAL_REQUESTS } from './constants';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    currentUser: null,
    users: INITIAL_USERS,
    matches: INITIAL_MATCHES,
    admins: INITIAL_ADMINS,
    transactions: [],
    withdrawalRequests: INITIAL_WITHDRAWAL_REQUESTS,
    selectedMatchId: null,
    joiningMatchId: null,
  });

  const handleLogout = useCallback(() => {
    setAppState(prev => ({ ...prev, currentUser: null, selectedMatchId: null, joiningMatchId: null }));
  }, []);
  
  const login = useCallback((username: string, password: string): LoginResult => {
    if (username === BOSS_CREDENTIALS.username && password === BOSS_CREDENTIALS.password) {
      setAppState(prev => ({ ...prev, currentUser: BOSS_CREDENTIALS }));
      return 'success';
    }
    const admin = appState.admins.find(a => a.username === username && a.password === password);
    if (admin) {
      setAppState(prev => ({ ...prev, currentUser: admin }));
      return 'success';
    }
    const user = appState.users.find(u => u.username === username && u.password === password);
    if (user) {
      if (user.isBanned) {
        return 'banned';
      }
      setAppState(prev => ({ ...prev, currentUser: user }));
      return 'success';
    }
    return 'not_found';
  }, [appState.admins, appState.users]);

  const register = useCallback((newUser: Omit<User, 'id' | 'balance' | 'joinedMatchIds' | 'role' | 'isBanned'>): User | null => {
    if (appState.users.some(u => u.username === newUser.username) || appState.admins.some(a => a.username === newUser.username)) {
      return null;
    }
    const user: User = {
      ...newUser,
      id: `user-${Date.now()}`,
      balance: 0,
      joinedMatchIds: [],
      role: Role.User,
      isBanned: false,
    };
    setAppState(prev => ({ ...prev, users: [...prev.users, user] }));
    return user;
  }, [appState.users, appState.admins]);

  const setSelectedMatchId = useCallback((id: string | null) => {
    setAppState(prev => ({ ...prev, selectedMatchId: id }));
  }, []);

  const setJoiningMatchId = useCallback((id: string | null) => {
    setAppState(prev => ({ ...prev, joiningMatchId: id }));
  }, []);
  
  const appContextValue = useMemo(() => ({
    ...appState,
    login,
    register,
    setAppState,
    logout: handleLogout,
    setSelectedMatchId,
    setJoiningMatchId,
  }), [appState, login, register, handleLogout, setSelectedMatchId, setJoiningMatchId]);

  const renderDashboard = () => {
    if (!appState.currentUser) return <LoginPage />;

    if (appState.selectedMatchId && appState.currentUser.role === Role.User) {
        const match = appState.matches.find(m => m.id === appState.selectedMatchId);
        if (match && (appState.currentUser as User).joinedMatchIds.includes(match.id)) {
            return <MatchDetailsPage />;
        }
    }
    
    switch (appState.currentUser.role) {
      case Role.Boss:
        return <BossDashboard />;
      case Role.Admin:
        return <AdminDashboard />;
      case Role.User:
        return <UserDashboard />;
      default:
        return <LoginPage />;
    }
  };
  
  const isLoginPage = !appState.currentUser;
  const isBossPage = appState.currentUser?.role === Role.Boss;

  let containerClass = "min-h-screen";
  if(isLoginPage) {
    containerClass += " flex items-center justify-center p-4";
  } else if (!isBossPage) {
    containerClass += " bg-gray-900 bg-gradient-to-br from-gray-900 to-gray-800";
  }
  
  return (
    <AppContext.Provider value={appContextValue}>
      <div className={containerClass}>
        {isLoginPage && renderDashboard()}
        
        {appState.currentUser && !isBossPage && (
          <>
            {appState.currentUser && !appState.selectedMatchId && <Header />}
            <main className="p-4 sm:p-6 lg:p-8">
              {renderDashboard()}
            </main>
          </>
        )}
        
        {isBossPage && renderDashboard()}
        
        {appState.joiningMatchId && <JoinMatchModal />}
      </div>
    </AppContext.Provider>
  );
};

export default App;