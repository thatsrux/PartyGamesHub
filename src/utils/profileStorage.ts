export interface StoredUserProfile {
  name: string;
  photo?: string | null;
  gameSettings?: Record<string, any>;
  updatedAt?: number;
}

export const PROFILE_STORAGE_KEY = 'partyhub.profile.v2';
export const PROFILE_CHANGED_EVENT = 'partyhub:profile-changed';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export function normalizeProfile(value: unknown): StoredUserProfile | null {
  if (!isRecord(value) || typeof value.name !== 'string') return null;

  const name = value.name.trim().slice(0, 15);
  if (!name) return null;

  const profile: StoredUserProfile = { name };
  if (typeof value.photo === 'string' && value.photo.startsWith('data:image/')) {
    profile.photo = value.photo;
  } else if (value.photo === null) {
    profile.photo = null;
  }
  if (isRecord(value.gameSettings)) profile.gameSettings = value.gameSettings;
  if (typeof value.updatedAt === 'number' && Number.isFinite(value.updatedAt)) {
    profile.updatedAt = value.updatedAt;
  }

  return profile;
}

export function readCachedProfile(): StoredUserProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? normalizeProfile(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function writeCachedProfile(profile: StoredUserProfile | null): void {
  try {
    if (profile) localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    else localStorage.removeItem(PROFILE_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(PROFILE_CHANGED_EVENT, { detail: profile }));
  } catch {
    // Private browsing and full storage must not prevent playing.
  }
}

export function selectNewestProfile(
  localProfile: StoredUserProfile | null,
  remoteProfile: StoredUserProfile | null,
): StoredUserProfile | null {
  if (!remoteProfile) return localProfile;
  if (!localProfile) return remoteProfile;

  const localUpdatedAt = localProfile.updatedAt || 0;
  const remoteUpdatedAt = remoteProfile.updatedAt || 0;
  return localUpdatedAt > remoteUpdatedAt ? localProfile : remoteProfile;
}
