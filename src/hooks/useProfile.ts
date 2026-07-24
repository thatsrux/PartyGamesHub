import { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from '../firebase';

export interface UserProfile {
  name: string;
  photo?: string; // base64 string
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
    
    const dataToSave: UserProfile = { name };
    if (photoBase64) {
      dataToSave.photo = photoBase64;
    }

    await set(userRef, dataToSave);
  };

  return { userId, profile, saveProfile, loading };
}
