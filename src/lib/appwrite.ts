import { Client, Account, Databases, Storage, ID, Query, OAuthProvider, Functions } from 'appwrite';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

// Read endpoints and project ID with explicit custom domain and project ID as requested
const ENDPOINT = 'https://api.sorat.in/v1';
const PROJECT_ID = (import.meta as any).env?.VITE_APPWRITE_PROJECT_ID || '6a4e644b001268fb3a25';

// Export App URL variables for the application
export const APP_URL = (import.meta as any).env?.VITE_APP_URL || 'https://play.sorat.in';
export const VITE_APP_URL = (import.meta as any).env?.VITE_APP_URL || 'https://play.sorat.in';

// Database, Collection, and Storage configurations
export const DATABASE_ID = (import.meta as any).env?.VITE_APPWRITE_DATABASE_ID || 'main';
export const USERS_COLLECTION_ID = (import.meta as any).env?.VITE_APPWRITE_USERS_COLLECTION_ID || 'users';
export const PROOFS_COLLECTION_ID = (import.meta as any).env?.VITE_APPWRITE_PROOFS_COLLECTION_ID || 'payment_proofs';
export const SCREENSHOTS_BUCKET_ID = (import.meta as any).env?.VITE_APPWRITE_BUCKET_ID || '6a4e72f90022e90bc15b';
export const TIMER_COLLECTION_ID = (import.meta as any).env?.VITE_APPWRITE_TIMER_COLLECTION_ID || 'timer_sync';

