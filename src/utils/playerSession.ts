export interface SessionPlayer {
  name: string;
  photo?: string | null;
  score: number;
  isReady?: boolean;
  isAdmin?: boolean;
  joinedAt?: number;
}

export function mergePlayerSession(
  current: SessionPlayer | null,
  identity: { name: string; photo: string | null; isAdmin?: boolean },
  now = Date.now(),
): SessionPlayer {
  const cleanName = identity.name.trim().slice(0, 15);

  if (!current) {
    return {
      name: cleanName,
      photo: identity.photo,
      score: 0,
      isReady: true,
      isAdmin: identity.isAdmin || false,
      joinedAt: now,
    };
  }

  return {
    ...current,
    name: cleanName,
    photo: identity.photo,
    score: Number.isFinite(current.score) ? current.score : 0,
    isReady: true,
    isAdmin: current.isAdmin ?? identity.isAdmin ?? false,
    joinedAt: current.joinedAt || now,
  };
}
