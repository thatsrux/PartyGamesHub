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
  tv_present?: boolean;
  players: Record<string, Player>;
  game_state?: any;
  multigame_session?: any;
}

export function useLobby(lobbyCode: string | null) {
  const [lobby, setLobby] = useState<LobbyState | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Authenticate anonymously
  useEffect(() => {
    signInAnonymously(auth)
      .then((userCredential) => {
        setUserId(userCredential.user.uid);
        sessionStorage.setItem('userId', userCredential.user.uid);
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
      setIsLoading(false);
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
      // Find the player with the oldest joinedAt (tiebreaker: userId)
      const sortedPlayers = playersArray.sort((a, b) => {
        const timeDiff = (a[1].joinedAt || 0) - (b[1].joinedAt || 0);
        if (timeDiff !== 0) return timeDiff;
        return a[0].localeCompare(b[0]);
      });
      const nextAdminId = sortedPlayers[0]?.[0];
      
      // If I am the next admin, I promote myself
      if (nextAdminId === userId) {
        const playerRef = ref(db, `lobbies/${lobbyCode}/players/${userId}`);
        update(playerRef, { isAdmin: true });
      }
    }
  }, [lobby?.players, userId, lobbyCode]);

  // Gestione della presenza della TV
  useEffect(() => {
    if (!lobbyCode || !userId || !lobby) return;
    if (lobby.host_id === userId) {
      const tvPresentRef = ref(db, `lobbies/${lobbyCode}/tv_present`);
      update(ref(db, `lobbies/${lobbyCode}`), { tv_present: true }).catch(console.error);
      onDisconnect(tvPresentRef).remove().catch(console.error);
    }
  }, [lobbyCode, userId, lobby?.host_id]);

  const createLobby = async (code: string) => {
    if (!userId) return;
    
    // Eseguiamo una Garbage Collection per eliminare le lobby "quittate da tutti"
    try {
      const { get } = await import('firebase/database');
      const snapshot = await get(ref(db, 'lobbies'));
      if (snapshot.exists()) {
        const now = Date.now();
        snapshot.forEach((childSnap) => {
          const l = childSnap.val();
          const hasPlayers = l.players && Object.keys(l.players).length > 0;
          const hasTV = l.tv_present === true;
          // Se non c'è la TV, non ci sono giocatori, ed è stata creata da più di 1 ora (per sicurezza, fallback),
          // oppure se semplicemente non c'è nessuno connesso (tv o giocatori).
          if (!hasTV && !hasPlayers) {
            remove(childSnap.ref).catch(() => {});
          } else if (l.createdAt && now - l.createdAt > 24 * 60 * 60 * 1000) {
            // Elimina comunque lobby vecchie di 24h per sicurezza
            remove(childSnap.ref).catch(() => {});
          }
        });
      }
    } catch (e) {
      console.warn("Garbage collection failed", e);
    }

    const lobbyRef = ref(db, `lobbies/${code}`);
    const tvPresentRef = ref(db, `lobbies/${code}/tv_present`);
    
    // Quando la TV si scollega, rimuoviamo solo il flag tv_present.
    // In questo modo i giocatori rimangono connessi e la TV può riconnettersi.
    // Se anche i giocatori escono, la lobby diventa orfana e verrà eliminata dal Garbage Collector.
    onDisconnect(tvPresentRef).remove().catch(console.error);

    await set(lobbyRef, {
      status: 'waiting',
      game_selected: 'none',
      host_id: userId,
      tv_present: true,
      createdAt: Date.now(),
      players: {}
    });
  };

  const joinLobby = async (code: string, playerName: string, photo?: string, isAdmin: boolean = false) => {
    if (!userId) return;
    
    // Add player to lobby
    const playerRef = ref(db, `lobbies/${code}/players/${userId}`);
    
    // Se il giocatore ricarica la pagina, NON lo rimuoviamo per permettere il reconnect pulito.
    // Verrà rimosso solo se chiama esplicitamente leaveLobby o se il Garbage Collector elimina l'intera lobby.
    // onDisconnect(playerRef).remove().catch(console.error);

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
      updates.multigame_session = null;
      
      // Resetta i punteggi di tutti i giocatori
      if (lobby?.players) {
        Object.keys(lobby.players).forEach(pId => {
          updates[`players/${pId}/score`] = 0;
        });
      }
    } else if (initialGameState) {
      if (initialGameState.multigame_session) {
        updates.multigame_session = initialGameState.multigame_session;
        delete initialGameState.multigame_session;
      }
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

  const returnToLobbyOrNextGame = async () => {
    if (!lobbyCode || !lobby) return;
    if (lobby.multigame_session || lobby.game_selected === 'multigame') {
      const lobbyRef = ref(db, `lobbies/${lobbyCode}`);
      await update(lobbyRef, {
        game_selected: 'multigame',
        game_state: { phase: 'transition', action: null }
      });
    } else {
      await setGameStatus('waiting');
    }
  };

  const leaveLobby = async () => {
    if (!lobbyCode || !userId) return;
    const playerRef = ref(db, `lobbies/${lobbyCode}/players/${userId}`);
    await remove(playerRef);
    onDisconnect(playerRef).cancel();
    sessionStorage.removeItem('lobbyCode');
    sessionStorage.removeItem('hostLobbyCode');
    sessionStorage.setItem('isJoined', 'false');
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
    updatePlayerScore,
    returnToLobbyOrNextGame
  };
}
