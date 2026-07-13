/**
 * Cloudflare Worker API Service - Real Client-side Integration
 * 
 * Communicates with the live Cloudflare Worker and coordinates
 * user data synchronization with Appwrite and Cloudflare D1.
 */

import { account } from './appwrite';

const WORKER_URL = (import.meta as any).env?.VITE_CLOUDFLARE_WORKER_URL || 'https://sorat-cloudflare-worker.nikhilrv8055.workers.dev';

/**
 * Automatically creates and retrieves a short-lived Appwrite JWT
 * for the logged-in admin or user, validating their active session.
 */
async function getAuthHeader(): Promise<string> {
  try {
    const sessionJwt = await account.createJWT();
    if (sessionJwt && sessionJwt.jwt) {
      return `Bearer ${sessionJwt.jwt}`;
    }
  } catch (err) {
    console.warn('[Cloudflare API Auth] No active session or JWT generation failed:', err);
  }
  return '';
}

/**
 * Generic fetch wrapper for live HTTP requests to the Cloudflare Worker
 */
export async function workerFetch(endpoint: string, method: string = 'GET', body?: any) {
  const cleanBase = WORKER_URL.replace(/\/$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${cleanBase}${cleanEndpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const auth = await getAuthHeader();
  if (auth) {
    headers['Authorization'] = auth;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    console.log(`[Cloudflare API] Fetching ${method} ${url}...`);
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      let parsedError;
      try {
        parsedError = JSON.parse(errorText);
      } catch {
        parsedError = { error: errorText };
      }
      throw new Error(parsedError.error || parsedError.message || `HTTP Error ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error(`[Cloudflare API Error] Request failed on ${method} ${endpoint}:`, error.message || error);
    throw error;
  }
}

// Dedicated API service methods
export const cloudflareAPI = {
  // --- Game Rounds ---
  getGameRounds: async (): Promise<any[]> => {
    try {
      return await workerFetch('/api/game-rounds', 'GET');
    } catch {
      return [];
    }
  },
  createGameRound: async (roundData: any): Promise<any> => {
    return await workerFetch('/api/game-rounds', 'POST', roundData);
  },
  updateGameRound: async (roundId: string, roundData: any): Promise<any> => {
    return await workerFetch(`/api/game-rounds/${roundId}`, 'PUT', roundData);
  },

  // --- User Balances & Profiles ---
  getUsers: async (): Promise<any[]> => {
    try {
      return await workerFetch('/api/users', 'GET');
    } catch {
      return [];
    }
  },
  createUser: async (userData: any): Promise<any> => {
    return await workerFetch('/api/users', 'POST', userData);
  },
  googleSignIn: async (idToken: string): Promise<any> => {
    return await workerFetch('/api/auth/google', 'POST', { id_token: idToken });
  },
  updateUser: async (userId: string, userData: any): Promise<any> => {
    // Intercept balance modifications and route to the new synchronized endpoint
    if (userData.balanceAdjustment !== undefined) {
      const amount = userData.balanceAdjustment;
      return await workerFetch('/api/admin/update-balance', 'POST', {
        userId,
        amount: Math.abs(amount),
        action: amount >= 0 ? 'add' : 'remove'
      });
    }

    if (userData.balance !== undefined) {
      return await workerFetch('/api/admin/update-balance', 'POST', {
        userId,
        amount: userData.balance,
        action: 'set'
      });
    }

    // Default: Route metadata/role updates to PUT endpoint
    return await workerFetch(`/api/users/${userId}`, 'PUT', userData);
  },
  deleteUser: async (userId: string): Promise<any> => {
    return await workerFetch(`/api/users/${userId}`, 'DELETE');
  },

  // --- Deposits ---
  getDeposits: async (): Promise<any[]> => {
    try {
      return await workerFetch('/api/deposits', 'GET');
    } catch {
      return [];
    }
  },
  createDeposit: async (depositData: any): Promise<any> => {
    return await workerFetch('/api/deposits', 'POST', depositData);
  },
  updateDepositStatus: async (depositId: string, status: string, payload?: any): Promise<any> => {
    return await workerFetch(`/api/deposits/${depositId}`, 'PUT', { status, ...payload });
  },

  // --- Withdrawals ---
  getWithdrawals: async (): Promise<any[]> => {
    try {
      return await workerFetch('/api/withdrawals', 'GET');
    } catch {
      return [];
    }
  },
  createWithdrawal: async (withdrawalData: any): Promise<any> => {
    return await workerFetch('/api/withdrawals', 'POST', withdrawalData);
  },
  updateWithdrawalStatus: async (withdrawalId: string, status: string, payload?: any): Promise<any> => {
    return await workerFetch(`/api/withdrawals/${withdrawalId}`, 'PUT', { status, ...payload });
  },

  // --- Dealers ---
  getDealers: async (): Promise<any[]> => {
    try {
      return await workerFetch('/api/dealers', 'GET');
    } catch {
      return [];
    }
  },
  createDealer: async (dealerData: any): Promise<any> => {
    return await workerFetch('/api/dealers', 'POST', dealerData);
  },
  updateDealer: async (dealerId: string, dealerData: any): Promise<any> => {
    return await workerFetch(`/api/dealers/${dealerId}`, 'PUT', dealerData);
  },
  deleteDealer: async (dealerId: string): Promise<any> => {
    return await workerFetch(`/api/dealers/${dealerId}`, 'DELETE');
  },

  // --- Settings & Branding ---
  getSettings: async (): Promise<any> => {
    return await workerFetch('/api/settings', 'GET');
  },
  updateSettings: async (settingsData: any): Promise<any> => {
    return await workerFetch('/api/settings', 'PUT', settingsData);
  },

  // --- Bets & Logs ---
  getBets: async (): Promise<any[]> => {
    try {
      return await workerFetch('/api/bets', 'GET');
    } catch {
      return [];
    }
  },
  placeBet: async (betData: any): Promise<any> => {
    return await workerFetch('/api/bets', 'POST', betData);
  },

  // --- Payment Proofs ---
  getPaymentProofs: async (): Promise<any[]> => {
    try {
      return await workerFetch('/api/payment-proofs', 'GET');
    } catch {
      return [];
    }
  },
  createPaymentProof: async (proofData: any): Promise<any> => {
    return await workerFetch('/api/payment-proofs', 'POST', proofData);
  },
  updatePaymentProofStatus: async (proofId: string, status: string): Promise<any> => {
    return await workerFetch(`/api/payment-proofs/${proofId}`, 'PUT', { status });
  }
};
