import { useState, useEffect } from 'react';
import { ref, set, onValue, update, remove, onDisconnect } from 'firebase/database';
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from '../firebase';

export interface Player {
  name: string;
  photo?: string;
  score: number;
  isReady?: boolean;
  isAdmin?: boolean;
  joinedAt?: number;
}

export interface LobbyState {
  status: 'waiting' | 'playing' | 'finished';
  game_selected: string;
  host_id: string;
  players: Record<string, Player>;
  game_state?: any;
}

export function useLobby(lobbyCode: string | null) {
  const [lobby, setLobby] = useState<LobbyState | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Authenticate anonymously
  useEffect(() => {
    signInAnonymously(auth)
      .then((userCredential) => {
        setUserId(userCredential.user.uid);
      })
      .catch((err) => {
        console.error("Auth error:", err);
        setError("Errore di connessione");
      });
  }, []);

  // Listen to lobby changes
  useEffect(() => {
    if (!lobbyCode || !userId) return;

    const lobbyRef = ref(db, `lobbies/${lobbyCode}`);
    
    const unsubscribe = onValue(lobbyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setLobby(data);
      } else {
        setLobby(null);
      }
    });

    return () => unsubscribe();
  }, [lobbyCode, userId]);

  // Auto-promote admin
  useEffect(() => {
    if (!lobbyCode || !userId || !lobby?.players) return;

    const playersArray = Object.entries(lobby.players);
    if (playersArray.length === 0) return;

    const hasAdmin = playersArray.some(([_, p]) => p.isAdmin);
    
    if (!hasAdmin) {
      // Find the player with the oldest joinedAt
      const sortedPlayers = playersArray.sort((a, b) => (a[1].joinedAt || 0) - (b[1].joinedAt || 0));
      const nextAdminId = sortedPlayers[0]?.[0];
      
      // If I am the next admin, I promote myself
      if (nextAdminId === userId) {
        const playerRef = ref(db, `lobbies/${lobbyCode}/players/${userId}`);
        update(playerRef, { isAdmin: true });
      }
    }
  }, [lobby?.players, userId, lobbyCode]);

  const createLobby = async (code: string) => {
    if (!userId) return;
    const lobbyRef = ref(db, `lobbies/${code}`);
    
    // We intentionally do NOT delete the lobby when the TV disconnects
    // so players can remain in the lobby and the TV can reconnect.

    await set(lobbyRef, {
      status: 'waiting',
      game_selected: 'none',
      host_id: userId,
      players: {}
    });
  };

  const joinLobby = async (code: string, playerName: string, photo?: string, isAdmin: boolean = false) => {
    if (!userId) return;
    
    // Add player to lobby
    const playerRef = ref(db, `lobbies/${code}/players/${userId}`);
    
    // If player disconnects, remove them from the room
    onDisconnect(playerRef).remove().catch(console.error);

    await set(playerRef, {
      name: playerName,
      photo: photo || null,
      score: 0,
      isReady: true,
      isAdmin,
      joinedAt: Date.now()
    });
  };

  const updateGameState = async (newState: any) => {
    if (!lobbyCode) return;
    const stateRef = ref(db, `lobbies/${lobbyCode}/game_state`);
    await update(stateRef, newState);
  };

  const setGameStatus = async (status: 'waiting' | 'playing' | 'finished', game_selected?: string, initialGameState?: any) => {
    if (!lobbyCode) return;
    const lobbyRef = ref(db, `lobbies/${lobbyCode}`);
    const updates: any = { status };
    if (game_selected) updates.game_selected = game_selected;
    
    // Pulisce o imposta lo stato del gioco
    if (status === 'waiting') {
      updates.game_state = null;
    } else if (initialGameState) {
      updates.game_state = initialGameState;
    }
    
    await update(lobbyRef, updates);
  };

  const updatePlayerScore = async (playerId: string, scoreToAdd: number) => {
    if (!lobbyCode) return;
    const playerRef = ref(db, `lobbies/${lobbyCode}/players/${playerId}`);
    const currentScore = lobby?.players?.[playerId]?.score || 0;
    await update(playerRef, { score: currentScore + scoreToAdd });
  };

  const leaveLobby = async () => {
    if (!lobbyCode || !userId) return;
    const playerRef = ref(db, `lobbies/${lobbyCode}/players/${userId}`);
    await remove(playerRef);
    onDisconnect(playerRef).cancel();
  };

  return {
    lobby,
    userId,
    error,
    createLobby,
    joinLobby,
    leaveLobby,
    updateGameState,
    setGameStatus,
    updatePlayerScore
  };
}
