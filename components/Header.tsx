
import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Role } from '../types';
import { ShieldCheckIcon, UserCircleIcon, StarIcon } from '@heroicons/react/24/solid';

const Header: React.FC = () => {
  const { currentUser, logout } = useAppContext();

  const getRoleIcon = () => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case Role.Boss:
        return <StarIcon className="h-5 w-5 text-yellow-400" />;
      case Role.Admin:
        return <ShieldCheckIcon className="h-5 w-5 text-cyan-400" />;
      case Role.User:
        return <UserCircleIcon className="h-5 w-5 text-green-400" />;
      default:
        return null;
    }
  };

  return (
    <header className="bg-gray-900/50 backdrop-blur-sm p-4 flex justify-between items-center border-b border-gray-700">
      <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-500">
        Tournament Hub
      </h1>
      {currentUser && (
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {getRoleIcon()}
            <span className="font-medium">{currentUser.username}</span>
          </div>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 transform hover:scale-105"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
