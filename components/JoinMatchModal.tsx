import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { GameSubMode, PlayerDetails, Participant, User, Role } from '../types';
import { XMarkIcon } from '@heroicons/react/24/solid';

const JoinMatchModal: React.FC = () => {
    const { joiningMatchId, setJoiningMatchId, matches, currentUser, setAppState } = useAppContext();
    const match = useMemo(() => matches.find(m => m.id === joiningMatchId), [matches, joiningMatchId]);
    
    const getPlayerCount = (subMode: GameSubMode): number => {
      switch (subMode) {
        case 'Solo':
        case '1v1':
          return 1;
        case 'Duo':
        case '2v2':
          return 2;
        case 'Squad':
        case '4v4':
          return 4;
        default:
          return 1;
      }
    };

    const [teamDetails, setTeamDetails] = useState<PlayerDetails[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (match) {
            const playerCount = getPlayerCount(match.subMode);
            setTeamDetails(Array.from({ length: playerCount }, () => ({ ffName: '', ffUid: '' })));
        }
    }, [match]);

    if (!match || !currentUser || currentUser.role !== Role.User) {
        return null;
    }
    const user = currentUser as User;

    const handleInputChange = (index: number, field: keyof PlayerDetails, value: string) => {
        const newTeamDetails = [...teamDetails];
        newTeamDetails[index][field] = value;
        setTeamDetails(newTeamDetails);
    };

    const isFormValid = useMemo(() => {
        return teamDetails.every(player => player.ffName.trim() !== '' && player.ffUid.trim() !== '');
    }, [teamDetails]);

    const handleConfirmJoin = () => {
        setError('');
        if (!isFormValid) {
            setError('All fields are required.');
            return;
        }
        if (user.balance < match.entryFee) {
            setError('Insufficient balance.');
            return;
        }

        const newParticipant: Participant = {
            userId: user.id,
            team: teamDetails,
        };

        setAppState(prev => {
            const updatedUsers = prev.users.map(u => 
                u.id === user.id ? { 
                    ...u, 
                    balance: u.balance - match.entryFee, 
                    joinedMatchIds: [...u.joinedMatchIds, match.id] 
                } : u
            );
            const updatedMatches = prev.matches.map(m => 
                m.id === match.id ? { ...m, participants: [...m.participants, newParticipant] } : m
            );
            const newTransaction = {
                id: `txn-join-${Date.now()}`,
                userId: user.id,
                amount: match.entryFee,
                type: 'entry_fee' as const,
                date: new Date(),
                status: 'success' as const,
            };
            
            const newCurrentUser = updatedUsers.find(u => u.id === prev.currentUser?.id);

            return { 
                ...prev, 
                users: updatedUsers, 
                matches: updatedMatches, 
                transactions: match.entryFee > 0 ? [...prev.transactions, newTransaction] : prev.transactions,
                currentUser: newCurrentUser && prev.currentUser?.role === Role.User ? newCurrentUser : prev.currentUser,
            };
        });

        setJoiningMatchId(null);
    };

    const handleCancel = () => {
        setJoiningMatchId(null);
    };

    const inputClass = "w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-gray-800 border border-green-500/50 rounded-xl shadow-2xl shadow-green-500/20 w-full max-w-lg transform transition-all">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-green-400">Join Match: {match.title}</h2>
                    <button onClick={handleCancel} className="text-gray-400 hover:text-white">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <p className="text-center text-sm text-gray-400 mb-4">Enter your team's details. All fields are required.</p>
                    <div className="space-y-6">
                        {teamDetails.map((player, index) => (
                            <div key={index} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                                <h4 className="font-bold text-lg text-cyan-400 mb-3">Player {index + 1}</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Free Fire Name</label>
                                        <input 
                                            type="text"
                                            value={player.ffName}
                                            onChange={(e) => handleInputChange(index, 'ffName', e.target.value)}
                                            className={inputClass}
                                            placeholder="e.g., ProGamer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Free Fire UID</label>
                                        <input 
                                            type="text"
                                            value={player.ffUid}
                                            onChange={(e) => handleInputChange(index, 'ffUid', e.target.value.replace(/\D/g, ''))}
                                            className={inputClass}
                                            placeholder="e.g., 1234567890"
                                            inputMode="numeric"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {error && <p className="text-red-500 text-center font-semibold mt-4">{error}</p>}
                    <p className="text-xs text-yellow-400 text-center mt-4">Enter correct UID to receive winnings.</p>
                </div>

                <div className="p-4 bg-gray-900/50 rounded-b-xl flex justify-between items-center">
                    <button onClick={handleCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105">
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirmJoin} 
                        disabled={!isFormValid}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-2 px-8 rounded-lg transition-transform transform hover:scale-105 shadow-lg shadow-green-500/20 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        Confirm Join
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JoinMatchModal;