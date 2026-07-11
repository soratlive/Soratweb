import { Client, Account, Databases, Storage, ID, Query, OAuthProvider } from 'appwrite';

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
export const SCREENSHOTS_BUCKET_ID = (import.meta as any).env?.VITE_APPWRITE_BUCKET_ID || 'screenshots';

// Initialize the Appwrite Client explicitly with custom domain and project ID
export const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

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
      // Dynamically match browser context for the backup/production OAuth redirects saved in the console
      const currentOrigin = typeof window !== 'undefined' && window.location ? window.location.origin : '';
      const redirectUrl = currentOrigin && (currentOrigin.includes('sorat') || currentOrigin.includes('localhost') || currentOrigin.includes('run.app'))
        ? currentOrigin
        : 'https://play.sorat.in';
      
      await account.createOAuth2Session(
        OAuthProvider.Google,
        redirectUrl,
        redirectUrl
      );
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
   * Upload screenshot proof image to Appwrite screenshots Bucket
   */
  uploadScreenshot: async (base64Image: string): Promise<string> => {
    try {
      console.log('[Appwrite Storage] Uploading screenshot to bucket...');
      const fileId = ID.unique();
      const file = base64ToFile(base64Image, `proof_${Date.now()}.png`);
      
      const response = await storage.createFile(
        SCREENSHOTS_BUCKET_ID,
        fileId,
        file
      );

      // Construct direct URL to view/download uploaded screenshot file
      const directUrl = `${ENDPOINT}/storage/buckets/${SCREENSHOTS_BUCKET_ID}/files/${response.$id}/view?project=${PROJECT_ID}`;
      console.log('[Appwrite Storage] Screenshot uploaded successfully. URL:', directUrl);
      return directUrl;
    } catch (error) {
      console.error('[Appwrite Storage] Upload failed, falling back to mock hosting:', error);
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
  }
};
