import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { User, MatchStatus, Role, Match, GameSubMode } from '../types';
import {
  ArrowLeftIcon, CalendarDaysIcon, ClockIcon, UserGroupIcon, UsersIcon, ShieldCheckIcon,
  InformationCircleIcon, TagIcon, CurrencyDollarIcon, TrophyIcon, LockClosedIcon,
  HashtagIcon, ShareIcon, ExclamationTriangleIcon, ArrowUturnLeftIcon, ChatBubbleBottomCenterTextIcon,
  ChartBarIcon, FireIcon
} from '@heroicons/react/24/solid';

const DetailItem: React.FC<{ icon: React.ReactNode, label: string, value: React.ReactNode, colorClass?: string }> = ({ icon, label, value, colorClass = 'text-cyan-400' }) => (
    <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
        <div className="flex items-center">
            <div className={`mr-3 ${colorClass}`}>{icon}</div>
            <span className="text-gray-300">{label}</span>
        </div>
        <div className="font-bold text-white text-right">{value}</div>
    </div>
);

const Countdown: React.FC<{ toDate: Date }> = ({ toDate }) => {
    const calculateTimeLeft = () => {
        const difference = toDate.getTime() - new Date().getTime();
        let timeLeft: { [key: string]: number } = {};
        if (difference > 0) {
            timeLeft = {
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }
        return timeLeft;
    };
    
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => { setTimeLeft(calculateTimeLeft()); }, 1000);
        return () => clearTimeout(timer);
    });

    if (Object.keys(timeLeft).length === 0) {
        return <span className="text-green-400">Details Unlocked!</span>;
    }

    return (
        <span className="font-mono">
            {String(timeLeft.hours).padStart(2, '0')}:
            {String(timeLeft.minutes).padStart(2, '0')}:
            {String(timeLeft.seconds).padStart(2, '0')}
        </span>
    );
};


