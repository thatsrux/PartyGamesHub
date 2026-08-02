import { useState, useEffect } from 'react';
import { ref, onValue, set, update, remove } from 'firebase/database';
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from '../firebase';

export interface UserProfile {
  name: string;
  photo?: string; // base64 string
  gameSettings?: Record<string, any>;
}

export function useProfile() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth
  useEffect(() => {
    signInAnonymously(auth)
      .then((userCredential) => {
        setUserId(userCredential.user.uid);
      })
      .catch((err) => {
        console.error("Auth error in useProfile:", err);
        setLoading(false);
      });
  }, []);

  // Fetch profile
  useEffect(() => {
    if (!userId) return;

    const userRef = ref(db, `users/${userId}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.val());
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const saveProfile = async (name: string, photoBase64?: string) => {
    if (!userId) return;
    const userRef = ref(db, `users/${userId}`);
    
    const updates: any = { name };
    if (photoBase64 !== undefined) {
      updates.photo = photoBase64;
    }

    await update(userRef, updates);
  };

  const saveGameSettings = async (gameId: string, settings: any) => {
    if (!userId) return;
    const gameSettingsRef = ref(db, `users/${userId}/gameSettings/${gameId}`);
    
    // Firebase Realtime DB throws an error if any property is explicitly 'undefined'.
    // JSON parse/stringify safely strips all undefined keys.
    const cleanSettings = JSON.parse(JSON.stringify(settings));
    await set(gameSettingsRef, cleanSettings);
  };

  const resetAllGameSettings = async () => {
    if (!userId) return;
    const gameSettingsRef = ref(db, `users/${userId}/gameSettings`);
    await remove(gameSettingsRef);
  };

  return { userId, profile, saveProfile, saveGameSettings, resetAllGameSettings, loading };
}
