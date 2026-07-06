
export interface Bet {
  slotId: number;
  amount: number;
  userId: string;
  userEmail?: string;
  isFake?: boolean;
}

export interface GameHistory {
  timestamp: number;
  winnerId: number;
  totalPool: number;
  userResult?: 'win' | 'loss' | 'none';
  userProfit?: number;
}

export interface AdminState {
  forceWinner: number | null; // null means random
  isPaused: boolean;
  isAutoWinLowest?: boolean;
  multiplier: number;
  timerDuration: number;
  upiId?: string;
  paymentLink?: string;
  updateInfo?: {
    version: string;
    message: string;
    forceUpdate: boolean;
    showPopup: boolean;
  };
  notifications?: {
    winMessageTemplate: string;
    betMessageTemplate: string;
    fakeBetMessageTemplate: string;
    enableWinNotifications: boolean;
    enableBetNotifications: boolean;
    enableInfoNotifications: boolean;
  };
  customImages?: { [slotId: number]: string };
  customNames?: { [slotId: number]: string };
  appLogoUrl?: string;
  upiPayeeName?: string;
}

export interface Dealer {
  id?: string;
  name: string;
  whatsapp: string;
  upiId?: string;
  qrUrl?: string;
  isActive: boolean;
}

export interface WithdrawalRequest {
  id?: string;
  userId: string;
  email: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  bankDetails: any;
  userBalanceBefore?: number;
  timestamp: number;
}

export interface DepositRequest {
  id?: string;
  userId: string;
  email: string;
  amount: number;
  method: string;
  transactionId?: string;
  screenshotUrl?: string;
  dealerId?: string;
  userBalanceBefore?: number;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
}

export interface Notification {
  id: string;
  message: string;
  type: 'win' | 'info' | 'bet';
}

export type GamePhase = 'betting' | 'locked' | 'result';

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  totalWinnings: number;
  highestWin: number;
  rank?: number;
}

export interface Game {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  minBet: number;
  maxBet: number;
  multiplier: number;
  timerDuration: number;
}