const MatchDetailsPage: React.FC = () => {
    const { currentUser, matches, setAppState, selectedMatchId, setSelectedMatchId } = useAppContext();
    const user = currentUser as User;
    
    const match = useMemo(() => matches.find(m => m.id === selectedMatchId), [matches, selectedMatchId]);
    const participantData = useMemo(() => match?.participants.find(p => p.userId === user.id), [match, user.id]);


    useEffect(() => {
        if (!match) {
            setSelectedMatchId(null);
        }
    }, [match, setSelectedMatchId]);
    
    if (!match) return null;

    const getMatchIcon = (subMode: GameSubMode) => {
        switch (subMode) {
            case 'Solo':
            case '1v1': 
              return <UserGroupIcon className="h-5 w-5" />;
            case 'Duo': 
            case '2v2':
              return <UsersIcon className="h-5 w-5" />;
            case 'Squad':
            case '4v4':
              return <ShieldCheckIcon className="h-5 w-5" />;
        }
    };

    const handleLeaveMatch = () => {
        if (match.entryFee > 0 && !window.confirm(`Are you sure you want to leave this match? Your entry fee of ₹${match.entryFee} will be refunded.`)) return;
        if (match.entryFee === 0 && !window.confirm(`Are you sure you want to leave this match?`)) return;

        setAppState(prev => {
            const updatedUsers = prev.users.map(u => 
                u.id === user.id ? { ...u, balance: u.balance + match.entryFee, joinedMatchIds: u.joinedMatchIds.filter(id => id !== match.id) } : u
            );
            const updatedMatches = prev.matches.map(m => 
                m.id === match.id ? { ...m, participants: m.participants.filter(p => p.userId !== user.id) } : m
            );
            
            const transactions = [...prev.transactions];
            if (match.entryFee > 0) {
                transactions.push({
                    id: `txn-refund-${Date.now()}`,
                    userId: user.id,
                    amount: match.entryFee,
                    type: 'recharge', // Visually a recharge
                    date: new Date(),
                    status: 'success',
                });
            }

            const newCurrentUser = updatedUsers.find(u => u.id === prev.currentUser?.id);

            return { 
                ...prev, 
                users: updatedUsers, 
                matches: updatedMatches, 
                transactions,
                currentUser: newCurrentUser && prev.currentUser?.role === Role.User ? newCurrentUser : prev.currentUser,
            };
        });
        setSelectedMatchId(null);
    };

    const handleShare = () => {
        const shareText = `Check out this Free Fire tournament: "${match.title}"! Join the action!`;
        if (navigator.share) {
            navigator.share({
                title: 'Free Fire Tournament',
                text: shareText,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(shareText);
            alert('Match details copied to clipboard!');
        }
    };
    
    const timeToMatchMs = match.dateTime.getTime() - new Date().getTime();
    const areDetailsVisible = timeToMatchMs < 15 * 60 * 1000;
    const yourSlotNumber = match.participants.findIndex(p => p.userId === user.id) + 1;

    return (
        <div className="animate-fade-in">
            <header className="bg-gray-800/80 backdrop-blur-sm p-4 flex items-center sticky top-0 z-10 border-b border-gray-700">
                <button onClick={() => setSelectedMatchId(null)} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                    <ArrowLeftIcon className="h-6 w-6 text-white" />
                </button>
                <h1 className="text-xl font-bold ml-4 text-white">{match.title}</h1>
            </header>
            
            <div className="p-4 space-y-6">

                {match.status === MatchStatus.Completed && participantData?.performance && (
                    <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-4 rounded-xl border border-yellow-500/50 shadow-lg shadow-yellow-500/10">
                        {match.winner === user.id && (
                             <div className="text-center mb-4 p-2 bg-yellow-400/20 rounded-lg">
                                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">
                                    Booyah! You Are The Winner!
                                </h2>
                             </div>
                        )}
                         <h3 className="text-lg font-bold text-yellow-400 mb-3 text-center">Your Performance</h3>
                         <div className="flex justify-around text-center">
                            <div>
                                <p className="text-gray-400 text-sm flex items-center justify-center gap-1"><ChartBarIcon className="h-4 w-4"/>Rank</p>
                                <p className="text-3xl font-bold text-white">#{participantData.performance.rank}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm flex items-center justify-center gap-1"><FireIcon className="h-4 w-4"/>Kills</p>
                                <p className="text-3xl font-bold text-white">{participantData.performance.kills}</p>
                            </div>
                         </div>
                    </div>
                )}


                {/* Main Details Card */}
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 space-y-2">
                    <DetailItem icon={<CalendarDaysIcon className="h-5 w-5"/>} label="Date & Time" value={match.dateTime.toLocaleString()} />
                    <DetailItem icon={getMatchIcon(match.subMode)} label="Game Mode" value={`${match.gameMode} (${match.subMode})`} />
                    <DetailItem icon={<InformationCircleIcon className="h-5 w-5"/>} label="Status" value={<span className={`font-bold ${match.status === 'Upcoming' ? 'text-cyan-400' : 'text-green-400'}`}>{match.status}</span>} />
                    <DetailItem icon={<TagIcon className="h-5 w-5"/>} label="Entry Type" value={match.entryFee > 0 ? "Paid Entry" : "Free Entry"} />
                    <DetailItem icon={<CurrencyDollarIcon className="h-5 w-5"/>} label="Entry Fee" value={`₹${match.entryFee}`} colorClass="text-green-400" />
                    <DetailItem icon={<TrophyIcon className="h-5 w-5"/>} label="Prize Pool" value={`₹${match.prizePool}`} colorClass="text-yellow-400" />
                </div>
                
                {/* Room Details & Slot Card */}
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 space-y-2">
                     <h3 className="text-lg font-bold text-orange-400 mb-2">Your Match Info</h3>
                     {areDetailsVisible && match.roomDetails?.id ? (
                        <>
                            <DetailItem icon={<LockClosedIcon className="h-5 w-5"/>} label="Room ID" value={<span className="font-mono">{match.roomDetails.id}</span>} colorClass="text-orange-400" />
                            <DetailItem icon={<LockClosedIcon className="h-5 w-5"/>} label="Room Password" value={<span className="font-mono">{match.roomDetails.pass}</span>} colorClass="text-orange-400" />
                        </>
                     ) : match.status === MatchStatus.Upcoming ? (
                        <div className="p-3 bg-gray-900/50 rounded-lg text-center">
                            <p className="text-gray-300">Room details will be available in:</p>
                            <p className="text-2xl font-bold text-yellow-400">
                                <Countdown toDate={new Date(match.dateTime.getTime() - 15 * 60 * 1000)} />
                            </p>
                        </div>
                     ) : (
                        <p className="text-center text-gray-500 p-2">Room details are no longer available.</p>
                     )}
                     <DetailItem icon={<HashtagIcon className="h-5 w-5"/>} label="Your Slot Number" value={yourSlotNumber > 0 ? `#${yourSlotNumber}`: 'N/A'} />
                     <DetailItem icon={<UserGroupIcon className="h-5 w-5"/>} label="Joined Players" value={`${match.participants.length} / ${match.totalSlots}`} />
                </div>

                {/* Warning Message */}
                <div className="flex items-center p-3 bg-yellow-500/10 border border-yellow-500/50 rounded-lg text-yellow-300">
                    <ExclamationTriangleIcon className="h-10 w-10 mr-4"/>
                    <p className="text-sm">Join the custom room at least 5 minutes before the match starts to avoid disqualification.</p>
                </div>

                {/* Rules */}
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                     <h3 className="text-lg font-bold text-cyan-400 mb-3">Rules & Regulations</h3>
                     <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                         <li>No emulators allowed.</li>
                         <li>No teaming or cheating. Violators will be banned.</li>
                         <li>Join only using the account you registered with.</li>
                         <li>Follow all Free Fire fair play policies.</li>
                         <li>Prizes will be credited to your wallet within 24 hours of the match result.</li>
                     </ul>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                    <button 
                        onClick={handleLeaveMatch} 
                        disabled={match.status !== MatchStatus.Upcoming}
                        className="flex items-center justify-center space-x-2 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg shadow-red-500/20 disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                    >
                         <ArrowUturnLeftIcon className="h-5 w-5"/>
                         <span>Leave Match</span>
                    </button>
                    <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center space-x-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg shadow-green-500/20">
                         <ChatBubbleBottomCenterTextIcon className="h-5 w-5"/>
                         <span>Contact Admin</span>
                    </a>
                     <button onClick={handleShare} className="col-span-2 flex items-center justify-center space-x-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/20">
                         <ShareIcon className="h-5 w-5"/>
                         <span>Share Match</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MatchDetailsPage;