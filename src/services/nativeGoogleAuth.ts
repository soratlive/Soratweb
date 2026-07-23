import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

export interface NativeGoogleUser {
  idToken?: string;
  accessToken?: string;
  email: string | null;
  displayName: string | null;
  photoUrl: string | null;
  uid?: string;
}

export const isAndroidNative = (): boolean =>
  Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';

export const signInWithNativeGoogle = async (): Promise<NativeGoogleUser | null> => {
  if (!isAndroidNative()) return null;

  const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error('Missing VITE_GOOGLE_CLIENT_ID');

  await GoogleAuth.initialize({
    clientId,
    scopes: ['profile', 'email'],
    grantOfflineAccess: true,
  });

  const googleUser = await GoogleAuth.signIn();

  return {
    idToken: googleUser.authentication?.idToken,
    accessToken: googleUser.authentication?.accessToken,
    email: googleUser.email ?? null,
    displayName: googleUser.name ?? null,
    photoUrl: googleUser.imageUrl ?? null,
    uid: googleUser.id,
  };
};

export const getCurrentNativeUser = async (): Promise<NativeGoogleUser | null> => {
  if (!isAndroidNative()) return null;
  try {
    const user = await GoogleAuth.getSignedInUser();
    return {
      idToken: user.authentication?.idToken,
      accessToken: user.authentication?.accessToken,
      email: user.email ?? null,
      displayName: user.name ?? null,
      photoUrl: user.imageUrl ?? null,
      uid: user.id,
    };
  } catch {
    return null;
  }
};

export const signOutNativeGoogle = async (): Promise<void> => {
  if (!isAndroidNative()) return;
  await GoogleAuth.signOut();
};
