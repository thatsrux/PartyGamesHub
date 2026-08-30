import { useState, useEffect } from 'react';
import { ref, set, onValue, update, remove, onDisconnect, runTransaction } from 'firebase/database';
import { db } from '../firebase';
import { ensureAuthenticatedUser } from '../services/authSession';
import { mergePlayerSession } from '../utils/playerSession';

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
  used_jeopardy_questions?: Record<string, boolean>;
}

export function useLobby(lobbyCode: string | null) {
  const [lobby, setLobby] = useState<LobbyState | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Authenticate anonymously
  useEffect(() => {
    let active = true;
    ensureAuthenticatedUser()
      .then((user) => {
        if (!active) return;
        setUserId(user.uid);
        sessionStorage.setItem('userId', user.uid);
      })
      .catch((err) => {
        console.error("Auth error:", err);
        setError("Errore di connessione");
      });
    return () => { active = false; };
  }, []);

  // Listen to lobby changes
  useEffect(() => {
    if (!lobbyCode || !userId) return;

    const lobbyRef = ref(db, `lobbies/${lobbyCode}`);
    setLobby(null);
    setError(null);
    setIsLoading(true);
    
    const unsubscribe = onValue(lobbyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setLobby(data);
      } else {
        setLobby(null);
      }
      setIsLoading(false);
    }, (listenerError) => {
      console.error('Lobby read error:', listenerError);
      setLobby(null);
      setError('Impossibile collegarsi alla stanza. Riprova.');
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
  const lobbyHostId = lobby?.host_id;
  useEffect(() => {
    if (!lobbyCode || !userId || !lobbyHostId) return;
    const isHostDevice = sessionStorage.getItem('hostLobbyCode') === lobbyCode;
    if (lobbyHostId === userId && isHostDevice) {
      const tvPresentRef = ref(db, `lobbies/${lobbyCode}/tv_present`);
      update(ref(db, `lobbies/${lobbyCode}`), { tv_present: true }).catch(console.error);
      onDisconnect(tvPresentRef).remove().catch(console.error);
    }
  }, [lobbyCode, userId, lobbyHostId]);

  const createLobby = async (code: string) => {
    if (!userId) return;

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

  const joinLobby = async (code: string, playerName: string, photo: string | null = null, isAdmin: boolean = false) => {
    if (!userId) return;
    
    // Add player to lobby
    const playerRef = ref(db, `lobbies/${code}/players/${userId}`);
    
    // Se il giocatore ricarica la pagina, NON lo rimuoviamo per permettere il reconnect pulito.
    // Verrà rimosso solo se chiama esplicitamente leaveLobby o se il Garbage Collector elimina l'intera lobby.
    // onDisconnect(playerRef).remove().catch(console.error);

    await runTransaction(playerRef, (current: Player | null) =>
      mergePlayerSession(current, { name: playerName, photo, isAdmin })
    );
  };

  const updateCurrentPlayerProfile = async (name: string, photo: string | null) => {
    if (!lobbyCode || !userId || !lobby?.players?.[userId]) return;
    await update(ref(db, `lobbies/${lobbyCode}/players/${userId}`), {
      name: name.trim().slice(0, 15),
      photo,
    });
  };

  const updateGameState = async (newState: any) => {
    if (!lobbyCode) return;
    const stateRef = ref(db, `lobbies/${lobbyCode}/game_state`);

    // More than one TV can be connected to the same room. Initial game setup
    // contains random questions/sequences, so only the first TV may commit it;
    // otherwise concurrent hosts can mix a question with another answer set.
    if (newState?.phase && !lobby?.game_state?.phase) {
      await runTransaction(stateRef, (currentState) => {
        if (currentState?.phase) return;
        return { ...(currentState || {}), ...newState };
      });
      return;
    }
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

  const updateLobbyData = async (updates: any) => {
    if (!lobbyCode) return;
    const lobbyRef = ref(db, `lobbies/${lobbyCode}`);
    await update(lobbyRef, updates);
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
    isLoading,
    createLobby,
    joinLobby,
    updateCurrentPlayerProfile,
    leaveLobby,
    updateLobbyData,
    updateGameState,
    setGameStatus,
    updatePlayerScore,
    returnToLobbyOrNextGame
  };
}
