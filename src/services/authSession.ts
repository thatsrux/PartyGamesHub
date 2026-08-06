import { signInAnonymously, type User } from 'firebase/auth';
import { auth } from '../firebase';

let authenticationPromise: Promise<User> | null = null;

/**
 * Uses one shared authentication request for the whole app. Firebase restores
 * the anonymous user from IndexedDB, so the same device keeps the same account
 * across reloads and browser restarts.
 */
export function ensureAuthenticatedUser(): Promise<User> {
  if (auth.currentUser) return Promise.resolve(auth.currentUser);

  if (!authenticationPromise) {
    authenticationPromise = auth.authStateReady()
      .then(async () => auth.currentUser || (await signInAnonymously(auth)).user)
      .catch((error) => {
        authenticationPromise = null;
        throw error;
      });
  }

  return authenticationPromise;
}
