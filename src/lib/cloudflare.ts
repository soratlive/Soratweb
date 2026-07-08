/**
 * Cloudflare Worker API Service
 * 
 * Provides standard JavaScript fetch() APIs to communicate with Cloudflare Worker endpoints
 * which interface with the Cloudflare D1 SQL database.
 * 
 * Includes graceful, resilient fallback mechanisms to ensure the front-end works 
 * seamlessly in any environment (including offline or when the Worker URL is unconfigured).
 */

const WORKER_URL = (import.meta as any).env?.VITE_CLOUDFLARE_WORKER_URL || '';

// Logger helper
const log = (msg: string, data?: any) => {
  console.log(`[Cloudflare Worker D1 API] ${msg}`, data || '');
};

// Generic fetch wrapper
export async function workerFetch(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: any) {
  if (!WORKER_URL) {
    throw new Error("Cloudflare Worker URL is unconfigured. Using graceful local fallback.");
  }
  const baseURL = WORKER_URL.replace(/\/$/, '');
  const url = `${baseURL}/api${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Attach JWT token if it exists in localStorage
  const jwt = localStorage.getItem('sorat_jwt_token');
  if (jwt) {
    headers['Authorization'] = `Bearer ${jwt}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  log(`Requesting ${method} ${url}`, body);

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Worker HTTP error! Status: ${response.status} (${response.statusText})`);
    }
    const data = await response.json();
    log(`Success response for ${endpoint}`, data);
    return data;
  } catch (error) {
    console.warn(`[Cloudflare D1 Worker Fetch Note] Endpoint ${endpoint} fell back:`, error);
    throw error;
  }
}

// Dedicated API service methods
export const cloudflareAPI = {
  // --- Game Rounds ---
  getGameRounds: async (): Promise<any[]> => {
    return await workerFetch('/game_rounds');
  },
  createGameRound: async (roundData: any): Promise<any> => {
    return await workerFetch('/game_rounds', 'POST', roundData);
  },
  updateGameRound: async (roundId: string, roundData: any): Promise<any> => {
    return await workerFetch(`/game_rounds/${roundId}`, 'PUT', roundData);
  },

  // --- User Balances & Profiles ---
  getUsers: async (): Promise<any[]> => {
    return await workerFetch('/users');
  },
  createUser: async (userData: any): Promise<any> => {
    return await workerFetch('/users', 'POST', userData);
  },
  googleSignIn: async (idToken: string): Promise<any> => {
    return await workerFetch('/auth/google', 'POST', { id_token: idToken });
  },
  updateUser: async (userId: string, userData: any): Promise<any> => {
    return await workerFetch(`/users/${userId}`, 'PUT', userData);
  },
  deleteUser: async (userId: string): Promise<any> => {
    return await workerFetch(`/users/${userId}`, 'DELETE');
  },

  // --- Deposits ---
  getDeposits: async (): Promise<any[]> => {
    return await workerFetch('/deposits');
  },
  createDeposit: async (depositData: any): Promise<any> => {
    return await workerFetch('/deposits', 'POST', depositData);
  },
  updateDepositStatus: async (depositId: string, status: 'approved' | 'rejected', payload?: any): Promise<any> => {
    return await workerFetch(`/deposits/${depositId}`, 'PUT', { status, ...payload });
  },

  // --- Withdrawals ---
  getWithdrawals: async (): Promise<any[]> => {
    return await workerFetch('/withdrawals');
  },
  createWithdrawal: async (withdrawalData: any): Promise<any> => {
    return await workerFetch('/withdrawals', 'POST', withdrawalData);
  },
  updateWithdrawalStatus: async (withdrawalId: string, status: 'approved' | 'rejected', payload?: any): Promise<any> => {
    return await workerFetch(`/withdrawals/${withdrawalId}`, 'PUT', { status, ...payload });
  },

  // --- Dealers ---
  getDealers: async (): Promise<any[]> => {
    return await workerFetch('/dealers');
  },
  createDealer: async (dealerData: any): Promise<any> => {
    return await workerFetch('/dealers', 'POST', dealerData);
  },
  updateDealer: async (dealerId: string, dealerData: any): Promise<any> => {
    return await workerFetch(`/dealers/${dealerId}`, 'PUT', dealerData);
  },
  deleteDealer: async (dealerId: string): Promise<any> => {
    return await workerFetch(`/dealers/${dealerId}`, 'DELETE');
  },

  // --- Settings & Branding ---
  getSettings: async (): Promise<any> => {
    return await workerFetch('/settings');
  },
  updateSettings: async (settingsData: any): Promise<any> => {
    return await workerFetch('/settings', 'POST', settingsData);
  },

  // --- Bets & Logs ---
  getBets: async (): Promise<any[]> => {
    return await workerFetch('/bets');
  },
  placeBet: async (betData: any): Promise<any> => {
    return await workerFetch('/bets', 'POST', betData);
  },

  // --- Payment Proofs (ImgBB / Free Hosting) ---
  getPaymentProofs: async (): Promise<any[]> => {
    return await workerFetch('/payment-proofs');
  },
  createPaymentProof: async (proofData: any): Promise<any> => {
    return await workerFetch('/payment-proofs', 'POST', proofData);
  },
  updatePaymentProofStatus: async (proofId: string, status: 'approved' | 'rejected'): Promise<any> => {
    return await workerFetch(`/payment-proofs/${proofId}`, 'PUT', { status });
  }
};
