import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- Environment Setup ---
const SUPABASE_URL = (((import.meta as any).env?.VITE_SUPABASE_URL) || '').trim();
const SUPABASE_ANON_KEY = (((import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || '').trim();

export const isSupabaseConfigured = 
  SUPABASE_URL !== '' && 
  SUPABASE_ANON_KEY !== '' && 
  (SUPABASE_URL.startsWith('http://') || SUPABASE_URL.startsWith('https://')) &&
  !SUPABASE_URL.includes('your-supabase-project-id');

export let lastDatabaseError: string | null = null;

// --- Clean Logger / Trace Engine ---
const log = (msg: string, data?: any) => {
  console.log(`[Supabase Integration] ${msg}`, data || '');
};

// --- In-Memory & LocalStorage Cache Layer for Optimizing API Reads ---
class ReadCache {
  private cache: { [key: string]: { data: any; expiresAt: number } } = {};
  private defaultTTL = 10000; // 10 seconds default cache TTL

  get(key: string): any | null {
    const item = this.cache[key];
    if (item && Date.now() < item.expiresAt) {
      return item.data;
    }
    if (item) {
      delete this.cache[key];
    }
    return null;
  }

  set(key: string, data: any, ttlMs: number = this.defaultTTL) {
    this.cache[key] = {
      data,
      expiresAt: Date.now() + ttlMs,
    };
  }

  invalidate(key: string) {
    delete this.cache[key];
    // Also clear list caches related to this collection
    const collectionName = key.split('/')[0];
    Object.keys(this.cache).forEach(k => {
      if (k.startsWith(`${collectionName}_list`) || k.startsWith(collectionName)) {
        delete this.cache[k];
      }
    });
  }

  clear() {
    this.cache = {};
  }
}

const dbCache = new ReadCache();

// --- Supabase Client Instance (or Dummy Fallback for Sandbox Mode) ---
let initializedSupabase: SupabaseClient | null = null;
if (isSupabaseConfigured) {
  try {
    initializedSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.error('[Supabase Init Error] Failed to create Supabase client:', err);
  }
}
export const supabase = initializedSupabase;

// --- Local Mode Storage Engine (For absolute functionality in dev environment) ---
class LocalSandboxStorage {
  private getStore(collection: string): any[] {
    const data = localStorage.getItem(`sorat_local_${collection}`);
    try {
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setStore(collection: string, data: any[]) {
    localStorage.setItem(`sorat_local_${collection}`, JSON.stringify(data));
  }

  getDoc(collectionName: string, docId: string): any {
    const store = this.getStore(collectionName);
    return store.find(item => item.id === docId) || null;
  }

  setDoc(collectionName: string, docId: string, data: any) {
    const store = this.getStore(collectionName);
    const index = store.findIndex(item => item.id === docId);
    if (index >= 0) {
      store[index] = { ...store[index], ...data, id: docId };
    } else {
      store.push({ ...data, id: docId });
    }
    this.setStore(collectionName, store);
  }

  addDoc(collectionName: string, data: any): string {
    const store = this.getStore(collectionName);
    const id = Math.random().toString(36).substr(2, 9);
    const newDoc = { ...data, id };
    store.push(newDoc);
    this.setStore(collectionName, store);
    return id;
  }

  updateDoc(collectionName: string, docId: string, data: any) {
    const store = this.getStore(collectionName);
    const index = store.findIndex(item => item.id === docId);
    if (index >= 0) {
      store[index] = { ...store[index], ...data };
      this.setStore(collectionName, store);
    } else {
      this.setDoc(collectionName, docId, data);
    }
  }

  deleteDoc(collectionName: string, docId: string) {
    const store = this.getStore(collectionName);
    const filtered = store.filter(item => item.id !== docId);
    this.setStore(collectionName, filtered);
  }

  getDocs(collectionName: string): any[] {
    return this.getStore(collectionName);
  }
}

const localDb = new LocalSandboxStorage();

// Ensure some defaults exist in sandbox mode
if (!isSupabaseConfigured) {
  log("Running in offline/sandbox local mode. Set up Supabase environment variables to connect live cloud PostgreSQL.");
  if (!localDb.getDoc('settings', 'global')) {
    localDb.setDoc('settings', 'global', {
      isPaused: false,
      multiplier: 12,
      timerDuration: 15,
      upiId: 'soratlive@ybl',
      paymentLink: '',
      customImages: {},
      customNames: {}
    });
  }
  if (!localDb.getDoc('game', 'currentRound')) {
    localDb.setDoc('game', 'currentRound', {
      phase: 'betting',
      timerEndTime: Date.now() + 15000,
      winnerId: null,
      roundId: 'initial_round'
    });
  }
}

// --- Firebase Interface Shims ---

// 1. Auth Stub and Firebase compatibility
export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified?: boolean;
  isAnonymous?: boolean;
  tenantId?: string | null;
  providerData?: any[];
}

export type AuthStateCallback = (user: FirebaseUser | null) => void;

export interface DiagnosticLog {
  timestamp: string;
  operation: string;
  status: 'success' | 'failure' | 'pending';
  error?: string | null;
  payload?: any;
}

export const diagnosticLogs: DiagnosticLog[] = [];
export type DiagnosticListener = () => void;
let diagnosticListeners: DiagnosticListener[] = [];

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
  diagnosticListeners.forEach(l => {
    try { l(); } catch (e) { console.error(e); }
  });
}

export function subscribeToDiagnostics(callback: DiagnosticListener) {
  diagnosticListeners.push(callback);
  return () => {
    diagnosticListeners = diagnosticListeners.filter(l => l !== callback);
  };
}

// Auto-sync checks to verify that user profile exists in public.users table and populate missing records safely
export async function ensureUserProfileExists(uid: string, email: string | null, displayName: string) {
  if (!isSupabaseConfigured || !supabase) {
    addDiagnosticLog('Profile Check', 'failure', 'Supabase is not configured yet.', { uid, email, displayName });
    return;
  }

  try {
    log(`[Profile Sync] Checking if user ${uid} possesses a profile record inside public.users`);
    addDiagnosticLog('Profile Check: Start', 'pending', null, { uid, email });
    
    // Check if user already exists
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('id', uid)
      .maybeSingle();

    if (selectError) {
      console.error('[Supabase Auth] error checking profile exists:', selectError);
      addDiagnosticLog('Profile Check: Select Error', 'failure', selectError.message, { selectError, uid });
    }

    if (!existingUser) {
      log(`[Profile Sync] Missing profile for user ID: ${uid}. Automatically generating profile row...`);
      const emailVal = email || '';
      const payload = {
        id: uid,
        email: emailVal,
        name: displayName,
        display_name: displayName,
        coins: 0,
        balance: 0, // Ensure both compatibility columns are synchronized to 0
        role: emailVal.toLowerCase().trim() === 'nikhilrv8055@gmail.com' ? 'admin' : 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      addDiagnosticLog('Insert Profile: Start', 'pending', null, payload);

      const { error: insertError } = await supabase
        .from('users')
        .insert(payload);

      if (insertError) {
        console.error('[Supabase Auth] Failed inserting profile to public.users table:', insertError);
        addDiagnosticLog('Insert Profile: Insert Error', 'failure', insertError.message, { insertError, payload });
        
        // Fallback using upsert
        try {
          addDiagnosticLog('Insert Profile: Fallback Upsert Start', 'pending', null, payload);
          const { error: upsertError } = await supabase.from('users').upsert(payload);
          if (upsertError) {
            addDiagnosticLog('Insert Profile: Fallback Upsert Error', 'failure', upsertError.message, { upsertError });
          } else {
            addDiagnosticLog('Insert Profile: Fallback Upsert Success', 'success', null, { uid });
          }
        } catch (upsertErr: any) {
          console.error('[Supabase Auth] Fallback profile upsert failed:', upsertErr);
          addDiagnosticLog('Insert Profile: Fallback Exception', 'failure', upsertErr?.message || String(upsertErr));
        }
      } else {
        log(`[Profile Sync] Successfully created profile in public.users for ${uid}`);
        addDiagnosticLog('Insert Profile: Success', 'success', null, { uid });
      }
    } else {
      log(`[Profile Sync] User profile already exists in the database for user ID: ${uid}. Verifying columns...`);
      addDiagnosticLog('Profile Check: Exists', 'success', null, { uid });
      
      // Update missing columns if they are not stored
      const needsName = !('name' in existingUser) || existingUser.name === null || existingUser.name === undefined;
      const needsCoins = !('coins' in existingUser) || existingUser.coins === null || existingUser.coins === undefined;
      
      if (needsName || needsCoins) {
        const updates: any = {};
        if (needsName) updates.name = existingUser.display_name || displayName;
        if (needsCoins) updates.coins = Number(existingUser.balance) || 0;
        
        log(`[Profile Sync] Patching missing columns in existing user row:`, updates);
        addDiagnosticLog('Profile Update: Start', 'pending', null, { updates, uid });
        const { error: updateError } = await supabase.from('users').update(updates).eq('id', uid);
        if (updateError) {
          addDiagnosticLog('Profile Update: Error', 'failure', updateError.message, { updateError });
        } else {
          addDiagnosticLog('Profile Update: Success', 'success', null, { uid });
        }
      }
    }
  } catch (err: any) {
    console.error('[Supabase Auth] Exception during ensureUserProfileExists:', err);
    addDiagnosticLog('Profile Exception', 'failure', err?.message || String(err), { uid });
  }
}

class CustomAuthService {
  private listeners: AuthStateCallback[] = [];
  private currentLocalUser: FirebaseUser | null = null;

  constructor() {
    if (isSupabaseConfigured && supabase) {
      // Async fetch of current session to define initial user state
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const mappedUser: FirebaseUser = {
            uid: session.user.id,
            email: session.user.email || null,
            displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'Player'
          };
          this.currentLocalUser = mappedUser;
          this.triggerListeners(mappedUser);
          ensureUserProfileExists(session.user.id, session.user.email || null, mappedUser.displayName || 'Player');
        }
      }).catch(err => {
        console.error('[Supabase Auth] Session fetch error:', err);
      });

      supabase.auth.onAuthStateChange(async (event, session) => {
        log(`Auth Event Triggered: ${event}`);
        if (session?.user) {
          const mappedUser: FirebaseUser = {
            uid: session.user.id,
            email: session.user.email || null,
            displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'Player'
          };
          this.currentLocalUser = mappedUser;
          this.triggerListeners(mappedUser);

          // Force-verify/create profile row immediately
          await ensureUserProfileExists(session.user.id, session.user.email || null, mappedUser.displayName || 'Player');

          if (window.opener) {
            try {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, window.location.origin);
              document.body.innerHTML = `
                <div style="background:#0b1329; color:white; font-family:sans-serif; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; text-align:center;">
                  <div>
                    <p style="font-size:16px; font-weight:bold; color:#10b981; letter-spacing:0.05em; text-transform:uppercase; margin-bottom:8px;">✔ Authenticated Successfully</p>
                    <p style="font-size:11px; color:#64748b; text-transform:uppercase;">This window will close automatically...</p>
                  </div>
                </div>
              `;
              setTimeout(() => {
                window.close();
              }, 1000);
            } catch (err) {
              console.error('Error sending postMessage to opener:', err);
            }
          }
        } else {
          this.currentLocalUser = null;
          this.triggerListeners(null);
        }
      });
    }
  }

  refreshSession() {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const mappedUser: FirebaseUser = {
            uid: session.user.id,
            email: session.user.email || null,
            displayName: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'Player'
          };
          if (JSON.stringify(this.currentLocalUser) !== JSON.stringify(mappedUser)) {
            this.currentLocalUser = mappedUser;
            this.triggerListeners(mappedUser);
          }
        } else {
          if (this.currentLocalUser !== null) {
            this.currentLocalUser = null;
            this.triggerListeners(null);
          }
        }
      }).catch(err => {
        console.error('[Supabase Auth] Session refresh failed:', err);
      });
    }
  }

  get currentUser(): FirebaseUser | null {
    return this.currentLocalUser;
  }

  onAuthStateChanged(callback: AuthStateCallback) {
    this.listeners.push(callback);
    callback(this.currentLocalUser);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private triggerListeners(user: FirebaseUser | null) {
    this.listeners.forEach(l => l(user));
  }

  async signInWithEmailAndPassword(emailStr: string, passwordStr: string): Promise<{ user: FirebaseUser }> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error("Supabase is not configured! Please configure Supabase variables in the settings panel first.");
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailStr,
      password: passwordStr
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("A login error occurred");

    const mappedUser: FirebaseUser = {
      uid: data.user.id,
      email: data.user.email || null,
      displayName: data.user.user_metadata?.display_name || data.user.email?.split('@')[0] || 'Player'
    };

    await ensureUserProfileExists(data.user.id, data.user.email || null, mappedUser.displayName || 'Player');

    this.currentLocalUser = mappedUser;
    this.triggerListeners(mappedUser);
    return { user: mappedUser };
  }

  async createUserWithEmailAndPassword(emailStr: string, passwordStr: string): Promise<{ user: FirebaseUser }> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error("Supabase is not configured! Please configure Supabase variables in the settings panel first.");
    }
    const { data, error } = await supabase.auth.signUp({
      email: emailStr,
      password: passwordStr
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("Could not register user");

    const mappedUser: FirebaseUser = {
      uid: data.user.id,
      email: data.user.email || null,
      displayName: data.user.user_metadata?.display_name || data.user.email?.split('@')[0] || 'Player'
    };

    await ensureUserProfileExists(data.user.id, data.user.email || null, mappedUser.displayName || 'Player');

    return { user: mappedUser };
  }

  async updateProfile(user: FirebaseUser, { displayName }: { displayName: string }) {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.auth.updateUser({
      data: { display_name: displayName }
    });
    if (error) throw new Error(error.message);

    await supabase.from('users').upsert({
      id: user.uid,
      name: displayName,
      display_name: displayName,
      updated_at: new Date().toISOString()
    });

    if (this.currentLocalUser && this.currentLocalUser.uid === user.uid) {
      this.currentLocalUser.displayName = displayName;
      this.triggerListeners(this.currentLocalUser);
    }
  }

  async signInWithGoogle(): Promise<{ user: FirebaseUser }> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error("Supabase is not configured! Please configure Supabase variables in the settings panel first.");
    }
    // Immediately open a blank popup to bypass browser popup blockers
    const popup = window.open('', 'google_auth_popup', 'width=500,height=600');
    if (!popup) {
      throw new Error("auth/popup-blocked");
    }
    
    // Inject loading feedback into the popup while fetching URL
    popup.document.write(`
      <html>
        <head>
          <title>Logging in...</title>
        </head>
        <body style="background:#0b1329; color:white; font-family:sans-serif; display:flex; justify-content:center; align-items:center; height:100vh; margin:0;">
          <div style="text-align:center;">
            <div style="border: 4px solid rgba(255,255,255,0.1); border-top: 4px solid #3b82f6; border-radius: 50%; width: 36px; height: 36px; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
            <p style="font-size:12px; font-weight:bold; letter-spacing:0.05em; text-transform:uppercase; color:#94a3b8;">Connecting to Google...</p>
          </div>
          <style>
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </body>
      </html>
    `);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          skipBrowserRedirect: true
        }
      });
      
      if (error) {
        popup.close();
        throw error;
      }
      
      if (data?.url) {
        popup.location.href = data.url;
      } else {
        popup.close();
        throw new Error("Could not retrieve authorization URL");
      }
    } catch (err: any) {
      popup.close();
      throw err;
    }
    
    // Return a promise that resolves when the popup signals successful auth
    return new Promise((resolve) => {
      const handleMsg = (event: MessageEvent) => {
        if (event.origin === window.location.origin && event.data?.type === 'OAUTH_AUTH_SUCCESS') {
          window.removeEventListener('message', handleMsg);
          setTimeout(() => {
            if (this.currentLocalUser) {
              resolve({ user: this.currentLocalUser });
            } else {
              resolve({ user: { uid: 'unknown', email: null, displayName: null } });
            }
          }, 500);
        }
      };
      window.addEventListener('message', handleMsg);
    });
  }

  async signOut() {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[Supabase Auth] Remote signOut warning:', err);
      }
    }
    this.currentLocalUser = null;
    this.triggerListeners(null);
  }
}

