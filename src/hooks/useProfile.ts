import { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
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
    
    // Preserve existing settings if they exist
    const dataToSave: UserProfile = { name };
    if (photoBase64) {
      dataToSave.photo = photoBase64;
    }
    if (profile?.gameSettings) {
      dataToSave.gameSettings = profile.gameSettings;
    }

    await set(userRef, dataToSave);
  };

  const saveGameSettings = async (gameId: string, settings: any) => {
    if (!userId) return;
    const userRef = ref(db, `users/${userId}`);
    
    const newSettings = {
      ...(profile?.gameSettings || {}),
      [gameId]: settings
    };

    const dataToSave: UserProfile = { ...(profile || { name: 'Player' }), gameSettings: newSettings };
    
    // Firebase Realtime DB throws an error if any property is explicitly 'undefined'.
    // JSON parse/stringify safely strips all undefined keys.
    const cleanData = JSON.parse(JSON.stringify(dataToSave));
    await set(userRef, cleanData);
  };

  const resetAllGameSettings = async () => {
    if (!userId) return;
    const userRef = ref(db, `users/${userId}`);
    
    const { gameSettings, ...rest } = profile || { name: 'Player' } as any;
    const dataToSave: UserProfile = rest;
    
    await set(userRef, dataToSave);
  };

  return { userId, profile, saveProfile, saveGameSettings, resetAllGameSettings, loading };
}
