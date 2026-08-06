import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, set, update, remove } from 'firebase/database';
import { db } from '../firebase';
import { ensureAuthenticatedUser } from '../services/authSession';
import {
  PROFILE_CHANGED_EVENT,
  PROFILE_STORAGE_KEY,
  normalizeProfile,
  readCachedProfile,
  selectNewestProfile,
  writeCachedProfile,
  type StoredUserProfile,
} from '../utils/profileStorage';

export type UserProfile = StoredUserProfile;

export function useProfile() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => readCachedProfile());
  const [loading, setLoading] = useState(true);

  // Auth
  useEffect(() => {
    let active = true;
    ensureAuthenticatedUser()
      .then((user) => {
        if (active) setUserId(user.uid);
      })
      .catch((err) => {
        console.error("Auth error in useProfile:", err);
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  // Fetch profile
  useEffect(() => {
    if (!userId) return;

    const userRef = ref(db, `users/${userId}`);
    const unsubscribe = onValue(userRef, async (snapshot) => {
      const localProfile = readCachedProfile();
      const remoteProfile = snapshot.exists() ? normalizeProfile(snapshot.val()) : null;
      const selectedProfile = selectNewestProfile(localProfile, remoteProfile);

      setProfile(selectedProfile);
      writeCachedProfile(selectedProfile);
      setLoading(false);

      if (selectedProfile && selectedProfile === localProfile && selectedProfile !== remoteProfile) {
        await set(userRef, selectedProfile).catch((error) => {
          console.warn('Profile recovery sync failed:', error);
        });
      }
    }, (error) => {
      console.error('Profile read error:', error);
      setProfile(readCachedProfile());
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    const syncFromCache = () => setProfile(readCachedProfile());
    const syncFromStorage = (event: StorageEvent) => {
      if (event.key === PROFILE_STORAGE_KEY) syncFromCache();
    };
    window.addEventListener(PROFILE_CHANGED_EVENT, syncFromCache);
    window.addEventListener('storage', syncFromStorage);
    return () => {
      window.removeEventListener(PROFILE_CHANGED_EVENT, syncFromCache);
      window.removeEventListener('storage', syncFromStorage);
    };
  }, []);

  const saveProfile = useCallback(async (name: string, photo: string | null = null) => {
    const cleanName = name.trim().slice(0, 15);
    if (!cleanName) throw new Error('Il nickname non può essere vuoto.');

    const current = readCachedProfile();
    const nextProfile: UserProfile = {
      ...current,
      name: cleanName,
      photo,
      updatedAt: Date.now(),
    };
    setProfile(nextProfile);
    writeCachedProfile(nextProfile);

    const uid = userId || (await ensureAuthenticatedUser()).uid;
    await update(ref(db, `users/${uid}`), {
      name: cleanName,
      photo,
      updatedAt: nextProfile.updatedAt,
    });
  }, [userId]);

  const saveGameSettings = useCallback(async (gameId: string, settings: unknown) => {
    // Firebase Realtime DB throws an error if any property is explicitly 'undefined'.
    // JSON parse/stringify safely strips all undefined keys.
    const cleanSettings = JSON.parse(JSON.stringify(settings));
    const current = readCachedProfile();
    if (!current) throw new Error('Crea prima il profilo.');
    const nextProfile: UserProfile = {
      ...current,
      gameSettings: { ...(current.gameSettings || {}), [gameId]: cleanSettings },
      updatedAt: Date.now(),
    };
    setProfile(nextProfile);
    writeCachedProfile(nextProfile);

    const uid = userId || (await ensureAuthenticatedUser()).uid;
    await update(ref(db, `users/${uid}`), {
      [`gameSettings/${gameId}`]: cleanSettings,
      updatedAt: nextProfile.updatedAt,
    });
  }, [userId]);

  const resetAllGameSettings = useCallback(async () => {
    const current = readCachedProfile();
    if (current) {
      const nextProfile = { ...current, gameSettings: {}, updatedAt: Date.now() };
      setProfile(nextProfile);
      writeCachedProfile(nextProfile);
    }
    const uid = userId || (await ensureAuthenticatedUser()).uid;
    await remove(ref(db, `users/${uid}/gameSettings`));
    await update(ref(db, `users/${uid}`), { updatedAt: Date.now() });
  }, [userId]);

  return { userId, profile, saveProfile, saveGameSettings, resetAllGameSettings, loading };
}
