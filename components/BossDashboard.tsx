import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Admin, Role, Match, User, WithdrawalRequest, WithdrawalStatus, BankDetails, Transaction } from '../types';
import { XMarkIcon, UserPlusIcon, NoSymbolIcon, CheckCircleIcon, CurrencyDollarIcon, UsersIcon, ShieldCheckIcon, SignalIcon, Cog6ToothIcon, BellIcon, UserCircleIcon, BanknotesIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';

const inputClass = "w-full bg-gray-800/70 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition placeholder-gray-400";

// --- Sub Components for Boss Dashboard ---

const AnimatedStatCard: React.FC<{ title: string; value: number; prefix?: string; icon: React.ReactNode }> = ({ title, value, prefix = '', icon }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const step = value / 50;
        if (value > 0) {
            const interval = setInterval(() => {
                setDisplayValue(prev => {
                    const nextVal = prev + step;
                    if (nextVal >= value) {
                        clearInterval(interval);
                        return value;
                    }
                    return nextVal;
                });
            }, 20);
            return () => clearInterval(interval);
        }
    }, [value]);

    return (
        <div className="glass-card p-4 rounded-xl border-purple-500/30">
            <div className="flex items-center text-gray-400">
                {icon}
                <h3 className="ml-2 text-sm font-semibold uppercase tracking-wider">{title}</h3>
            </div>
            <p className="text-3xl font-bold mt-2 text-white">{prefix}{Math.floor(displayValue).toLocaleString()}</p>
        </div>
    );
};

const ChartPlaceholder: React.FC<{title: string}> = ({title}) => (
    <div className="glass-card p-4 rounded-xl border-purple-500/30 col-span-1 md:col-span-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">{title}</h3>
        <div className="mt-4 h-48 flex items-end justify-between px-2">
            {[...Array(7)].map((_, i) => (
                 <div key={i} className="w-8 bg-gradient-to-t from-purple-600/50 to-purple-600/10 rounded-t-md animate-pulse" style={{ height: `${Math.random() * 80 + 20}%`, animationDelay: `${i * 100}ms` }}></div>
            ))}
        </div>
    </div>
);


