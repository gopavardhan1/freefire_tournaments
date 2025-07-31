import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { User, Match, Transaction, MatchStatus, Role, WithdrawalMethod, WithdrawalRequest, UpiDetails, BankDetails, WithdrawalStatus, GameMode } from '../types';
import MatchCard from './MatchCard';
import { 
    BanknotesIcon, ClockIcon, TrophyIcon, ClipboardDocumentListIcon, ChartBarIcon, StarIcon,
    WalletIcon, BuildingLibraryIcon, CreditCardIcon, CheckCircleIcon, XCircleIcon, InformationCircleIcon,
    ArrowUpCircleIcon, ArrowDownCircleIcon, ArrowUturnLeftIcon, QuestionMarkCircleIcon, XMarkIcon, ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/solid';

const inputClass = "w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition";

// --- MODALS ---
const DepositModal: React.FC<{onClose: () => void, showNotification: (type: 'success'|'error', message: string) => void}> = ({onClose, showNotification}) => {
    const { currentUser, setAppState } = useAppContext();
    const [amount, setAmount] = useState<number>(50);

    const handleRecharge = () => {
        if (!currentUser || currentUser.role !== Role.User) return;
        
        const newTransaction: Transaction = {
            id: `txn-recharge-${Date.now()}`,
            userId: currentUser.id,
            amount,
            type: 'recharge',
            date: new Date(),
            status: 'success',
        };
        
        setAppState(prev => {
            const updatedUsers = prev.users.map(u => 
                u.id === currentUser.id ? { ...u, balance: u.balance + amount } : u
            );
            const newCurrentUser = updatedUsers.find(u => u.id === prev.currentUser?.id);

            return {
                ...prev,
                users: updatedUsers,
                transactions: [...prev.transactions, newTransaction],
                currentUser: newCurrentUser || prev.currentUser,
            };
        });
        showNotification('success', `₹${amount} added to your wallet!`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-gray-800 border border-green-500/50 rounded-xl shadow-2xl shadow-green-500/20 w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-green-400">Deposit Funds</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="h-6 w-6" /></button>
                </div>
                <div className="p-6 text-center space-y-6">
                    <p className="text-gray-300">Select an amount to add to your wallet.</p>
                    <div className="grid grid-cols-2 gap-4">
                        {[50, 100, 200, 500].map(val => (
                            <button key={val} onClick={() => setAmount(val)} className={`p-4 rounded-lg font-bold text-xl transition ${amount === val ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                ₹{val}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleRecharge} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105">
                        Deposit ₹{amount}
                    </button>
                </div>
            </div>
        </div>
    );
};

const WithdrawModal: React.FC<{onClose: () => void, showNotification: (type: 'success'|'error', message: string) => void}> = ({onClose, showNotification}) => {
    const { currentUser, setAppState } = useAppContext();
    const user = currentUser as User;
    
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState<WithdrawalMethod>(WithdrawalMethod.Upi);
    const [upiId, setUpiId] = useState('');
    const [accountHolder, setAccountHolder] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [ifsc, setIfsc] = useState('');
    const [bankName, setBankName] = useState('');
    const [formError, setFormError] = useState('');

     const handleRequestWithdrawal = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        const withdrawAmount = parseFloat(amount);
        if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
            setFormError('Please enter a valid amount.');
            return;
        }
        if (withdrawAmount < 1) {
            setFormError('Minimum withdrawal amount is ₹1.');
            return;
        }
        if (withdrawAmount > user.balance) {
            setFormError('Withdrawal amount cannot exceed your balance.');
            return;
        }

        let details: UpiDetails | BankDetails;
        if (method === WithdrawalMethod.Upi) {
            if (!upiId) { setFormError('Please enter your UPI ID.'); return; }
            details = { upiId };
        } else {
            if (!accountHolder || !accountNumber || !ifsc || !bankName) { setFormError('Please fill all bank details.'); return; }
            details = { accountHolder, accountNumber, ifsc, bankName };
        }

        const newRequest: WithdrawalRequest = {
            id: `wr-${Date.now()}`,
            userId: user.id,
            amount: withdrawAmount,
            method,
            details,
            status: WithdrawalStatus.Pending,
            date: new Date(),
        };

        setAppState(prev => {
            const updatedUsers = prev.users.map(u => 
                u.id === user.id ? { ...u, balance: u.balance - withdrawAmount } : u
            );
            const newCurrentUser = updatedUsers.find(u => u.id === prev.currentUser?.id);

            return {
                ...prev,
                users: updatedUsers,
                withdrawalRequests: [...prev.withdrawalRequests, newRequest],
                currentUser: newCurrentUser || prev.currentUser,
            };
        });

        showNotification('success', 'Withdrawal request submitted successfully!');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fade-in">
             <div className="bg-gray-800 border border-orange-500/50 rounded-xl shadow-2xl shadow-orange-500/20 w-full max-w-lg">
                 <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-orange-400">Request Withdrawal</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="h-6 w-6" /></button>
                </div>
                <form onSubmit={handleRequestWithdrawal} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Amount (₹)</label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={`Your balance: ₹${user.balance.toFixed(2)}`} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Method</label>
                        <select value={method} onChange={e => setMethod(e.target.value as WithdrawalMethod)} className={inputClass}>
                            <option value={WithdrawalMethod.Upi}>UPI</option>
                            <option value={WithdrawalMethod.Bank}>Bank Transfer</option>
                        </select>
                    </div>
                    {method === WithdrawalMethod.Upi ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">UPI ID</label>
                            <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@bank" className={inputClass} />
                        </div>
                    ) : (
                        <div className="space-y-3 p-4 bg-gray-900/50 rounded-lg">
                            <h4 className="font-semibold text-cyan-400">Bank Details</h4>
                            <input type="text" value={accountHolder} onChange={e => setAccountHolder(e.target.value)} placeholder="Account Holder Name" className={inputClass} />
                            <input type="text" inputMode="numeric" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="Account Number" className={inputClass} />
                            <input type="text" value={ifsc} onChange={e => setIfsc(e.target.value)} placeholder="IFSC Code" className={inputClass} />
                            <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="Bank Name" className={inputClass} />
                        </div>
                    )}
                    {formError && <p className="text-red-500 text-sm text-center">{formError}</p>}
                    <p className="text-xs text-gray-400 text-center">Withdrawals may take up to 24 hours to process.</p>
                     <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition duration-300 transform hover:scale-105" disabled={user.balance <= 0}>
                        Submit Request
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- TABS CONTENT ---
const History: React.FC = () => {
    const { currentUser, transactions, withdrawalRequests } = useAppContext();
    const user = currentUser as User;

    const historyItems = useMemo(() => {
        const items: any[] = [];
        
        transactions.filter(t => t.userId === user.id).forEach(tx => {
            const isRefund = tx.type === 'recharge' && tx.id.includes('refund');
            
            let title = '';
            let type = '';
            let icon = <QuestionMarkCircleIcon className="h-6 w-6"/>;
            let color = 'text-gray-400';

            switch (tx.type) {
                case 'recharge':
                    title = isRefund ? 'Withdrawal Refund' : 'Deposit';
                    type = isRefund ? 'refund' : 'deposit';
                    icon = isRefund ? <ArrowUturnLeftIcon className="h-6 w-6"/> : <ArrowUpCircleIcon className="h-6 w-6"/>;
                    color = isRefund ? 'text-blue-400' : 'text-green-400';
                    break;
                case 'entry_fee':
                    title = 'Match Entry Fee';
                    type = 'fee';
                    icon = <ArrowDownCircleIcon className="h-6 w-6"/>;
                    color = 'text-red-400';
                    break;
                case 'manual_add':
                    title = 'Admin Credit';
                    type = 'deposit';
                    icon = <ArrowUpCircleIcon className="h-6 w-6"/>;
                    color = 'text-green-400';
                    break;
                case 'manual_remove':
                    title = 'Admin Debit';
                    type = 'fee';
                    icon = <ArrowDownCircleIcon className="h-6 w-6"/>;
                    color = 'text-red-400';
                    break;
            }

            items.push({ id: tx.id, date: tx.date, title, amount: tx.amount, type, icon, color });
        });

        withdrawalRequests.filter(wr => wr.userId === user.id).forEach(wr => {
            const statusIcons = {
                [WithdrawalStatus.Approved]: <CheckCircleIcon className="h-6 w-6"/>,
                [WithdrawalStatus.Rejected]: <XCircleIcon className="h-6 w-6"/>,
                [WithdrawalStatus.Pending]: <ClockIcon className="h-6 w-6"/>,
            };
            const statusColors = {
                [WithdrawalStatus.Approved]: 'text-green-400',
                [WithdrawalStatus.Rejected]: 'text-red-400',
                [WithdrawalStatus.Pending]: 'text-orange-400',
            };
            items.push({
                id: wr.id,
                date: wr.date,
                title: `Withdrawal (${wr.method})`,
                amount: wr.amount,
                type: 'withdrawal',
                status: wr.status,
                remark: wr.adminRemark,
                icon: statusIcons[wr.status] || <QuestionMarkCircleIcon className="h-6 w-6"/>,
                color: statusColors[wr.status] || 'text-gray-400',
            })
        });

        return items.sort((a,b) => b.date.getTime() - a.date.getTime());
    }, [user.id, transactions, withdrawalRequests]);

    if (historyItems.length === 0) {
        return <div className="text-gray-400 text-center py-10 bg-gray-800/50 rounded-xl">No history yet.</div>;
    }

    return (
        <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-xl border border-gray-700 space-y-4">
            <h3 className="text-2xl font-bold text-white">Full Transaction History</h3>
            <div className="max-h-[500px] overflow-y-auto space-y-3 pr-2">
                {historyItems.map(item => (
                    <div key={item.id} className="bg-gray-900/70 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <div className={`mr-4 ${item.color}`}>{item.icon}</div>
                                <div>
                                    <p className="font-bold text-white capitalize">{item.title}</p>
                                    <p className="text-sm text-gray-400">{item.date.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className={`font-bold text-lg text-right ${item.color}`}>
                                {item.type === 'fee' || item.type === 'withdrawal' ? '-' : '+'}₹{item.amount.toFixed(2)}
                                {item.status && <p className="text-xs font-normal">{item.status}</p>}
                            </div>
                        </div>
                        {item.remark && item.type === 'withdrawal' && (
                             <div className="mt-2 pt-2 border-t border-gray-700">
                                <p className="text-sm text-gray-300 flex items-start">
                                    <InformationCircleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-cyan-400" />
                                    <span>
                                        <span className="font-semibold">
                                            {item.status === WithdrawalStatus.Approved ? 'Ref/UTR:' : 'Admin Note:'}
                                        </span>
                                        {' '}
                                        {item.remark}
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
};

const Leaderboard: React.FC = () => {
    const { users, matches } = useAppContext();
    const leaderboardData = useMemo(() => {
        const playerWinnings: { [userId: string]: { username: string; totalWinnings: number } } = {};
        matches.forEach(match => {
            if (match.status === MatchStatus.Completed && match.winner) {
                const winnerId = match.winner;
                const user = users.find(u => u.id === winnerId);
                if (user) {
                    if (!playerWinnings[winnerId]) playerWinnings[winnerId] = { username: user.username, totalWinnings: 0 };
                    playerWinnings[winnerId].totalWinnings += match.prizePool;
                }
            }
        });
        return Object.values(playerWinnings).sort((a, b) => b.totalWinnings - a.totalWinnings);
    }, [users, matches]);

    if (leaderboardData.length === 0) {
        return <div className="text-gray-400 text-center py-10 bg-gray-800/50 rounded-xl">No completed matches with winners yet.</div>;
    }

    return (
        <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-xl border border-gray-700 space-y-4">
            <h3 className="text-2xl font-bold text-white">Leaderboard</h3>
            <div className="space-y-3">
                {leaderboardData.map((player, index) => (
                    <div key={player.username} className={`bg-gray-900/70 p-4 rounded-lg flex items-center justify-between border-l-4 ${ index === 0 ? 'border-yellow-400 shadow-lg shadow-yellow-400/10' : index === 1 ? 'border-gray-400' : index === 2 ? 'border-orange-500' : 'border-gray-700'}`}>
                        <div className="flex items-center">
                            <span className="text-xl font-bold w-10 text-center">{index + 1}</span>
                            <p className="font-bold text-lg text-white">{player.username}</p>
                        </div>
                        <div className="flex items-center font-bold text-lg text-green-400">
                             <StarIcon className="h-5 w-5 mr-2 text-yellow-400" />₹{player.totalWinnings.toFixed(2)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- MAIN USER DASHBOARD COMPONENT ---
const UserDashboard: React.FC = () => {
    const { currentUser, matches } = useAppContext();
    const [view, setView] = useState<'upcoming' | 'joined' | 'history' | 'leaderboard'>('upcoming');
    const [notification, setNotification] = useState<{type: 'success'|'error', message: string} | null>(null);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [activeFilter, setActiveFilter] = useState<GameMode | 'All'>('All');

    useEffect(() => {
        setActiveFilter('All');
    }, [view]);

    const user = currentUser as User;

    const showNotification = (type: 'success'|'error', message: string) => {
        setNotification({type, message});
        setTimeout(() => setNotification(null), 3000);
    }
    
    const upcomingMatches = useMemo(() => matches.filter(m => m.status === MatchStatus.Upcoming), [matches]);
    const joinedMatches = useMemo(() => matches.filter(m => user.joinedMatchIds.includes(m.id)).sort((a,b) => b.dateTime.getTime() - a.dateTime.getTime()), [matches, user.joinedMatchIds]);

    const displayedMatches = useMemo(() => {
        const sourceList = view === 'upcoming' ? upcomingMatches : joinedMatches;
        if (activeFilter === 'All') return sourceList;
        return sourceList.filter(m => m.gameMode === activeFilter);
    }, [view, upcomingMatches, joinedMatches, activeFilter]);

    const filterCounts = useMemo(() => {
        const sourceList = view === 'upcoming' ? upcomingMatches : joinedMatches;
        return {
            all: sourceList.length,
            [GameMode.BattleRoyale]: sourceList.filter(m => m.gameMode === GameMode.BattleRoyale).length,
            [GameMode.ClashSquad]: sourceList.filter(m => m.gameMode === GameMode.ClashSquad).length,
            [GameMode.LoneWolf]: sourceList.filter(m => m.gameMode === GameMode.LoneWolf).length,
        }
    }, [view, upcomingMatches, joinedMatches]);

    const renderMatches = (matchList: Match[]) => {
        if (matchList.length === 0) {
            return <p className="text-gray-400 text-center py-10 bg-gray-800/50 rounded-xl">No matches found for this filter.</p>
        }
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matchList.map(match => <MatchCard key={match.id} match={match} />)}
            </div>
        )
    };
    
    const TabButton: React.FC<{
        label: string; icon: React.ReactNode; isActive?: boolean; onClick?: () => void; isLink?: boolean; href?: string;
    }> = ({ label, icon, isActive, onClick, isLink = false, href }) => {
        const classNames = `w-full flex flex-col sm:flex-row justify-center items-center space-y-1 sm:space-y-0 sm:space-x-2 py-3 rounded-lg font-bold transition-all duration-300 transform hover:-translate-y-1 ${ isActive ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-gray-700/50 hover:bg-gray-700'}`;

        if (isLink) {
            return (
                <a href={href} target="_blank" rel="noopener noreferrer" className={classNames}>
                    {icon}
                    <span>{label}</span>
                </a>
            )
        }

        return (
            <button onClick={onClick} className={classNames}>
                {icon}
                <span>{label}</span>
            </button>
        );
    }


    const FilterBar = () => {
        const filters = [
            { label: 'All', value: 'All', icon: '🌟' },
            { label: 'BR', value: GameMode.BattleRoyale, icon: '🔫' },
            { label: 'CS', value: GameMode.ClashSquad, icon: '🛡️' },
            { label: 'Lone Wolf', value: GameMode.LoneWolf, icon: '⚔️' },
        ] as const;
        
        const counts = filterCounts;
    
        return (
            <div className="flex space-x-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
                {filters.map(filter => {
                    const count = filter.value === 'All' ? counts.all : counts[filter.value];
                    if (count === 0 && filter.value !== 'All') return null;
                    return (
                        <button 
                            key={filter.value}
                            onClick={() => setActiveFilter(filter.value)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition flex items-center gap-2 ${activeFilter === filter.value ? 'bg-cyan-500 text-gray-900 shadow-lg shadow-cyan-500/30' : 'bg-gray-700/50 hover:bg-gray-700'}`}
                        >
                            <span>{filter.icon}</span>
                            {filter.label}
                            <span className={`px-2 py-0.5 rounded-full text-xs ${activeFilter === filter.value ? 'bg-gray-800/20' : 'bg-gray-600'}`}>
                                {count}
                            </span>
                        </button>
                    )
                })}
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {notification && 
                <div className={`fixed top-5 right-5 z-50 p-4 rounded-lg border text-white ${notification.type === 'success' ? 'bg-green-500/20 border-green-500' : 'bg-red-500/20 border-red-500'}`}>
                    {notification.message}
                </div>
            }
             {showDepositModal && <DepositModal onClose={() => setShowDepositModal(false)} showNotification={showNotification} />}
             {showWithdrawModal && <WithdrawModal onClose={() => setShowWithdrawModal(false)} showNotification={showNotification} />}

            {/* Wallet Overview */}
            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-gray-700 shadow-lg p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <p className="text-gray-400 text-sm">💰 Available Balance</p>
                    <p className="text-4xl font-bold text-green-400">₹{user.balance.toFixed(2)}</p>
                </div>
                <div className="flex space-x-4">
                    <button onClick={() => setShowDepositModal(true)} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105 shadow-lg shadow-green-500/20">
                        Deposit
                    </button>
                     <button onClick={() => setShowWithdrawModal(true)} className="bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105 shadow-lg shadow-orange-500/20" disabled={user.balance <= 0}>
                        Withdraw
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <TabButton label="Upcoming" icon={<ClockIcon className="h-5 w-5"/>} isActive={view === 'upcoming'} onClick={() => setView('upcoming')} />
                <TabButton label="Joined" icon={<TrophyIcon className="h-5 w-5"/>} isActive={view === 'joined'} onClick={() => setView('joined')} />
                <TabButton label="History" icon={<ClipboardDocumentListIcon className="h-5 w-5"/>} isActive={view === 'history'} onClick={() => setView('history')} />
                <TabButton label="Leaders" icon={<ChartBarIcon className="h-5 w-5"/>} isActive={view === 'leaderboard'} onClick={() => setView('leaderboard')} />
                <TabButton label="Support" icon={<ChatBubbleBottomCenterTextIcon className="h-5 w-5"/>} isLink href="https://t.me/+SXdLTvv6AyEwMmVl" />
            </div>

            {/* Content View */}
            <div className="space-y-6">
                {(view === 'upcoming' || view === 'joined') && <FilterBar />}
                <div key={view + activeFilter} className="animate-fade-in">
                    {view === 'upcoming' && renderMatches(displayedMatches)}
                    {view === 'joined' && renderMatches(displayedMatches)}
                    {view === 'history' && <History />}
                    {view === 'leaderboard' && <Leaderboard />}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;