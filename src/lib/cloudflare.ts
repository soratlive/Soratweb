/**
 * Cloudflare Worker API Service - Pure Client-side Mock Implementation
 * 
 * Modified to bypass any live HTTP requests to avoid high traffic/quota limits.
 */

// Generic fetch wrapper mock
export async function workerFetch(endpoint: string, method: string = 'GET', body?: any) {
  console.log(`[Cloudflare Worker D1 Mock] Blocked ${method} request to ${endpoint}`);
  return null;
}

// Dedicated API service methods
export const cloudflareAPI = {
  // --- Game Rounds ---
  getGameRounds: async (): Promise<any[]> => [],
  createGameRound: async (roundData: any): Promise<any> => ({ id: 'mock-round' }),
  updateGameRound: async (roundId: string, roundData: any): Promise<any> => ({ id: roundId }),

  // --- User Balances & Profiles ---
  getUsers: async (): Promise<any[]> => [],
  createUser: async (userData: any): Promise<any> => ({ id: 'mock-user' }),
  googleSignIn: async (idToken: string): Promise<any> => null,
  updateUser: async (userId: string, userData: any): Promise<any> => ({ id: userId }),
  deleteUser: async (userId: string): Promise<any> => ({ id: userId }),

  // --- Deposits ---
  getDeposits: async (): Promise<any[]> => [],
  createDeposit: async (depositData: any): Promise<any> => ({ id: 'mock-deposit' }),
  updateDepositStatus: async (depositId: string, status: string, payload?: any): Promise<any> => ({ id: depositId }),

  // --- Withdrawals ---
  getWithdrawals: async (): Promise<any[]> => [],
  createWithdrawal: async (withdrawalData: any): Promise<any> => ({ id: 'mock-withdrawal' }),
  updateWithdrawalStatus: async (withdrawalId: string, status: string, payload?: any): Promise<any> => ({ id: withdrawalId }),

  // --- Dealers ---
  getDealers: async (): Promise<any[]> => [],
  createDealer: async (dealerData: any): Promise<any> => ({ id: 'mock-dealer' }),
  updateDealer: async (dealerId: string, dealerData: any): Promise<any> => ({ id: dealerId }),
  deleteDealer: async (dealerId: string): Promise<any> => ({ id: dealerId }),

  // --- Settings & Branding ---
  getSettings: async (): Promise<any> => null,
  updateSettings: async (settingsData: any): Promise<any> => null,

  // --- Bets & Logs ---
  getBets: async (): Promise<any[]> => [],
  placeBet: async (betData: any): Promise<any> => ({ id: 'mock-bet' }),

  // --- Payment Proofs ---
  getPaymentProofs: async (): Promise<any[]> => [],
  createPaymentProof: async (proofData: any): Promise<any> => ({ id: 'mock-proof' }),
  updatePaymentProofStatus: async (proofId: string, status: string): Promise<any> => ({ id: proofId })
};
