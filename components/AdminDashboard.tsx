import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Admin, Match, MatchStatus, GameMode, GameSubMode, User } from '../types';
import { PlusIcon, XMarkIcon, CalendarDaysIcon, CheckCircleIcon, EyeIcon, KeyIcon, TrophyIcon, UserIcon, UsersIcon, ShieldCheckIcon, MoonIcon, BoltIcon, BellIcon } from '@heroicons/react/24/solid';

const inputClass = "w-full bg-gray-900/70 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors duration-300 placeholder-gray-500";

// --- HELPER FUNCTIONS ---
const getAutoSlots = (mode?: GameMode, subMode?: GameSubMode): number => {
    if (!mode || !subMode) return 0;
    switch (mode) {
        case GameMode.BattleRoyale:
            if (subMode === 'Solo') return 50;
            if (subMode === 'Duo') return 25;
            if (subMode === 'Squad') return 12;
            break;
        case GameMode.ClashSquad: return 2; // 2 teams
        case GameMode.LoneWolf:
            if (subMode === '1v1') return 2; // 2 players
            if (subMode === '2v2') return 2; // 2 teams
            break;
    }
    return 0;
};

// --- MODALS AND PANELS ---

const MatchEditorModal: React.FC<{
    matchToEdit: Match | null;
    onClose: () => void;
    setToastMessage: (msg: string) => void;
}> = ({ matchToEdit, onClose, setToastMessage }) => {
    const { currentUser, setAppState } = useAppContext();
    const admin = currentUser as Admin;

    const [gameMode, setGameMode] = useState<GameMode | undefined>(matchToEdit?.gameMode);
    const [subMode, setSubMode] = useState<GameSubMode | undefined>(matchToEdit?.subMode);
    const [matchData, setMatchData] = useState({
        title: matchToEdit?.title || '',
        entryFee: matchToEdit?.entryFee || 0,
        prizePool: matchToEdit?.prizePool || 500,
        dateTime: matchToEdit ? new Date(matchToEdit.dateTime.getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : '',
        map: matchToEdit?.map || 'Bermuda',
        perspective: matchToEdit?.perspective || 'TPP',
        rules: matchToEdit?.rules || 'Standard rules apply. No cheating.',
    });
    
    const [showConfirm, setShowConfirm] = useState(false);
    const totalSlots = useMemo(() => getAutoSlots(gameMode, subMode), [gameMode, subMode]);

    const handleGameModeSelect = (mode: GameMode) => { setGameMode(mode); setSubMode(undefined); }
    const handleSubModeSelect = (sm: GameSubMode) => { setSubMode(sm); }
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setMatchData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    const handleInitiateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!gameMode || !subMode) { setToastMessage("Please select a game mode and sub-mode."); return; }
        setShowConfirm(true);
    };

    const handleConfirmAndSubmit = () => {
        const finalData = {
            ...matchData,
            gameMode, subMode, totalSlots,
            entryFee: Number(matchData.entryFee),
            prizePool: Number(matchData.prizePool),
            dateTime: new Date(matchData.dateTime),
        };

        if(matchToEdit) {
            setAppState(prev => ({ ...prev, matches: prev.matches.map(m => m.id === matchToEdit.id ? {...m, ...finalData} : m) }));
            setToastMessage(`Match updated successfully!`);
        } else {
            const newMatch: Match = { 
                id: `match-${Date.now()}`, ...finalData, status: MatchStatus.Upcoming, participants: [], createdBy: admin.id 
            };
            setAppState(prev => ({ ...prev, matches: [...prev.matches, newMatch] }));
            setToastMessage('Match created successfully! 🎉');
        }
        setShowConfirm(false);
        onClose();
    }
    
    const gameModeCards = [ { mode: GameMode.BattleRoyale, icon: <UserIcon className="h-8 w-8"/>, label: "Battle Royale" }, { mode: GameMode.ClashSquad, icon: <ShieldCheckIcon className="h-8 w-8"/>, label: "Clash Squad" }, { mode: GameMode.LoneWolf, icon: <MoonIcon className="h-8 w-8"/>, label: "Lone Wolf" } ];
    const subModeOptions: {[key in GameMode]?: {subMode: GameSubMode, label: string}[]} = { [GameMode.BattleRoyale]: [{subMode: 'Solo', label: 'Solo'}, {subMode: 'Duo', label: 'Duo'}, {subMode: 'Squad', label: 'Squad'}], [GameMode.ClashSquad]: [{subMode: '4v4', label: '4v4'}], [GameMode.LoneWolf]: [{subMode: '1v1', label: '1v1'}, {subMode: '2v2', label: '2v2'}] };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-40 p-4 sm:p-6 lg:p-8 overflow-y-auto animate-fade-in">
            {showConfirm && (
                 <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4 animate-fade-in">
                    <div className="bg-gray-800 border border-yellow-500/50 rounded-xl shadow-2xl shadow-yellow-500/20 w-full max-w-md">
                        <div className="p-4 border-b border-gray-700"><h2 className="text-xl font-bold text-yellow-400">Confirm Match</h2></div>
                        <div className="p-6 space-y-2 text-sm">
                             <p><strong className="text-gray-400 w-24 inline-block">Title:</strong> {matchData.title}</p>
                             <p><strong className="text-gray-400 w-24 inline-block">Mode:</strong> {gameMode} ({subMode})</p>
                             <p><strong className="text-gray-400 w-24 inline-block">Time:</strong> {new Date(matchData.dateTime).toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-gray-900/50 rounded-b-xl flex justify-end gap-4">
                            <button onClick={() => setShowConfirm(false)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                            <button onClick={handleConfirmAndSubmit} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg">Confirm</button>
                        </div>
                    </div>
                 </div>
            )}
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-white">{matchToEdit ? 'Edit Match' : 'Create New Match'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full bg-gray-700/50 hover:bg-gray-700 transition-colors"><XMarkIcon className="h-6 w-6"/></button>
                </div>
                <form onSubmit={handleInitiateSubmit} className="space-y-8">
                    <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {gameModeCards.map(card => ( <button type="button" key={card.mode} onClick={() => handleGameModeSelect(card.mode)} className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-center space-y-2 ${gameMode === card.mode ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/10' : 'border-gray-700 bg-gray-900/50 hover:bg-gray-800'}`}> {card.icon} <span className="font-bold text-lg">{card.label}</span> </button> ))}
                        </div>
                        {gameMode && subModeOptions[gameMode] && ( <div className="mt-6 animate-fade-in"> <h3 className="text-lg font-bold text-gray-300 mb-3">Sub-Mode</h3> <div className="flex flex-wrap gap-3"> {subModeOptions[gameMode]?.map(opt => ( <button type="button" key={opt.subMode} onClick={() => handleSubModeSelect(opt.subMode)} className={`px-4 py-2 rounded-lg font-bold transition ${subMode === opt.subMode ? 'bg-cyan-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'}`}>{opt.label}</button>))} </div> </div> )}
                    </div>
                    {gameMode && subMode && (
                        <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-xl p-6 animate-fade-in space-y-4">
                             <input name="title" value={matchData.title} onChange={handleChange} placeholder="Match Title" required className={inputClass} />
                             <input type="datetime-local" name="dateTime" value={matchData.dateTime} onChange={handleChange} required className={inputClass} />
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" readOnly value={`${totalSlots} ${subMode === 'Duo' || subMode === 'Squad' || subMode === '2v2' || subMode === '4v4' ? 'Teams' : 'Players'}`} className={inputClass + " bg-gray-900/80 cursor-default"} title="Slots are set automatically"/>
                                <select name="map" value={matchData.map} onChange={handleChange} className={inputClass}><option>Bermuda</option><option>Kalahari</option><option>Purgatory</option></select>
                                <input type="number" name="entryFee" value={matchData.entryFee} onChange={handleChange} placeholder="Entry Fee (₹)" className={inputClass} />
                                <input type="number" name="prizePool" value={matchData.prizePool} onChange={handleChange} placeholder="Prize Pool (₹)" className={inputClass} />
                             </div>
                             <textarea name="rules" value={matchData.rules} onChange={handleChange} rows={3} placeholder="Match Rules..." className={inputClass}></textarea>
                        </div>
                    )}
                    <div className="flex justify-end pt-4"><button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold py-3 px-8 rounded-lg transition" disabled={!gameMode || !subMode}>Submit</button></div>
                </form>
            </div>
        </div>
    )
}

const ManageMatchModal: React.FC<{
    match: Match;
    onClose: () => void;
    setToastMessage: (msg: string) => void;
}> = ({ match: initialMatch, onClose, setToastMessage }) => {
    const { users, matches, setAppState } = useAppContext();
    const [activeTab, setActiveTab] = useState<'overview' | 'room' | 'results'>('overview');
    
    // Use the latest version of the match from context
    const match = useMemo(() => matches.find(m => m.id === initialMatch.id) || initialMatch, [matches, initialMatch]);

    // States for sub-components
    const [roomDetails, setRoomDetails] = useState({ id: match.roomDetails?.id || '', pass: match.roomDetails?.pass || '' });
    const [winnerId, setWinnerId] = useState(match.winner || '');
    const [performanceData, setPerformanceData] = useState<{[key:string]: {rank: string, kills: string}}>({});

    useEffect(() => {
        setRoomDetails({ id: match.roomDetails?.id || '', pass: match.roomDetails?.pass || '' });
    }, [match.roomDetails]);

    useEffect(() => {
        const initialPerfData: {[key:string]: {rank: string, kills: string}} = {};
        match.participants.forEach(p => {
            initialPerfData[p.userId] = { rank: p.performance?.rank?.toString() || '', kills: p.performance?.kills?.toString() || '' }
        });
        setPerformanceData(initialPerfData);
    }, [match.participants]);

    const handleSaveRoomDetails = () => {
        const finalRoomDetails = (roomDetails.id && roomDetails.pass) ? roomDetails : undefined;
        setAppState(prev => ({...prev, matches: prev.matches.map(m => m.id === match.id ? {...m, roomDetails: finalRoomDetails} : m) }));
        setToastMessage("Room details updated!");
    };

    const handleSaveResults = () => {
        const finalParticipants = match.participants.map(p => ({
            ...p,
            performance: { rank: parseInt(performanceData[p.userId]?.rank, 10) || 0, kills: parseInt(performanceData[p.userId]?.kills, 10) || 0 }
        }));
        setAppState(prev => ({...prev, matches: prev.matches.map(m => m.id === match.id ? { ...m, winner: winnerId, participants: finalParticipants, status: MatchStatus.Completed } : m) }));
        setToastMessage("Match results have been posted!");
        onClose();
    };
    
    const participantUsers = useMemo(() => match.participants.map(p => ({
        ...p, username: users.find(u => u.id === p.userId)?.username || 'Unknown', teamName: p.team[0]?.ffName || 'N/A'
    })), [match.participants, users]);

    const tabs = [ {id: 'overview', label: 'Overview', icon: <EyeIcon className="h-5 w-5"/>}, {id: 'room', label: 'Room Control', icon: <KeyIcon className="h-5 w-5"/>}, {id: 'results', label: 'Post Results', icon: <TrophyIcon className="h-5 w-5"/>} ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-white">{match.title}</h2>
                        <p className="text-sm text-cyan-400">{match.gameMode} ({match.subMode})</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full bg-gray-700/50 hover:bg-gray-700"><XMarkIcon className="h-6 w-6"/></button>
                </div>
                <div className="flex border-b border-gray-700 flex-shrink-0">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 p-3 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === tab.id ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:bg-gray-700/50'}`}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
                <div className="p-6 overflow-y-auto flex-grow">
                    {activeTab === 'overview' && (
                        <div className="space-y-3">
                            {participantUsers.length > 0 ? participantUsers.map((p, index) => (
                                <div key={p.userId} className="bg-gray-900/70 p-3 rounded-lg"><h3 className="font-bold text-cyan-400">Slot #{index + 1}: {p.username}</h3>
                                {p.team.map((player, i) => <p key={i} className="text-sm text-gray-300 pl-4">{player.ffName} (UID: {player.ffUid})</p>)}</div>
                            )) : <p className="text-gray-400 text-center py-8">No players have joined yet.</p>}
                        </div>
                    )}
                    {activeTab === 'room' && (
                        <div className="space-y-4">
                            <input type="text" value={roomDetails.id} onChange={e => setRoomDetails(p=>({...p, id: e.target.value}))} placeholder="Room ID" className={inputClass}/>
                            <input type="text" value={roomDetails.pass} onChange={e => setRoomDetails(p=>({...p, pass: e.target.value}))} placeholder="Room Password" className={inputClass}/>
                            <button onClick={handleSaveRoomDetails} className="bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold py-2 px-4 rounded-lg w-full">Save Room Details</button>
                        </div>
                    )}
                    {activeTab === 'results' && (
                        <div className="space-y-4">
                            <div><label className="block text-sm font-medium text-gray-300 mb-1">Select Winner</label>
                            <select value={winnerId} onChange={e => setWinnerId(e.target.value)} className={inputClass}><option value="">-- Select Winner --</option>{participantUsers.map(p=><option key={p.userId} value={p.userId}>{p.teamName} ({p.username})</option>)}</select></div>
                            <div className="space-y-2"><h4 className="font-bold text-gray-300">Performance</h4>
                            {participantUsers.map(p=>(<div key={p.userId} className="grid grid-cols-3 gap-2 items-center"><span className="truncate">{p.teamName}</span><input type="number" placeholder="Rank" value={performanceData[p.userId]?.rank||''} onChange={e=>setPerformanceData(pr=>({...pr,[p.userId]:{...pr[p.userId],rank:e.target.value}}))} className={inputClass}/><input type="number" placeholder="Kills" value={performanceData[p.userId]?.kills||''} onChange={e=>setPerformanceData(pr=>({...pr,[p.userId]:{...pr[p.userId],kills:e.target.value}}))} className={inputClass}/></div>))}</div>
                            <button onClick={handleSaveResults} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg w-full">Save & Mark Completed</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AdminMatchCard: React.FC<{ match: Match; onManage: (match: Match) => void; }> = ({ match, onManage }) => {
    const progress = Math.round((match.participants.length / match.totalSlots) * 100);
    const getSubModeIcon = (subMode: GameSubMode) => {
        switch(subMode) {
            case 'Solo': case '1v1': return <UserIcon className="h-4 w-4"/>
            case 'Duo': case '2v2': return <UsersIcon className="h-4 w-4"/>
            case 'Squad': case '4v4': return <ShieldCheckIcon className="h-4 w-4"/>
        }
    }
    return (
        <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-600 transition-all duration-300 transform hover:-translate-y-1 flex flex-col">
            <div className="p-4 flex-grow">
                <h3 className="font-bold text-white truncate">{match.title}</h3>
                <p className="text-cyan-400 text-xs flex items-center gap-1.5">{getSubModeIcon(match.subMode)} {match.gameMode} / {match.subMode}</p>
                <p className="text-gray-400 text-xs mt-2">{new Date(match.dateTime).toLocaleString()}</p>
                <div className="mt-3">
                    <div className="flex justify-between items-center text-xs text-gray-300 mb-1">
                        <span>Slots Filled</span><span>{match.participants.length} / {match.totalSlots}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5"><div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full transition-all duration-500" style={{width: `${progress}%`}}></div></div>
                </div>
            </div>
            <div className="bg-gray-900/50 p-2"><button onClick={() => onManage(match)} className="w-full text-center text-sm font-bold bg-gray-700/50 hover:bg-gray-700 rounded-md py-1.5 transition-colors">Manage Match</button></div>
        </div>
    );
};

const CreateMatchFAB: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button onClick={onClick} className="fixed bottom-8 right-8 bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-4 rounded-full shadow-lg shadow-cyan-500/30 hover:scale-110 transition-transform duration-300 z-30">
        <PlusIcon className="h-8 w-8" />
    </button>
);

// --- MAIN DASHBOARD ---
const AdminDashboard: React.FC = () => {
    const { currentUser, matches } = useAppContext();
    const admin = currentUser as Admin;
    
    const [activeTab, setActiveTab] = useState<'ongoing' | 'upcoming' | 'finished'>('upcoming');
    const [managingMatch, setManagingMatch] = useState<Match | null>(null);
    const [isCreatingMatch, setIsCreatingMatch] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    
    useEffect(() => {
        if(toastMessage) { const timer = setTimeout(() => setToastMessage(''), 3000); return () => clearTimeout(timer); }
    }, [toastMessage]);

    const adminMatches = useMemo(() => matches.filter(m => m.createdBy === admin.id).sort((a,b) => a.dateTime.getTime() - b.dateTime.getTime()), [matches, admin.id]);

    const { upcomingMatches, ongoingMatches, finishedMatches } = useMemo(() => {
        const now = new Date();
        return {
            upcomingMatches: adminMatches.filter(m => m.status === MatchStatus.Upcoming && m.dateTime > now),
            ongoingMatches: adminMatches.filter(m => m.status === MatchStatus.Live || (m.status === MatchStatus.Upcoming && m.dateTime <= now)),
            finishedMatches: adminMatches.filter(m => m.status === MatchStatus.Completed).sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime()),
        }
    }, [adminMatches]);

    const renderMatches = (matchList: Match[]) => {
        if (matchList.length === 0) return <div className="text-center text-gray-400 py-16 bg-gray-800/30 rounded-lg">No matches in this category.</div>
        return <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">{matchList.map(match => <AdminMatchCard key={match.id} match={match} onManage={setManagingMatch} />)}</div>
    };
    
    const TabButton: React.FC<{label: string, count: number, value: typeof activeTab, onClick: () => void}> = ({label, count, value, onClick}) => (
        <button onClick={onClick} className={`px-4 py-2 font-bold rounded-md transition-colors text-sm sm:text-base ${activeTab === value ? 'bg-cyan-500 text-gray-900' : 'text-gray-300 hover:bg-gray-700/50'}`}>
            {label} <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeTab === value ? 'bg-gray-800/20' : 'bg-gray-700'}`}>{count}</span>
        </button>
    );

    return (
        <div className="space-y-6">
            {toastMessage && (<div className="fixed bottom-24 right-8 z-50 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg animate-fade-in-up">{toastMessage}</div>)}
            {isCreatingMatch && <MatchEditorModal matchToEdit={null} onClose={() => setIsCreatingMatch(false)} setToastMessage={setToastMessage} />}
            {managingMatch && <ManageMatchModal match={managingMatch} onClose={() => setManagingMatch(null)} setToastMessage={setToastMessage} />}
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                 <h2 className="text-3xl font-bold text-white">Admin Dashboard</h2>
                 <div className="flex items-center gap-4 p-2 rounded-full bg-gray-800/50">
                    <p className="text-sm font-bold text-cyan-400 pl-2">{admin.username}</p>
                    <button className="relative text-gray-400 hover:text-white">
                        <BellIcon className="h-6 w-6"/>
                        <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>
                    </button>
                 </div>
            </div>
            
            <div className="bg-gray-800/60 backdrop-blur-sm p-2 rounded-lg border border-gray-700 flex justify-center sm:justify-start space-x-2">
                <TabButton label="Upcoming" count={upcomingMatches.length} value="upcoming" onClick={() => setActiveTab('upcoming')} />
                <TabButton label="Ongoing" count={ongoingMatches.length} value="ongoing" onClick={() => setActiveTab('ongoing')} />
                <TabButton label="Finished" count={finishedMatches.length} value="finished" onClick={() => setActiveTab('finished')} />
            </div>

            <div>
                {activeTab === 'upcoming' && renderMatches(upcomingMatches)}
                {activeTab === 'ongoing' && renderMatches(ongoingMatches)}
                {activeTab === 'finished' && renderMatches(finishedMatches)}
            </div>

            <CreateMatchFAB onClick={() => setIsCreatingMatch(true)} />
        </div>
    );
};

export default AdminDashboard;