import { User, Match, Admin, Boss, Role, GameMode, MatchStatus, WithdrawalRequest, WithdrawalStatus, WithdrawalMethod } from './types';

export const BOSS_CREDENTIALS: Boss = {
  id: 'boss-001',
  username: 'gopavardhan',
  password: 'gopa@123',
  role: Role.Boss,
};

export const INITIAL_ADMINS: Admin[] = [
  {
    id: 'admin-001',
    username: 'admin',
    password: 'admin',
    role: Role.Admin,
    createdMatchIds: ['match-1', 'match-2'],
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-001',
    username: 'PlayerOne',
    email: 'playerone@example.com',
    password: 'password123',
    role: Role.User,
    balance: 50,
    joinedMatchIds: ['match-1'],
    isBanned: false,
  },
  {
    id: 'user-002',
    username: 'NoobMaster69',
    email: 'noobmaster@example.com',
    password: 'password123',
    role: Role.User,
    balance: 10,
    joinedMatchIds: [],
    isBanned: false,
  },
];

export const INITIAL_MATCHES: Match[] = [
  {
    id: 'match-1',
    title: 'Morning Mayhem',
    gameMode: GameMode.BattleRoyale,
    subMode: 'Solo',
    entryFee: 10,
    totalSlots: 50,
    prizePool: 800,
    dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    map: 'Bermuda',
    status: MatchStatus.Upcoming,
    participants: [{ userId: 'user-001', team: [{ ffName: 'PlayerOne', ffUid: '12345678' }] }],
    createdBy: 'admin-001',
    perspective: 'TPP',
    rules: 'Standard battle royale rules apply. No emulators allowed.',
  },
  {
    id: 'match-2',
    title: 'Squad Showdown',
    gameMode: GameMode.BattleRoyale,
    subMode: 'Squad',
    entryFee: 25,
    totalSlots: 12,
    prizePool: 1000,
    dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
    map: 'Kalahari',
    status: MatchStatus.Upcoming,
    participants: [],
    createdBy: 'admin-001',
    perspective: 'TPP',
    rules: 'Standard battle royale rules apply. No teaming or cheating.',
  },
  {
    id: 'match-3',
    title: 'Duo Destruction',
    gameMode: GameMode.BattleRoyale,
    subMode: 'Duo',
    entryFee: 20,
    totalSlots: 25,
    prizePool: 1000,
    dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    map: 'Purgatory',
    status: MatchStatus.Upcoming,
    participants: [],
    createdBy: 'admin-001',
    perspective: 'FPP',
    rules: 'Follow all Free Fire fair play policies.',
  },
    {
    id: 'match-4',
    title: 'Past Glory',
    gameMode: GameMode.BattleRoyale,
    subMode: 'Solo',
    entryFee: 10,
    totalSlots: 50,
    prizePool: 400,
    dateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    map: 'Bermuda',
    status: MatchStatus.Completed,
    participants: [{ userId: 'user-001', team: [{ ffName: 'PlayerOne', ffUid: '12345678' }] }],
    winner: 'some-other-user-id',
    createdBy: 'admin-001',
    perspective: 'TPP',
    rules: 'This match is over.',
  },
];

export const INITIAL_WITHDRAWAL_REQUESTS: WithdrawalRequest[] = [
    {
        id: 'wr-1',
        userId: 'user-001',
        amount: 500,
        method: WithdrawalMethod.Upi,
        details: { upiId: 'playerone@bank' },
        status: WithdrawalStatus.Approved,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        adminRemark: 'UTR: 23423423'
    },
    {
        id: 'wr-2',
        userId: 'user-001',
        amount: 300,
        method: WithdrawalMethod.Bank,
        details: { accountHolder: 'Player One', accountNumber: '123456789', ifsc: 'BKID0001234', bankName: 'Bank of India' },
        status: WithdrawalStatus.Rejected,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        adminRemark: 'Wrong IFSC code provided.'
    },
    {
        id: 'wr-3',
        userId: 'user-002',
        amount: 20,
        method: WithdrawalMethod.Upi,
        details: { upiId: 'noobmaster69@bank' },
        status: WithdrawalStatus.Pending,
        date: new Date(),
    }
];