import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore,
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  addDoc, 
  deleteDoc, 
  increment, 
  onSnapshot, 
  runTransaction, 
  where
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadString, 
  getDownloadURL 
} from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
let firebaseApp: any = null;
let authInstance: any = null;
let dbInstance: any = null;
let storageInstance: any = null;
export let isFirestoreOffline = false;

try {
  firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  authInstance = getAuth(firebaseApp);
  dbInstance = getFirestore(firebaseApp, (firebaseConfig as any).firestoreDatabaseId);
  storageInstance = getStorage(firebaseApp);
} catch (error) {
  console.error('[Firebase] Initialization error:', error);
  isFirestoreOffline = true;
}

// Service exports
export const auth = authInstance;
export const db = dbInstance;
export const storage = storageInstance;

// Exports from firestore & other SDKs for straightforward consumption in App.tsx
export { 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  addDoc, 
  deleteDoc, 
  increment, 
  onSnapshot, 
  runTransaction, 
  where,
  getRedirectResult,
  ref,
  uploadString,
  getDownloadURL,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
};

export async function signInWithGoogle() {
  if (!authInstance) throw new Error('Firebase Auth is not initialized.');
  const provider = new GoogleAuthProvider();
  
  provider.addScope('profile');
  provider.addScope('email');

  try {
    console.log('[Firebase Auth] Attempting Google Sign-In with Popup...');
    const result = await signInWithPopup(authInstance, provider);
    return result;
  } catch (error: any) {
    console.warn('[Firebase Auth] signInWithPopup failed. Checking Redirect fallback...', error?.code);
    
    const isPopupIssue = 
      error?.code === 'auth/cancelled-popup-request' ||
      error?.code === 'auth/popup-blocked' ||
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/operation-not-allowed' ||
      error?.message?.toLowerCase().includes('popup') ||
      error?.message?.toLowerCase().includes('iframe') ||
      error?.message?.toLowerCase().includes('cross-origin');
      
    if (isPopupIssue) {
      console.log('[Firebase Auth] Triggering signInWithRedirect fallback...');
      await signInWithRedirect(authInstance, provider);
      return null;
    }
    throw error;
  }
}

export async function logout() {
  if (!authInstance) throw new Error('Firebase Auth is not initialized.');
  return signOut(authInstance);
}

export async function refreshSession() {
  if (authInstance?.currentUser) {
    try {
      await authInstance.currentUser.getIdToken(true);
    } catch (e) {
      console.warn('[Firebase Auth] Failed to refresh token:', e);
    }
  }
}

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
      userId: authInstance?.currentUser?.uid || null,
      email: authInstance?.currentUser?.email || null,
    },
    operationType,
    path
  };
  console.error('[Database Error] ', JSON.stringify(errInfo));
  addDiagnosticLog('database_error', 'failure', error instanceof Error ? error.message : String(error), { operationType, path });
  throw new Error(JSON.stringify(errInfo));
}