const ManageBalanceModal: React.FC<{
    user: User;
    onClose: () => void;
    showToast: (msg: string) => void;
}> = ({ user, onClose, showToast }) => {
    const { setAppState } = useAppContext();
    const [amount, setAmount] = useState('');
    const [action, setAction] = useState<'add' | 'remove'>('add');

    const handleBalanceUpdate = () => {
        const adjustmentAmount = parseFloat(amount);
        if (isNaN(adjustmentAmount) || adjustmentAmount <= 0) {
            showToast("Please enter a valid positive amount.");
            return;
        }

        if (action === 'remove' && adjustmentAmount > user.balance) {
            showToast("Cannot remove more than the user's balance.");
            return;
        }

        const newTransaction: Transaction = {
            id: `txn-manual-${Date.now()}`,
            userId: user.id,
            amount: adjustmentAmount,
            type: action === 'add' ? 'manual_add' : 'manual_remove',
            date: new Date(),
            status: 'success',
        };

        setAppState(prev => {
            const updatedUsers = prev.users.map(u => {
                if (u.id === user.id) {
                    const newBalance = action === 'add' ? u.balance + adjustmentAmount : u.balance - adjustmentAmount;
                    return { ...u, balance: newBalance };
                }
                return u;
            });
            return {
                ...prev,
                users: updatedUsers,
                transactions: [...prev.transactions, newTransaction]
            }
        });

        showToast(`Balance updated successfully for ${user.username}.`);
        onClose();
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="glass-card border-purple-500/50 rounded-xl shadow-2xl shadow-purple-500/20 w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <div>
                        <h2 className="text-2xl font-bold text-purple-400">Manage Balance</h2>
                        <p className="text-gray-300">For: {user.username} (Current: ₹{user.balance.toFixed(2)})</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="h-6 w-6" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-900/50 rounded-lg">
                        <button onClick={() => setAction('add')} className={`py-2 rounded-md font-bold transition-colors ${action === 'add' ? 'bg-green-500 text-white' : 'hover:bg-gray-700'}`}>Add Funds</button>
                        <button onClick={() => setAction('remove')} className={`py-2 rounded-md font-bold transition-colors ${action === 'remove' ? 'bg-red-500 text-white' : 'hover:bg-gray-700'}`}>Remove Funds</button>
                    </div>
                    <input 
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Amount"
                        className={inputClass}
                    />
                    <button onClick={handleBalanceUpdate} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105">
                        Confirm {action === 'add' ? 'Addition' : 'Removal'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AddAdminModal: React.FC<{onClose: () => void, showToast: (msg: string) => void}> = ({onClose, showToast}) => {
    const { setAppState } = useAppContext();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleCreateAdmin = (e: React.FormEvent) => {
        e.preventDefault();
        const newAdmin: Admin = {
            id: `admin-${Date.now()}`,
            username: username,
            password: password,
            role: Role.Admin,
            createdMatchIds: [],
        };
        setAppState(prev => ({ ...prev, admins: [...prev.admins, newAdmin] }));
        showToast("Admin created successfully!");
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fade-in">
            <form onSubmit={handleCreateAdmin} className="glass-card border-purple-500/50 rounded-xl shadow-2xl shadow-purple-500/20 w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-purple-400">Create New Admin</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="h-6 w-6" /></button>
                </div>
                <div className="p-6 space-y-4">
                     <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required className={inputClass} />
                     <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className={inputClass} />
                     <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg">Create Admin</button>
                </div>
            </form>
        </div>
    )
}

const BossDashboard: React.FC = () => {
    const { admins, matches, users, transactions, setAppState, logout } = useAppContext();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [toast, setToast] = useState('');
    const [managingUser, setManagingUser] = useState<User | null>(null);
    const [showAddAdmin, setShowAddAdmin] = useState(false);
    
    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const stats = useMemo(() => {
        const totalRevenue = transactions.filter(t => t.type === 'recharge' || t.type === 'entry_fee').reduce((acc, t) => acc + (t.type === 'recharge' ? t.amount : 0), 0);
        const upcomingMatches = matches.filter(m => m.status === 'Upcoming').length;
        const liveMatches = matches.filter(m => m.status === 'Live').length;
        const completedMatches = matches.filter(m => m.status === 'Completed').length;
        return { totalRevenue, totalUsers: users.length, totalAdmins: admins.length, upcomingMatches, liveMatches, completedMatches, totalMatches: matches.length };
    }, [matches, users, admins, transactions]);

     const handleDeleteAdmin = (adminId: string) => {
        if (window.confirm('Are you sure you want to delete this admin? This action cannot be undone.')) {
            setAppState(prev => ({...prev, admins: prev.admins.filter(a => a.id !== adminId) }));
            showToast("Admin deleted.");
        }
    };

    const handleToggleBan = (userId: string) => {
        setAppState(prev => ({
            ...prev,
            users: prev.users.map(u => u.id === userId ? { ...u, isBanned: !u.isBanned } : u)
        }));
    };
    
    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: <SignalIcon className="h-5 w-5 mr-2"/> },
        { id: 'users', label: 'Users', icon: <UsersIcon className="h-5 w-5 mr-2"/> },
        { id: 'admins', label: 'Admins', icon: <ShieldCheckIcon className="h-5 w-5 mr-2"/> },
        { id: 'matches', label: 'Matches', icon: <BanknotesIcon className="h-5 w-5 mr-2"/> },
        { id: 'settings', label: 'Settings', icon: <Cog6ToothIcon className="h-5 w-5 mr-2"/> },
    ];
    
    const renderContent = () => {
        switch(activeTab) {
            case 'dashboard':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <AnimatedStatCard title="Total Revenue" value={stats.totalRevenue} prefix="₹" icon={<CurrencyDollarIcon className="h-5 w-5" />} />
                        <AnimatedStatCard title="Total Users" value={stats.totalUsers} icon={<UsersIcon className="h-5 w-5" />} />
                        <AnimatedStatCard title="Total Admins" value={stats.totalAdmins} icon={<ShieldCheckIcon className="h-5 w-5" />} />
                        <AnimatedStatCard title="Total Matches" value={stats.totalMatches} icon={<BanknotesIcon className="h-5 w-5" />} />
                        <ChartPlaceholder title="User Signups" />
                        <ChartPlaceholder title="Match Revenue" />
                    </div>
                );
            case 'users':
                return (
                     <div className="glass-card p-4 rounded-xl border-purple-500/30">
                        <h3 className="text-xl font-bold mb-4">User Management</h3>
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                            {users.map(user => (
                                <div key={user.id} className={`bg-gray-900/70 p-3 rounded-lg flex justify-between items-center ${user.isBanned ? 'opacity-50' : ''}`}>
                                     <div>
                                        <p className="font-bold">{user.username}</p>
                                        <p className="text-sm text-gray-400">Balance: ₹{user.balance.toFixed(2)}</p>
                                     </div>
                                     {user.isBanned && <span className="text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/50 px-2 py-0.5 rounded-full">BANNED</span>}
                                     <div className="flex gap-2">
                                        <button onClick={() => setManagingUser(user)} className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-1 px-3 rounded-lg text-sm">Balance</button>
                                        <button onClick={() => handleToggleBan(user.id)} className={`${user.isBanned ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white font-bold py-1 px-3 rounded-lg text-sm`}>
                                            {user.isBanned ? 'Unban' : 'Ban'}
                                        </button>
                                     </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'admins':
                return (
                    <div className="glass-card p-4 rounded-xl border-purple-500/30">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Admin Management</h3>
                            <button onClick={() => setShowAddAdmin(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 text-sm"><UserPlusIcon className="h-5 w-5"/>Add Admin</button>
                        </div>
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                             {admins.map(admin => (
                                <div key={admin.id} className="bg-gray-900/70 p-3 rounded-lg flex justify-between items-center">
                                    <div><p className="font-bold">{admin.username}</p><p className="text-sm text-gray-400">Matches: {admin.createdMatchIds.length}</p></div>
                                    <button onClick={() => handleDeleteAdmin(admin.id)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg text-sm">Delete</button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'matches':
                 return (
                    <div className="glass-card p-4 rounded-xl border-purple-500/30">
                         <h3 className="text-xl font-bold mb-4">All Matches</h3>
                         <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-2">
                         {matches.map(match => (
                            <div key={match.id} className="bg-gray-900/70 p-3 rounded-lg">
                               <p className="font-bold">{match.title}</p>
                               <p className="text-sm text-gray-400">Admin: {admins.find(a => a.id === match.createdBy)?.username || 'N/A'} | Status: {match.status}</p>
                            </div>
                         ))}
                         </div>
                    </div>
                );
             case 'settings':
                return <div className="text-center text-gray-400 py-20 glass-card rounded-xl border-purple-500/30">Settings coming soon.</div>;
        }
    }

    return (
        <div className="min-h-screen text-white">
            <div className="circuit-bg"></div>
            <div className="relative z-10">
                 {toast && <div className="fixed top-5 right-5 z-50 p-4 rounded-lg border text-white bg-green-500/20 border-green-500">{toast}</div>}
                 {managingUser && <ManageBalanceModal user={managingUser} onClose={() => setManagingUser(null)} showToast={showToast} />}
                 {showAddAdmin && <AddAdminModal onClose={() => setShowAddAdmin(false)} showToast={showToast} />}

                 <header className="p-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">COMMAND CENTER</h1>
                     <div className="flex items-center gap-4 group">
                        <span className="font-bold text-purple-400">BOSS</span>
                        <div className="relative">
                            <UserCircleIcon className="h-10 w-10 text-gray-400 group-hover:text-white transition-colors" />
                             <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg border border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                                <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 flex items-center gap-2"><ArrowRightOnRectangleIcon className="h-5 w-5" /> Logout</button>
                            </div>
                        </div>
                     </div>
                 </header>

                 <main className="p-4">
                    <div className="flex flex-col md:flex-row gap-6">
                        <nav className="flex-shrink-0 md:w-56">
                            <div className="space-y-2">
                                {tabs.map(tab => (
                                    <button 
                                        key={tab.id} 
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center p-3 rounded-lg font-bold transition-all duration-200 ${activeTab === tab.id ? 'bg-purple-600/30 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'}`}
                                    >
                                        {tab.icon} {tab.label}
                                    </button>
                                ))}
                            </div>
                        </nav>
                        <div className="flex-grow w-full">
                            <div className="animate-fade-in-up">
                                {renderContent()}
                            </div>
                        </div>
                    </div>
                 </main>
            </div>
        </div>
    );
};

export default BossDashboard;