// Initialize the Appwrite Client explicitly with custom domain and project ID
export const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// Helper function to convert base64 image strings into native Files for Appwrite Storage
function base64ToFile(base64String: string, filename: string): File {
  const arr = base64String.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

// Highly reliable Appwrite Service
export const appwriteService = {
  /**
   * Triggers native Appwrite Google OAuth Login (compatible with Web and Android APK redirects)
   */
  signInWithGoogle: async (): Promise<void> => {
    try {
      console.log('[Appwrite Auth] Starting Google OAuth session...');
      const isNative = Capacitor.isNativePlatform();
      
      if (!isNative) {
        // Web/PWA or local desktop browser context
        const currentOrigin = typeof window !== 'undefined' && window.location ? window.location.origin : '';
        const redirectUrl = currentOrigin && (currentOrigin.includes('sorat') || currentOrigin.includes('localhost') || currentOrigin.includes('run.app'))
          ? currentOrigin
          : 'https://play.sorat.in';
        
        // Use prompt=select_account in standard browser to allow switching/selecting from multiple logged-in accounts
        const successWithPrompt = redirectUrl + (redirectUrl.endsWith('/') ? '' : '/') + '?prompt=select_account';
        
        await account.createOAuth2Session(
          OAuthProvider.Google,
          successWithPrompt,
          redirectUrl
        );
      } else {
        // ON MOBILE APK (Capacitor Native):
        // 1. Construct the Appwrite OAuth URL manually
        // 2. Add prompt=select_account so Google shows all Gmail accounts present on the device
        // 3. Use the custom scheme of the app (com.sorat.game://) so it deep-links back into the APK
        const appId = 'com.sorat.game';
        const successUrl = `${appId}://oauth-success`;
        const failureUrl = `${appId}://oauth-failure`;
        
        const oauthUrl = `${ENDPOINT}/account/oauth2/google?project=${PROJECT_ID}&scopes[]=email&scopes[]=profile&success=${encodeURIComponent(successUrl)}&failure=${encodeURIComponent(failureUrl)}&prompt=select_account`;
        
        console.log('[Appwrite Auth] Opening OAuth URL in Custom Tab / System Browser:', oauthUrl);
        await Browser.open({ url: oauthUrl, windowName: '_system' });
      }
    } catch (error) {
      console.error('[Appwrite Auth] Google OAuth failed:', error);
      throw error;
    }
  },

  /**
   * Log out of the current active session
   */
  logout: async (): Promise<void> => {
    try {
      await account.deleteSession('current');
      localStorage.removeItem('appwrite_session_user');
      console.log('[Appwrite Auth] User logged out successfully');
    } catch (error) {
      console.error('[Appwrite Auth] Logout error:', error);
      throw error;
    }
  },

  /**
   * Retrieves the current logged-in user profile, and ensures they have a document in the users database.
   */
  getCurrentUser: async (): Promise<any> => {
    let user: any = null;
    try {
      user = await account.get();
    } catch (error) {
      console.log('[Appwrite Auth] No active session found (account.get failed):', error);
      return null;
    }

    if (!user) return null;

    // Check if user has a corresponding document in D1/Appwrite DB users collection
    let userDoc: any = null;
    try {
      userDoc = await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, user.$id);
    } catch (docErr: any) {
      // Document does not exist, let's create it!
      if (docErr.code === 404 || docErr.message?.includes('not found')) {
        console.log(`[Appwrite DB] Creating new user record for ${user.email}`);
        try {
          userDoc = await databases.createDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            user.$id,
            {
              id: user.$id,
              name: user.name || user.email?.split('@')[0] || 'Player',
              email: user.email,
              role: user.email === 'admin@sorat.live' || user.email === 'nikhilrv8055@gmail.com' ? 'admin' : 'user',
              balance: 500.00 // Default starting balance
            }
          );
        } catch (createErr) {
          console.warn('[Appwrite DB] Failed to create user document:', createErr);
        }
      } else {
        console.warn('[Appwrite DB] Failed to fetch user document:', docErr);
      }
    }

    return {
      uid: user.$id,
      email: user.email,
      displayName: user.name || user.email?.split('@')[0] || 'Player',
      role: userDoc?.role || (user.email === 'admin@sorat.live' || user.email === 'nikhilrv8055@gmail.com' ? 'admin' : 'user'),
      balance: userDoc?.balance !== undefined ? userDoc.balance : 500.00
    };
  },

  /**
   * Fetches user balance directly from the DB
   */
  getUserBalance: async (userId: string): Promise<number> => {
    try {
      const userDoc = await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, userId);
      return userDoc.balance || 0;
    } catch (error) {
      console.warn('[Appwrite DB] Failed to fetch user balance, falling back to 0:', error);
      return 0;
    }
  },

  /**
   * Updates balance of a specific user inside Appwrite Database
   */
  updateUserBalance: async (userId: string, newBalance: number): Promise<void> => {
    try {
      await databases.updateDocument(DATABASE_ID, USERS_COLLECTION_ID, userId, {
        balance: newBalance
      });
      console.log(`[Appwrite DB] Balance updated for user ${userId} to ₹${newBalance}`);
    } catch (error) {
      console.error('[Appwrite DB] Failed to update balance:', error);
      throw error;
    }
  },

  /**
   * Updates balance of a specific user securely using Appwrite Functions bypass
   */
  updateUserBalanceViaFunction: async (userId: string, amount: number, actionType: 'add' | 'remove' | 'set', adminSecret: string): Promise<any> => {
    try {
      console.log(`[Appwrite Functions] Triggering bypass balance update for user ${userId} with action ${actionType}, amount ₹${amount}...`);
      const execution = await functions.createExecution(
        'timer-sync', // Function ID
        JSON.stringify({
          action: 'updateBalance',
          userId,
          amount,
          actionType,
          adminSecret
        })
      );
      
      const responseBody = execution.responseBody;
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseBody);
      } catch {
        parsedResponse = { error: responseBody };
      }
      
      if (execution.status === 'failed' || (parsedResponse && parsedResponse.success === false)) {
        throw new Error(parsedResponse.error || 'Appwrite Function execution failed');
      }
      
      console.log('[Appwrite Functions] Secure bypass balance update success:', parsedResponse);
      return parsedResponse;
    } catch (error) {
      console.error('[Appwrite Functions] Secure bypass balance update failed:', error);
      throw error;
    }
  },

  /**
   * Upload screenshot proof image to Appwrite screenshots Bucket
   */
  uploadScreenshot: async (fileOrBase64: File | string): Promise<{ fileId: string; url: string }> => {
    try {
      console.log('[Appwrite Storage] Uploading screenshot to bucket...');
      const fileId = ID.unique();
      
      let file: File;
      if (fileOrBase64 instanceof File) {
        file = fileOrBase64;
        console.log('[Appwrite Storage] Using native File object directly for upload:', file.name);
      } else if (typeof fileOrBase64 === 'string' && fileOrBase64.startsWith('data:')) {
        file = base64ToFile(fileOrBase64, `proof_${Date.now()}.png`);
        console.log('[Appwrite Storage] Converted base64 string to native File object');
      } else {
        // Attempt to find via DOM ID 'file' as requested
        const fileInput = typeof document !== 'undefined' ? (document.getElementById('file') as HTMLInputElement) : null;
        if (fileInput && fileInput.files && fileInput.files[0]) {
          file = fileInput.files[0];
          console.log('[Appwrite Storage] Found file input via DOM document.getElementById("file"):', file.name);
        } else if (typeof fileOrBase64 === 'string') {
          // Standard string representation
          file = base64ToFile(fileOrBase64, `proof_${Date.now()}.png`);
        } else {
          throw new Error('No valid File object, base64 string, or input#file element with a file was found.');
        }
      }
      
      const response = await storage.createFile(
        SCREENSHOTS_BUCKET_ID,
        fileId,
        file
      );

      // Generate File URL using storage.getFileView as explicitly requested
      const fileViewUrl = storage.getFileView(SCREENSHOTS_BUCKET_ID, response.$id).toString();
      console.log('[Appwrite Storage] Screenshot uploaded successfully via getFileView. URL:', fileViewUrl);
      return { fileId: response.$id, url: fileViewUrl };
    } catch (error) {
      console.error('[Appwrite Storage] Upload failed:', error);
      throw error;
    }
  },

  /**
   * Upload APK file to Appwrite storage Bucket
   */
  uploadApkFile: async (file: File): Promise<string> => {
    try {
      console.log('[Appwrite Storage] Uploading APK file to bucket...');
      const fileId = ID.unique();
      const response = await storage.createFile(
        SCREENSHOTS_BUCKET_ID,
        fileId,
        file
      );

      // Construct direct URL to view/download uploaded APK file
      const directUrl = `${ENDPOINT}/storage/buckets/${SCREENSHOTS_BUCKET_ID}/files/${response.$id}/view?project=${PROJECT_ID}`;
      console.log('[Appwrite Storage] APK file uploaded successfully. URL:', directUrl);
      return directUrl;
    } catch (error) {
      console.error('[Appwrite Storage] APK upload failed:', error);
      throw error;
    }
  },

  /**
   * Submits a new payment proof entry into database
   */
  createPaymentProof: async (proofData: { id: string, user_email: string, screenshot_url: string, amount: number }): Promise<any> => {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        PROOFS_COLLECTION_ID,
        proofData.id,
        {
          id: proofData.id,
          user_email: proofData.user_email,
          screenshot_url: proofData.screenshot_url,
          amount: parseFloat(proofData.amount as any),
          status: 'pending',
          created_at: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('[Appwrite DB] Failed to create payment proof:', error);
      throw error;
    }
  },

  /**
   * Retrieve list of all uploaded payment proofs for Admin dashboard
   */
  getPaymentProofs: async (): Promise<any[]> => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        PROOFS_COLLECTION_ID,
        [Query.orderDesc('created_at')]
      );
      return response.documents;
    } catch (error) {
      console.warn('[Appwrite DB] Failed to list payment proofs, returning empty array:', error);
      return [];
    }
  },

  /**
   * Approve or reject a payment proof, automatically credits coins to user's balance on approval
   */
  updatePaymentProofStatus: async (proofId: string, status: 'approved' | 'rejected'): Promise<any> => {
    try {
      // 1. Fetch current proof document
      const proof = await databases.getDocument(DATABASE_ID, PROOFS_COLLECTION_ID, proofId);
      if (!proof) throw new Error('Proof not found');

      if (proof.status !== 'pending') {
        throw new Error('This payment proof has already been processed.');
      }

      // 2. Update proof status
      const updatedProof = await databases.updateDocument(
        DATABASE_ID,
        PROOFS_COLLECTION_ID,
        proofId,
        { status }
      );

      // 3. If approved, query for the user with matching email to credit their balance
      if (status === 'approved') {
        const userList = await databases.listDocuments(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          [Query.equal('email', proof.user_email)]
        );

        if (userList.documents.length > 0) {
          const targetUser = userList.documents[0];
          const currentBalance = targetUser.balance || 0;
          const newBalance = currentBalance + (proof.amount || 0);

          await databases.updateDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            targetUser.$id,
            { balance: newBalance }
          );
          console.log(`[Appwrite DB] Added ₹${proof.amount} to user ${proof.user_email}`);
        } else {
          console.warn(`[Appwrite DB] Target user with email ${proof.user_email} not found to credit balance.`);
        }
      }

      return updatedProof;
    } catch (error) {
      console.error('[Appwrite DB] Failed to update payment proof status:', error);
      throw error;
    }
  },

  /**
   * Real-time user document listener
   */
  subscribeToUser: (userId: string, onUpdate: (userDoc: any) => void): (() => void) => {
    const channel = `databases.${DATABASE_ID}.collections.${USERS_COLLECTION_ID}.documents.${userId}`;
    console.log(`[Appwrite Realtime] Subscribing to: ${channel}`);
    
    return client.subscribe(channel, (response) => {
      onUpdate(response.payload);
    });
  },

  /**
   * Fetches the central global timer state from Appwrite
   */
  getGlobalTimerState: async (): Promise<{ current_round: string; time_left: number; status: string } | null> => {
    try {
      const doc = await databases.getDocument(DATABASE_ID, TIMER_COLLECTION_ID, 'current');
      return {
        current_round: doc.current_round || '1001',
        time_left: doc.time_left !== undefined ? doc.time_left : 45,
        status: doc.status || 'active'
      };
    } catch (error) {
      console.warn('[Appwrite DB] Failed to fetch global timer state:', error);
      return null;
    }
  },

  /**
   * Real-time global timer document listener
   */
  subscribeToGlobalTimer: (onUpdate: (timerDoc: any) => void): (() => void) => {
    const channel = `databases.${DATABASE_ID}.collections.${TIMER_COLLECTION_ID}.documents.current`;
    console.log(`[Appwrite Realtime] Subscribing to global timer: ${channel}`);
    
    return client.subscribe(channel, (response) => {
      onUpdate(response.payload);
    });
  }
};
