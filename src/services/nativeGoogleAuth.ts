import { Capacitor, registerPlugin } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

export interface NativeGoogleUser {
  idToken?: string;
  accessToken?: string;
  email: string | null;
  displayName: string | null;
  photoUrl: string | null;
  uid?: string;
}

export interface NativeGoogleAuthPlugin {
  signIn(options: { serverClientId?: string; autoSelect?: boolean }): Promise<{
    uid?: string;
    email: string;
    displayName: string;
    photoUrl: string;
    idToken: string;
    accessToken?: string;
  }>;
  getCurrentUser(): Promise<NativeGoogleUser | null>;
  signOut(): Promise<{ success: boolean }>;
}

// Register the custom Android CredentialManager plugin registered in MainActivity.kt
const CustomGoogleAuth = registerPlugin<NativeGoogleAuthPlugin>('GoogleAuthPlugin');

/**
 * Utility to check if running inside Android native Capacitor runtime.
 */
export const isAndroidNative = (): boolean => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
};

/**
 * Triggers native Google account picker on Android using Credential Manager / Google Identity Services.
 * Falls back to standard Capacitor GoogleAuth or returns null if on Web browser.
 */
export const signInWithNativeGoogle = async (serverClientId?: string): Promise<NativeGoogleUser | null> => {
  if (!isAndroidNative()) {
    console.log('[NativeGoogleAuth] Not running on Android native platform. Returning null for web login fallback.');
    return null;
  }

  const clientId = serverClientId || (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '1048684722435-client-id.apps.googleusercontent.com';

  try {
    console.log('[NativeGoogleAuth] Attempting sign in via Android CredentialManager...');
    const result = await CustomGoogleAuth.signIn({
      serverClientId: clientId,
      autoSelect: false,
    });

    return {
      idToken: result.idToken,
      accessToken: result.accessToken,
      email: result.email || null,
      displayName: result.displayName || null,
      photoUrl: result.photoUrl || null,
      uid: result.uid,
    };
  } catch (customErr: any) {
    console.warn('[NativeGoogleAuth] Custom GoogleAuthPlugin encountered an error, attempting standard Capacitor GoogleAuth fallback:', customErr);

    try {
      GoogleAuth.initialize({
        clientId: clientId,
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      }).catch(() => {});

      const googleUser = await GoogleAuth.signIn();
      return {
        idToken: googleUser.authentication?.idToken,
        accessToken: googleUser.authentication?.accessToken,
        email: googleUser.email || null,
        displayName: googleUser.name || null,
        photoUrl: googleUser.imageUrl || null,
        uid: googleUser.id,
      };
    } catch (pluginErr: any) {
      console.error('[NativeGoogleAuth] Native Google Sign-In failed:', pluginErr);
      throw pluginErr;
    }
  }
};

/**
 * Returns current authenticated user if logged in natively.
 */
export const getCurrentNativeUser = async (): Promise<NativeGoogleUser | null> => {
  if (!isAndroidNative()) return null;

  try {
    return await CustomGoogleAuth.getCurrentUser();
  } catch {
    return null;
  }
};

/**
 * Signs out from native Google account session on Android.
 */
export const signOutNativeGoogle = async (): Promise<void> => {
  if (!isAndroidNative()) return;

  try {
    await CustomGoogleAuth.signOut();
  } catch {
    try {
      await GoogleAuth.signOut();
    } catch {}
  }
};
