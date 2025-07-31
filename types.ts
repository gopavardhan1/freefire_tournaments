import React from 'react';

export enum Role {
  User = 'User',
  Admin = 'Admin',
  Boss = 'Boss',
}

export interface BaseUser {
  id: string;
  username: string;
  password?: string;
  role: Role;
}

export interface User extends BaseUser {
  role: Role.User;
  email: string;
  balance: number;
  joinedMatchIds: string[];
  isBanned: boolean;
}

export interface Admin extends BaseUser {
  role: Role.Admin;
  createdMatchIds: string[];
}

export interface Boss extends BaseUser {
  role: Role.Boss;
}

export type CurrentUser = User | Admin | Boss | null;

export enum GameMode {
  BattleRoyale = 'Battle Royale',
  ClashSquad = 'Clash Squad',
  LoneWolf = 'Lone Wolf',
}

export type GameSubMode = 'Solo' | 'Duo' | 'Squad' | '4v4' | '1v1' | '2v2';


export enum MatchStatus {
  Upcoming = 'Upcoming',
  Live = 'Live',
  Completed = 'Completed',
}

export interface PlayerDetails {
  ffName: string;
  ffUid: string;
}

export interface Participant {
  userId: string;
  team: PlayerDetails[];
  performance?: {
    rank: number;
    kills: number;
  };
}

export interface Match {
  id: string;
  title: string;
  gameMode: GameMode;
  subMode: GameSubMode;
  entryFee: number;
  totalSlots: number;
  prizePool: number;
  dateTime: Date;
  map: string;
  status: MatchStatus;
  participants: Participant[];
  roomDetails?: {
    id: string;
    pass: string;
  };
  winner?: string; // user ID of the winning team's leader
  createdBy: string; // admin ID
  perspective?: 'TPP' | 'FPP';
  rules?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'recharge' | 'entry_fee' | 'manual_add' | 'manual_remove';
  date: Date;
  status: 'success' | 'failed';
}

export enum WithdrawalStatus {
    Pending = 'Pending',
    Approved = 'Approved',
    Rejected = 'Rejected'
}

export enum WithdrawalMethod {
    Upi = 'UPI',
    Bank = 'Bank Transfer'
}

export interface UpiDetails {
    upiId: string;
}

export interface BankDetails {
    accountHolder: string;
    accountNumber: string;
    ifsc: string;
    bankName: string;
}

export interface WithdrawalRequest {
    id:string;
    userId: string;
    amount: number;
    method: WithdrawalMethod;
    details: UpiDetails | BankDetails;
    status: WithdrawalStatus;
    date: Date;
    adminRemark?: string; // UTR for approved, reason for rejected
}


export interface AppState {
  currentUser: CurrentUser;
  users: User[];
  matches: Match[];
  admins: Admin[];
  transactions: Transaction[];
  withdrawalRequests: WithdrawalRequest[];
  selectedMatchId: string | null;
  joiningMatchId: string | null;
}

export type LoginResult = 'success' | 'banned' | 'not_found';

export interface AppContextType extends AppState {
  login: (username: string, password: string) => LoginResult;
  register: (newUser: Omit<User, 'id' | 'balance' | 'joinedMatchIds' | 'role' | 'isBanned'>) => User | null;
  logout: () => void;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  setSelectedMatchId: (id: string | null) => void;
  setJoiningMatchId: (id: string | null) => void;
}