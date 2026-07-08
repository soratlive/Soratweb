// Safe, offline Mock Firebase/Firestore implementation that NEVER calls network or initializes any SDK
// This prevents ANY high traffic errors or quota limits from being reached.

export let isFirestoreOffline = true;

// Mock Auth
export const auth: any = {
  currentUser: null
};

// Mock DB
export const db: any = {};

// Mock Storage
export const storage: any = {};

// Safe, open-signature any mocks to accept any parameters and prevent TS compilation issues
export const doc: any = (...args: any[]) => ({ id: args[2] || 'mock-id' });
export const getDoc: any = async (...args: any[]) => ({ exists: () => false, data: () => null });
export const getDocs: any = async (...args: any[]) => ({ empty: true, size: 0, docs: [] });
export const setDoc: any = async (...args: any[]) => {};
export const updateDoc: any = async (...args: any[]) => {};
export const collection: any = (...args: any[]) => ({});
export const query: any = (...args: any[]) => ({});
export const orderBy: any = (...args: any[]) => ({});
export const limit: any = (...args: any[]) => ({});
export const addDoc: any = async (...args: any[]) => ({ id: 'mock-id' });
export const deleteDoc: any = async (...args: any[]) => {};
export const increment: any = (val: number) => val;
export const onSnapshot: any = (...args: any[]) => {
  return () => {};
};
export const runTransaction: any = async (...args: any[]) => {
  const updateFn = args[1];
  if (typeof updateFn === 'function') {
    return await updateFn({
      get: async () => ({ exists: () => false, data: () => null }),
      set: () => {},
      update: () => {},
      delete: () => {}
    });
  }
};
export const where: any = (...args: any[]) => ({});
export const getRedirectResult: any = async (...args: any[]) => null;
export const ref: any = (...args: any[]) => ({});
export const uploadString: any = async (...args: any[]) => ({});
export const getDownloadURL: any = async (...args: any[]) => '';
export const onAuthStateChanged: any = (auth: any, callback: any) => {
  return () => {};
};
export const signInWithEmailAndPassword: any = async (...args: any[]) => ({ user: {} });
export const createUserWithEmailAndPassword: any = async (...args: any[]) => ({ user: {} });
export const updateProfile: any = async (...args: any[]) => {};

export async function signInWithGoogle() {
  return null;
}

export async function logout() {
  const { appwriteService } = await import('./appwrite');
  return await appwriteService.logout();
}

export async function refreshSession() {}

// Firebase User Back-compat Interface
export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

// Support references to prevent UI/runtime errors in App.tsx:
export const supabase = null;
export const isSupabaseConfigured = false;
export const lastDatabaseError = null;

// Keep diagnostics logs mock/support just in case
export interface DiagnosticLog {
  timestamp: string;
  operation: string;
  status: 'success' | 'failure' | 'pending';
  error?: string | null;
  payload?: any;
}

export const diagnosticLogs: DiagnosticLog[] = [];
export type DiagnosticListener = () => void;
const diagnosticListeners = new Set<DiagnosticListener>();

export function addDiagnosticLog(op: string, status: 'success' | 'failure' | 'pending', error?: string | null, payload?: any) {
  const logEntry: DiagnosticLog = {
    timestamp: new Date().toLocaleTimeString(),
    operation: op,
    status,
    error,
    payload
  };
  diagnosticLogs.unshift(logEntry);
  if (diagnosticLogs.length > 50) {
    diagnosticLogs.pop();
  }
  diagnosticListeners.forEach(listener => {
    try { listener(); } catch (e) { console.warn(e); }
  });
}

export function subscribeToDiagnostics(callback: DiagnosticListener) {
  diagnosticListeners.add(callback);
  return () => {
    diagnosticListeners.delete(callback);
  };
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
    },
    operationType,
    path
  };
  console.error('[Database Error] ', JSON.stringify(errInfo));
  addDiagnosticLog('database_error', 'failure', error instanceof Error ? error.message : String(error), { operationType, path });
}