export const auth = new CustomAuthService();
export const onAuthStateChanged = (authObj: CustomAuthService, cb: AuthStateCallback) => auth.onAuthStateChanged(cb);
export const signInWithEmailAndPassword = (authObj: CustomAuthService, e: string, p: string) => auth.signInWithEmailAndPassword(e, p);
export const createUserWithEmailAndPassword = (authObj: CustomAuthService, e: string, p: string) => auth.createUserWithEmailAndPassword(e, p);
export const updateProfile = (userObj: FirebaseUser, payload: { displayName: string }) => auth.updateProfile(userObj, payload);
export const signInWithGoogle = () => auth.signInWithGoogle();
export const logout = () => auth.signOut();
export const refreshSession = () => auth.refreshSession();

export const googleProvider = {};

// 2. Database Integration Stub & Firebase API mappings
export const db = { type: 'supabase-postgres' };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[Supabase Error] ${operationType} on ${path}: `, message);
  throw new Error(message);
}

export interface DocRef {
  _db: any;
  collectionName: string;
  docId: string;
}

export interface CollectionRef {
  collectionName: string;
}

export interface QueryRef {
  collectionName: string;
  filters: any[];
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  limitCount?: number;
}

export function collection(dbInstance: any, collectionPath: string): CollectionRef {
  return { collectionName: collectionPath };
}

export function doc(dbInstance: any, collectionPath: string, docId?: string): DocRef;
export function doc(collectionRef: CollectionRef, docId?: string): DocRef;
export function doc(firstArg: any, secondArg?: string, thirdArg?: string): DocRef {
  if (typeof firstArg === 'object' && 'collectionName' in firstArg) {
    return {
      _db: db,
      collectionName: firstArg.collectionName,
      docId: secondArg || Math.random().toString(36).substr(2, 9)
    };
  }
  return {
    _db: db,
    collectionName: firstArg,
    docId: secondArg || Math.random().toString(36).substr(2, 9)
  };
}

export function where(field: string, condition: string, value: any) {
  return { type: 'where', field, condition, value };
}

export function orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
  return { type: 'orderBy', field, direction };
}

export function limit(count: number) {
  return { type: 'limit', count };
}

export function query(colRef: CollectionRef, ...constraints: any[]): QueryRef {
  const qRef: QueryRef = {
    collectionName: colRef.collectionName,
    filters: []
  };
  constraints.forEach(c => {
    if (!c) return;
    if (c.type === 'where') {
      qRef.filters.push(c);
    } else if (c.type === 'orderBy') {
      qRef.orderByField = c.field;
      qRef.orderDirection = c.direction;
    } else if (c.type === 'limit') {
      qRef.limitCount = c.count;
    }
  });
  return qRef;
}

// Map collection or documents to Supabase DB tables
function mapCollectionToTable(name: string): { table: string; isKV: boolean; mappingKey?: string } {
  const parts = name.split('/');
  const baseName = parts[0];

  if (baseName === 'users') {
    return { table: 'users', isKV: false };
  }
  if (baseName === 'game' || baseName === 'settings') {
    // These behave as KV settings/states
    return { table: 'key_value_store', isKV: true, mappingKey: `${parts[0]}:${parts[1] || 'global'}` };
  }
  if (baseName === 'dealers') {
    return { table: 'dealers', isKV: false };
  }
  if (baseName === 'depositRequests') {
    return { table: 'deposit_requests', isKV: false };
  }
  if (baseName === 'paymentSettings') {
    return { table: 'payment_settings', isKV: false };
  }
  if (baseName === 'withdrawalRequests') {
    return { table: 'withdrawal_requests', isKV: false };
  }
  if (baseName === 'leaderboard') {
    return { table: 'leaderboard', isKV: false };
  }
  if (baseName === 'gameRounds') {
    return { table: 'game_rounds', isKV: false };
  }
  return { table: 'key_value_store', isKV: true, mappingKey: name };
}

function sanitizeDocValue(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  
  if (obj._type === 'increment') {
    return Number(obj.amount) || 0;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeDocValue(item));
  }
  
  const cleaned: any = {};
  Object.keys(obj).forEach(key => {
    cleaned[key] = sanitizeDocValue(obj[key]);
  });
  return cleaned;
}

// Convert DB row keys to client model keys
function mapKeysFromDB(table: string, data: any): any {
  if (!data) return null;
  const sanitized = sanitizeDocValue(data);
  const mapped = { ...sanitized };
  if ('id' in mapped) mapped.id = mapped.id;
  
  // Custom type mappings
  if (table === 'users') {
    if ('bank_details' in mapped) mapped.bankDetails = mapped.bank_details;
    if ('display_name' in mapped) mapped.displayName = mapped.display_name;
    if ('name' in mapped) mapped.name = mapped.name;
    if ('coins' in mapped) {
      mapped.coins = Number(mapped.coins);
      mapped.balance = Number(mapped.coins);
    }
    if ('balance' in mapped) {
      mapped.balance = Number(mapped.balance);
      mapped.coins = Number(mapped.balance);
    }
  }
  if (table === 'dealers') {
    if ('upi_id' in mapped) mapped.upiId = mapped.upi_id;
    if ('qr_url' in mapped) mapped.qrUrl = mapped.qr_url;
    if ('is_active' in mapped) mapped.isActive = mapped.is_active;
  }
  if (table === 'deposit_requests') {
    if ('user_id' in mapped) mapped.userId = mapped.user_id;
    if ('utr' in mapped) {
      mapped.utr = mapped.utr;
      mapped.transactionId = mapped.utr;
    }
    if ('transaction_id' in mapped) {
      mapped.utr = mapped.transaction_id;
      mapped.transactionId = mapped.transaction_id;
    }
    if ('screenshot_url' in mapped) mapped.screenshotUrl = mapped.screenshot_url;
    if ('dealer_id' in mapped) mapped.dealerId = mapped.dealer_id;
    if ('user_balance_before' in mapped) mapped.userBalanceBefore = Number(mapped.user_balance_before);
    mapped.amount = Number(mapped.amount);
  }
  if (table === 'payment_settings') {
    if ('qr_url' in mapped) mapped.qrUrl = mapped.qr_url;
    if ('upi_id' in mapped) mapped.upiId = mapped.upi_id;
    if ('payee_name' in mapped) mapped.payeeName = mapped.payee_name;
  }
  if (table === 'withdrawal_requests') {
    if ('user_id' in mapped) mapped.userId = mapped.user_id;
    if ('bank_details' in mapped) mapped.bankDetails = mapped.bank_details;
    if ('user_balance_before' in mapped) mapped.userBalanceBefore = Number(mapped.user_balance_before);
    mapped.amount = Number(mapped.amount);
  }
  if (table === 'leaderboard') {
    if ('user_id' in mapped) mapped.userId = mapped.user_id;
    if ('display_name' in mapped) mapped.displayName = mapped.display_name;
    if ('total_winnings' in mapped) mapped.totalWinnings = Number(mapped.total_winnings);
    if ('highest_win' in mapped) mapped.highestWin = Number(mapped.highest_win);
  }
  if (table === 'game_rounds') {
    if ('winner_id' in mapped) mapped.winnerId = mapped.winner_id;
    if ('total_pool' in mapped) mapped.totalPool = Number(mapped.total_pool);
  }
  return mapped;
}

// Convert model keys to database row keys
function mapKeysToDB(table: string, data: any): any {
  if (!data) return null;
  const mapped: any = {};
  
  Object.keys(data).forEach(key => {
    let dbKey = key;
    let val = data[key];

    if (table === 'users') {
      if (key === 'bankDetails') dbKey = 'bank_details';
      if (key === 'displayName') {
        dbKey = 'display_name';
        mapped['name'] = val; // Synchronize name
      }
      if (key === 'name') {
        dbKey = 'name';
        mapped['display_name'] = val; // Synchronize display_name
      }
      if (key === 'balance') {
        dbKey = 'balance';
        mapped['coins'] = val; // Synchronize coins
      }
      if (key === 'coins') {
        dbKey = 'coins';
        mapped['balance'] = val; // Synchronize balance
      }
    }
    if (table === 'dealers') {
      if (key === 'upiId') dbKey = 'upi_id';
      if (key === 'qrUrl') dbKey = 'qr_url';
      if (key === 'isActive') dbKey = 'is_active';
    }
    if (table === 'deposit_requests') {
      if (key === 'userId') dbKey = 'user_id';
      if (key === 'transactionId') dbKey = 'utr';
      if (key === 'utr') dbKey = 'utr';
      if (key === 'screenshotUrl') dbKey = 'screenshot_url';
      if (key === 'dealerId') dbKey = 'dealer_id';
      if (key === 'userBalanceBefore') dbKey = 'user_balance_before';
    }
    if (table === 'payment_settings') {
      if (key === 'qrUrl') dbKey = 'qr_url';
      if (key === 'upiId') dbKey = 'upi_id';
      if (key === 'payeeName') dbKey = 'payee_name';
    }
    if (table === 'withdrawal_requests') {
      if (key === 'userId') dbKey = 'user_id';
      if (key === 'bankDetails') dbKey = 'bank_details';
      if (key === 'userBalanceBefore') dbKey = 'user_balance_before';
    }
    if (table === 'leaderboard') {
      if (key === 'userId') dbKey = 'user_id';
      if (key === 'displayName') dbKey = 'display_name';
      if (key === 'totalWinnings') dbKey = 'total_winnings';
      if (key === 'highestWin') dbKey = 'highest_win';
    }
    if (table === 'game_rounds') {
      if (key === 'winnerId') dbKey = 'winner_id';
      if (key === 'totalPool') dbKey = 'total_pool';
    }

    mapped[dbKey] = val;
  });

  return mapped;
}

// 3. Document APIs

export async function getDoc(documentRef: DocRef): Promise<{ exists: () => boolean; data: () => any }> {
  const { collectionName, docId } = documentRef;
  const fullPath = `${collectionName}/${docId}`;

  // Check Local Cache First to minimize API reads
  const cachedData = dbCache.get(fullPath);
  if (cachedData !== null) {
    return {
      exists: () => cachedData !== undefined,
      data: () => cachedData
    };
  }

  const mapping = mapCollectionToTable(fullPath);

  if (isSupabaseConfigured && supabase) {
    try {
      if (mapping.isKV) {
        const { data, error } = await supabase
          .from(mapping.table)
          .select('value')
          .eq('key', mapping.mappingKey)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is code for no row found
          throw error;
        }

        const value = data ? data.value : null;
        dbCache.set(fullPath, value, 30000); // Cache settings/currentRound for 30s
        return {
          exists: () => value !== null,
          data: () => value
        };
      } else {
        const { data, error } = await supabase
          .from(mapping.table)
          .select('*')
          .eq(mapping.table === 'users' ? 'id' : 'id', docId)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        const mappedValue = data ? mapKeysFromDB(mapping.table, data) : null;
        dbCache.set(fullPath, mappedValue, 10000); // Cache structures/profiles for 10s
        return {
          exists: () => data !== null,
          data: () => mappedValue
        };
      }
    } catch (e) {
      log(`Error pulling doc ${fullPath}:`, e);
    }
  }

  // Local sandbox mode read
  let dataVal;
  if (mapping.table === 'users') {
    dataVal = localDb.getDoc(mapping.table, docId);
  } else if (mapping.isKV) {
    dataVal = localDb.getDoc(mapping.table, mapping.mappingKey!);
  } else {
    dataVal = localDb.getDoc(mapping.table, docId);
  }

  const finalValue = dataVal ? mapKeysFromDB(mapping.table, dataVal) : null;
  return {
    exists: () => finalValue !== null,
    data: () => finalValue
  };
}

// Helper to safely extract numeric values and resolve any increment operations
function getNumericValue(parentObj: any, key: string): number {
  if (!parentObj) return 0;
  const val = parentObj[key];
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'object' && val._type === 'increment') {
    return Number(val.amount) || 0;
  }
  const parsed = Number(val);
  return isNaN(parsed) ? 0 : parsed;
}

function resolvePayloadDeltas(currentData: any, incomingData: any): any {
  if (!incomingData) return {};
  const resolved: any = {};
  
  Object.keys(incomingData).forEach(key => {
    const val = incomingData[key];
    if (val && typeof val === 'object' && val._type === 'increment') {
      const currentVal = getNumericValue(currentData, key);
      resolved[key] = currentVal + Number(val.amount);
    } else {
      resolved[key] = val;
    }
  });
  
  return resolved;
}

export async function setDoc(documentRef: DocRef, data: any) {
  const { collectionName, docId } = documentRef;
  const fullPath = `${collectionName}/${docId}`;

  // Get existing to resolve any increments correctly
  const existing = await getDoc(documentRef);
  const currentData = existing.data() || {};
  const resolvedIncoming = resolvePayloadDeltas(currentData, data);
  const merged = { ...currentData, ...resolvedIncoming };

  // Immediately cache / invalidate
  dbCache.set(fullPath, merged);
  dbCache.invalidate(fullPath);

  const mapping = mapCollectionToTable(fullPath);

  if (isSupabaseConfigured && supabase) {
    if (mapping.isKV) {
      await supabase.from(mapping.table).upsert({
        key: mapping.mappingKey,
        value: merged,
        updated_at: new Date().toISOString()
      });
    } else {
      const dbPayload = mapKeysToDB(mapping.table, merged);
      await supabase.from(mapping.table).upsert({
        ...dbPayload,
        id: docId
      });
    }
    return;
  }

  // Local sandbox mode write
  if (mapping.isKV) {
    localDb.setDoc(mapping.table, mapping.mappingKey!, merged);
  } else {
    localDb.setDoc(mapping.table, docId, merged);
  }
}

export async function updateDoc(documentRef: DocRef, data: any) {
  const { collectionName, docId } = documentRef;
  const fullPath = `${collectionName}/${docId}`;

  // Get existing profile to merge and invalidate
  const existing = await getDoc(documentRef);
  const currentData = existing.data() || {};
  const resolvedIncoming = resolvePayloadDeltas(currentData, data);
  const merged = { ...currentData, ...resolvedIncoming };
  
  dbCache.set(fullPath, merged);
  dbCache.invalidate(fullPath);

  const mapping = mapCollectionToTable(fullPath);

  if (isSupabaseConfigured && supabase) {
    if (mapping.isKV) {
      await supabase.from(mapping.table).upsert({
        key: mapping.mappingKey,
        value: merged,
        updated_at: new Date().toISOString()
      });
    } else {
      const dbPayload = mapKeysToDB(mapping.table, resolvedIncoming);
      
      const { error } = await supabase
        .from(mapping.table)
        .update(dbPayload)
        .eq('id', docId);

      if (error) {
        // Fallback to upsert if row does not exist
        const fullPayload = mapKeysToDB(mapping.table, merged);
        await supabase.from(mapping.table).upsert({
          ...fullPayload,
          id: docId
        });
      }
    }
    return;
  }

  // Local sandbox mode update
  if (mapping.isKV) {
    localDb.setDoc(mapping.table, mapping.mappingKey!, merged);
  } else {
    localDb.setDoc(mapping.table, docId, merged);
  }
}

export async function addDoc(colRef: CollectionRef, data: any): Promise<DocRef> {
  const collectionName = colRef.collectionName;
  const docId = Math.random().toString(36).substr(2, 9);
  const fullPath = `${collectionName}/${docId}`;

  dbCache.invalidate(fullPath);

  const resolvedIncoming = resolvePayloadDeltas(null, data);
  const mapping = mapCollectionToTable(fullPath);

  if (isSupabaseConfigured && supabase) {
    const dbPayload = mapKeysToDB(mapping.table, resolvedIncoming);
    const { data: inserted, error } = await supabase
      .from(mapping.table)
      .insert({
        ...dbPayload,
        id: docId
      })
      .select('id')
      .single();

    if (error) throw error;
    return { _db: db, collectionName, docId: inserted?.id || docId };
  }

  const actualId = localDb.addDoc(mapping.table, mapKeysToDB(mapping.table, resolvedIncoming));
  return { _db: db, collectionName, docId: actualId };
}

export async function deleteDoc(documentRef: DocRef) {
  const { collectionName, docId } = documentRef;
  const fullPath = `${collectionName}/${docId}`;

  dbCache.invalidate(fullPath);

  const mapping = mapCollectionToTable(fullPath);

  if (isSupabaseConfigured && supabase) {
    if (mapping.isKV) {
      await supabase.from(mapping.table).delete().eq('key', mapping.mappingKey);
    } else {
      await supabase.from(mapping.table).delete().eq('id', docId);
    }
    return;
  }

  if (mapping.isKV) {
    localDb.deleteDoc(mapping.table, mapping.mappingKey!);
  } else {
    localDb.deleteDoc(mapping.table, docId);
  }
}

// 4. Query & Lists API

export interface DocSnapshot {
  id: string;
  exists: () => boolean;
  data: () => any;
}

export interface QuerySnapshot {
  empty: boolean;
  docs: DocSnapshot[];
  size: number;
}

export async function getDocs(queryDef: QueryRef | CollectionRef): Promise<QuerySnapshot> {
  const collectionName = queryDef.collectionName;
  const mapping = mapCollectionToTable(collectionName);

  // Generate cache key for list
  const cacheKey = `${collectionName}_list_${JSON.stringify(queryDef)}`;
  const cachedList = dbCache.get(cacheKey);
  if (cachedList !== null) {
    return {
      empty: cachedList.length === 0,
      size: cachedList.length,
      docs: cachedList.map((item: any) => ({
        id: item.id,
        exists: () => true,
        data: () => item
      }))
    };
  }

  let rawRows: any[] = [];

  if (isSupabaseConfigured && supabase) {
    try {
      let req = supabase.from(mapping.table).select('*');

      // Extract and apply filters if QueryRef
      if ('filters' in queryDef) {
        queryDef.filters.forEach(filter => {
          const dbField = mapKeysToDB(mapping.table, { [filter.field]: '' });
          const keyName = Object.keys(dbField)[0];

          if (filter.condition === '==') {
            req = req.eq(keyName, filter.value);
          } else if (filter.condition === '>') {
            req = req.gt(keyName, filter.value);
          } else if (filter.condition === '<') {
            req = req.lt(keyName, filter.value);
          }
        });

        if (queryDef.orderByField) {
          const dbOrderField = mapKeysToDB(mapping.table, { [queryDef.orderByField]: '' });
          const keyName = Object.keys(dbOrderField)[0];
          req = req.order(keyName, { ascending: queryDef.orderDirection === 'asc' });
        }

        if (queryDef.limitCount) {
          req = req.limit(queryDef.limitCount);
        }
      }

      const { data, error } = await req;
      if (error) throw error;
      rawRows = data || [];
      lastDatabaseError = null; // Clear if successful
    } catch (err: any) {
      log(`Failed getDocs remote query on ${collectionName}:`, err);
      lastDatabaseError = err?.message || JSON.stringify(err);
      rawRows = [];
    }
  } else {
    // Sandbox mode queries
    let rows = localDb.getDocs(mapping.table);

    if ('filters' in queryDef) {
      queryDef.filters.forEach(filter => {
        rows = rows.filter(r => r[filter.field] === filter.value);
      });

      if (queryDef.orderByField) {
        const field = queryDef.orderByField;
        const dir = queryDef.orderDirection || 'asc';
        rows.sort((a, b) => {
          if (a[field] < b[field]) return dir === 'asc' ? -1 : 1;
          if (a[field] > b[field]) return dir === 'asc' ? 1 : -1;
          return 0;
        });
      }

      if (queryDef.limitCount) {
        rows = rows.slice(0, queryDef.limitCount);
      }
    }
    rawRows = rows;
  }

  const mappedRows = rawRows.map(row => mapKeysFromDB(mapping.table, row));
  dbCache.set(cacheKey, mappedRows, 15000); // cache lists for 15s

  return {
    empty: mappedRows.length === 0,
    size: mappedRows.length,
    docs: mappedRows.map(row => ({
      id: row.id || Math.random().toString(),
      exists: () => true,
      data: () => row
    }))
  };
}

// 5. Atomic Transactions & Increment Helpers

export function increment(amount: number) {
  return { _type: 'increment', amount };
}

export async function runTransaction(dbInstance: any, updateFunction: (transaction: { get: (ref: DocRef) => Promise<any>; set: (ref: DocRef, data: any) => void; update: (ref: DocRef, data: any) => void }) => Promise<any>) {
  log("Running serialized fallback transaction...");
  const tempSet: { [key: string]: any } = {};
  
  const txn = {
    get: async (ref: DocRef) => {
      const live = await getDoc(ref);
      return {
        exists: () => live.exists(),
        data: () => live.data()
      };
    },
    set: (ref: DocRef, data: any) => {
      tempSet[`${ref.collectionName}/${ref.docId}`] = { type: 'set', ref, data };
    },
    update: (ref: DocRef, data: any) => {
      tempSet[`${ref.collectionName}/${ref.docId}`] = { type: 'update', ref, data };
    }
  };

  const result = await updateFunction(txn);

  // Apply atomic changes sequentially
  for (const k of Object.keys(tempSet)) {
    const edit = tempSet[k];
    if (edit.type === 'set') {
      await setDoc(edit.ref, edit.data);
    } else {
      await updateDoc(edit.ref, edit.data);
    }
  }

  return result;
}

// 6. Real-time Subscriptions (onSnapshot adapter)

export function onSnapshot(
  documentRef: DocRef, 
  onNext: (snapshot: any) => void, 
  onError?: (err: any) => void
): () => void {
  const { collectionName, docId } = documentRef;
  const fullPath = `${collectionName}/${docId}`;
  log(`Setting up Real-time Snapshot on ${fullPath}`);

  let active = true;

  // Active snapshot poll fallback (highly stable across iframe contexts & networks)
  const pollTimer = setInterval(async () => {
    if (!active) return;
    try {
      const updated = await getDoc(documentRef);
      if (active) {
        onNext({
          exists: () => updated.exists(),
          data: () => updated.data()
        });
      }
    } catch (e) {
      // quiet poll error
    }
  }, 1500);

  // If Supabase real-time is available, we can also bind a websocket listener
  let channel: any = null;
  if (isSupabaseConfigured && supabase) {
    const mapping = mapCollectionToTable(fullPath);
    if (mapping.isKV) {
      channel = supabase
        .channel(`realtime_${mapping.mappingKey}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: mapping.table, filter: `key=eq.${mapping.mappingKey}` },
          async (payload) => {
            if (!active) return;
            log(`Live snapshot record sync update received:`, payload);
            const updated = await getDoc(documentRef);
            if (active) {
              onNext({
                exists: () => updated.exists(),
                data: () => updated.data()
              });
            }
          }
        )
        .subscribe();
    }
  }

  // Initial trigger
  getDoc(documentRef).then(snap => {
    if (active) onNext(snap);
  });

  return () => {
    active = false;
    clearInterval(pollTimer);
    if (channel && supabase) {
      supabase.removeChannel(channel);
    }
  };
}
