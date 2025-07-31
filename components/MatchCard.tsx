import React, { useState, useEffect } from 'react';
import { Match, Role, User, MatchStatus, GameSubMode } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import { MapPinIcon, UserGroupIcon, TicketIcon, UsersIcon, ShieldCheckIcon, StarIcon, LightBulbIcon, CurrencyDollarIcon } from '@heroicons/react/24/solid';
import AiStrategistModal from './AiStrategistModal';

const Countdown: React.FC<{ toDate: Date }> = ({ toDate }) => {
    const calculateTimeLeft = () => {
        const difference = toDate.getTime() - new Date().getTime();
        let timeLeft: { [key: string]: number } = {};
        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }
        return timeLeft;
    };
    
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    const timerComponents: JSX.Element[] = [];
    Object.keys(timeLeft).forEach(interval => {
        if (!timeLeft[interval] && interval !== 'days' && Object.keys(timerComponents).length === 0) {
            return;
        }

        if (timeLeft[interval] > 0 || (interval === 'days' && Object.keys(timeLeft).length > 1) ) {
            timerComponents.push(
                <div key={interval} className="text-center">
                    <div className="font-bold text-lg text-orange-400">{String(timeLeft[interval]).padStart(2, '0')}</div>
                    <div className="text-xs text-gray-400 uppercase">{interval}</div>
                </div>
            );
        }
    });

    if (timerComponents.length === 0) {
        return <div className="text-center font-bold text-lg text-yellow-400">Starting Soon!</div>;
    }

    return (
        <div className="flex space-x-2 justify-center">
            {timerComponents.slice(0, 3).map((component, index) => <React.Fragment key={index}>{component}{index < timerComponents.slice(0, 3).length - 1 && <div className="text-lg text-gray-500">:</div>}</React.Fragment>)}
        </div>
    );
};

const MatchCard: React.FC<{ match: Match }> = ({ match }) => {
  const { currentUser, setSelectedMatchId, setJoiningMatchId } = useAppContext();
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const user = currentUser?.role === Role.User ? currentUser as User : null;

  const isJoined = user ? match.participants.some(p => p.userId === user.id) : false;
  const isFull = match.participants.length >= match.totalSlots;
  
  const canJoin = user && !isJoined && !isFull && match.status === MatchStatus.Upcoming;

  const timeToMatch = match.dateTime.getTime() - Date.now();
  const isTimeForDetails = timeToMatch < 15 * 60 * 1000; // 15 minutes

  const handleCardClick = () => {
      if (isJoined) {
          setSelectedMatchId(match.id);
      }
  };

  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !canJoin) return;
    
    if (user.balance < match.entryFee) {
        setError('Insufficient Balance');
        setTimeout(() => setError(''), 3000);
        return;
    }
    setJoiningMatchId(match.id);
  };

  const getMatchIcon = (subMode: GameSubMode) => {
      switch (subMode) {
          case 'Solo':
          case '1v1': 
            return <UserGroupIcon className="h-5 w-5 mr-2" />;
          case 'Duo': 
          case '2v2':
            return <UsersIcon className="h-5 w-5 mr-2" />;
          case 'Squad':
          case '4v4':
            return <ShieldCheckIcon className="h-5 w-5 mr-2" />;
      }
  };
  
  const getStatusBadge = () => {
      let color = 'bg-gray-500';
      if (match.status === MatchStatus.Upcoming) color = 'bg-cyan-500';
      if (match.status === MatchStatus.Live) color = 'bg-yellow-500 animate-pulse';
      if (match.status === MatchStatus.Completed) color = 'bg-green-500';
      if (user && match.status === MatchStatus.Completed && match.winner === user.id) {
        return <div className="px-3 py-1 text-sm font-bold text-gray-900 bg-yellow-400 rounded-full flex items-center"><StarIcon className="h-4 w-4 mr-1"/>Won</div>;
      }
      return <div className={`px-3 py-1 text-sm font-bold text-white ${color} rounded-full`}>{match.status}</div>;
  }

  return (
    <>
    <div 
        onClick={handleCardClick} 
        className={`bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-orange-500/20 hover:border-orange-600 transition-all duration-300 transform hover:-translate-y-1 flex flex-col relative ${isJoined ? 'cursor-pointer' : ''}`}
    >
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-white mb-2">{match.title}</h3>
            {getStatusBadge()}
        </div>
        <p className="flex items-center text-orange-400 font-semibold mb-3">
          {getMatchIcon(match.subMode)}
          {match.gameMode} ({match.subMode}) - <MapPinIcon className="h-5 w-5 ml-3 mr-1" /> {match.map}
        </p>

        {match.status === MatchStatus.Upcoming && (
            <div className="my-4 p-3 bg-gray-900/50 rounded-lg">
                <Countdown toDate={match.dateTime} />
            </div>
        )}

        <div className="space-y-3 text-sm text-gray-300">
            <div className="flex justify-between items-center">
                <span className="flex items-center"><TicketIcon className="h-4 w-4 mr-2 text-gray-500"/>Entry Fee</span>
                <span className="font-semibold text-green-400 text-lg">{match.entryFee > 0 ? `₹${match.entryFee}` : 'Free'}</span>
            </div>
             <div className="flex justify-between items-center">
                <span className="flex items-center"><CurrencyDollarIcon className="h-4 w-4 mr-2 text-gray-500"/>Prize Pool</span>
                <span className="font-semibold text-yellow-400 text-lg">₹{match.prizePool}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="flex items-center"><UserGroupIcon className="h-4 w-4 mr-2 text-gray-500"/>Slots</span>
                <span className="font-semibold">{match.participants.length} / {match.totalSlots}</span>
            </div>
        </div>

        {isJoined && (
            <>
            {match.roomDetails && isTimeForDetails ? (
                <div className="mt-4 p-3 bg-gray-900 rounded-lg border border-orange-500/50">
                    <h4 className="font-bold text-orange-400">Room Details</h4>
                    <p>ID: <span className="font-mono text-white">{match.roomDetails.id}</span></p>
                    <p>Pass: <span className="font-mono text-white">{match.roomDetails.pass}</span></p>
                </div>
            ) : match.status === MatchStatus.Upcoming && (
                <div className="mt-4 p-3 bg-gray-900 rounded-lg border border-gray-600">
                    <h4 className="font-bold text-gray-400">Room Details Locked</h4>
                    <p className="text-sm text-gray-400">Revealed 15 mins before start.</p>
                </div>
            )}
            </>
        )}
      </div>
      
      {isJoined && (
        <div className="text-center text-xs text-gray-400 pb-2">
          Tap card for details
        </div>
      )}

      <div className="bg-gray-900/50 p-4 flex items-center justify-between mt-auto">
        <button onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }} className="flex items-center text-sm text-yellow-400 hover:text-yellow-300 transition-colors">
            <LightBulbIcon className="h-5 w-5 mr-1" />
            AI Strategist
        </button>
        {user && (
            <div>
            {error && <p className="text-red-500 text-xs font-bold text-right mb-1">{error}</p>}
            
            {canJoin && (
                <button onClick={handleJoinClick} className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg shadow-orange-500/20">
                    Join Match
                </button>
            )}

            {isJoined && (
                <p className="text-green-400 font-bold py-2 px-6">✓ Joined</p>
            )}

            {!isJoined && isFull && (
                 <p className="text-red-500 font-bold py-2 px-6">Full</p>
            )}

            </div>
        )}
      </div>
    </div>
    {isModalOpen && <AiStrategistModal match={match} onClose={() => setIsModalOpen(false)} />}
    </>
  );
};

export default MatchCard;