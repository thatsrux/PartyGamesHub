import { useCallback, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLobby } from '../../hooks/useLobby';
import PodiumTV from '../../components/shared/PodiumTV';
import Avatar from '../../components/shared/Avatar';
import ProgressBar from '../../components/shared/ProgressBar';
import WaitingAdminTV from '../../components/shared/WaitingAdminTV';
import RoundLeaderboardTV from '../../components/shared/RoundLeaderboardTV';
import GameLayoutTV from '../../components/shared/GameLayoutTV';
import MiniLeaderboardTV from '../../components/shared/MiniLeaderboardTV';
import LoadingScreen from '../../components/shared/LoadingScreen';
import { getServerTime } from '../../utils/serverTime';
import CareerTimeline from './CareerTimeline';
import { careerById, getCareerPool, shuffleCareers } from './data';
import './LaCarriera.css';

function PlayerChip({ player, answered }: { player: any; answered: boolean }) {
  return (
    <motion.div
      layout
      animate={{ scale: answered ? [1, 1.08, 1] : 1 }}
      className={`career-player-chip${answered ? ' career-player-chip--done' : ''}`}
    >
      <Avatar photo={player.photo} name={player.name} size={30} />
      <span>{player.name}</span>
      {answered && <span aria-label="Risposta corretta">✓</span>}
    </motion.div>
  );
}

export default function HostLaCarriera({ lobbyCode }: { lobbyCode: string }) {
  const { lobby, updateGameState, updatePlayerScore } = useLobby(lobbyCode);
  const gameState = lobby?.game_state || {};
  const players = useMemo(() => lobby?.players || {}, [lobby?.players]);
  const initializingRef = useRef(false);
  const endingRoundRef = useRef<number | null>(null);

  const selectedIds: string[] = gameState.selectedCareerIds || [];
  const questionIndex = gameState.questionIndex || 0;
  const currentCareer = careerById.get(selectedIds[questionIndex]);
  const totalRounds = selectedIds.length || gameState.settings?.rounds || 10;

  useEffect(() => {
    if (!lobby || gameState.phase || initializingRef.current) return;
    initializingRef.current = true;
    const pool = getCareerPool(gameState.settings?.careerMode);
    const requestedRounds = gameState.settings?.rounds || 10;
    const chosenIds = shuffleCareers(pool).slice(0, Math.min(requestedRounds, pool.length)).map((player) => player.id);
    updateGameState({
      phase: 'question',
      questionIndex: 0,
      clueIndex: 0,
      roundId: getServerTime(),
      startTime: getServerTime(),
      selectedCareerIds: chosenIds,
      answers: {},
      guessFeedback: {},
      roundPoints: {},
      action: null,
    }).finally(() => { initializingRef.current = false; });
  }, [lobby, gameState.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (gameState.phase !== 'question' || !currentCareer || !gameState.startTime) return;
    const clueIndex = gameState.clueIndex || 0;
    if (clueIndex >= currentCareer.teams.length - 1) return;
    const durationMs = (gameState.settings?.duration || 30) * 1000;
    const revealWindow = durationMs * 0.72;
    const step = currentCareer.teams.length > 1 ? revealWindow / (currentCareer.teams.length - 1) : revealWindow;
    const nextRevealAt = gameState.startTime + step * (clueIndex + 1);
    const timeout = window.setTimeout(() => {
      updateGameState({ clueIndex: clueIndex + 1 });
    }, Math.max(0, nextRevealAt - getServerTime()));
    return () => window.clearTimeout(timeout);
  }, [gameState.phase, gameState.clueIndex, gameState.startTime, currentCareer, gameState.settings?.duration]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRoundEnd = useCallback(async () => {
    if (!currentCareer || gameState.phase !== 'question' || endingRoundRef.current === gameState.roundId) return;
    endingRoundRef.current = gameState.roundId;
    const durationMs = (gameState.settings?.duration || 30) * 1000;
    const roundPoints: Record<string, number> = {};

    await Promise.all(Object.keys(players).map(async (playerId) => {
      const answer = gameState.answers?.[playerId];
      if (!answer) {
        roundPoints[playerId] = 0;
        return;
      }
      const timeLeft = Math.max(0, durationMs - Math.max(0, answer.timeElapsed || 0));
      const points = 100 + Math.round((timeLeft / durationMs) * 200);
      roundPoints[playerId] = points;
      await updatePlayerScore(playerId, points);
    }));

    await updateGameState({ phase: 'reveal', roundPoints, resolvedRoundId: gameState.roundId, action: null });
  }, [currentCareer, gameState.phase, gameState.roundId, gameState.settings?.duration, gameState.answers, players, updateGameState, updatePlayerScore]);

  useEffect(() => {
    if (gameState.phase !== 'question') return;
    const playerIds = Object.keys(players);
    if (playerIds.length > 0 && playerIds.every((id) => Boolean(gameState.answers?.[id]))) handleRoundEnd();
  }, [players, gameState.phase, gameState.answers, handleRoundEnd]);

  const handleNextRound = useCallback(() => {
    if (questionIndex + 1 < selectedIds.length) {
      endingRoundRef.current = null;
      updateGameState({
        phase: 'question', questionIndex: questionIndex + 1, clueIndex: 0,
        roundId: getServerTime(), startTime: getServerTime(), answers: {}, guessFeedback: {},
        roundPoints: {}, action: null,
      });
    } else {
      updateGameState({ phase: 'finished', action: null });
    }
  }, [questionIndex, selectedIds.length, updateGameState]);

  useEffect(() => {
    if (gameState.action !== 'next_round') return;
    if (gameState.phase === 'reveal') updateGameState({ phase: 'results', action: null });
    if (gameState.phase === 'results') handleNextRound();
  }, [gameState.action, gameState.actionId, gameState.phase, handleNextRound, updateGameState]);

  if (!currentCareer && gameState.phase !== 'finished') return <LoadingScreen message="Prepariamo le carriere..." />;

  const points = Object.fromEntries(Object.entries(players).map(([id, player]: any) => [id, player.score || 0]));
  const showGameHeader = !['results', 'finished'].includes(gameState.phase);

  return (
    <GameLayoutTV
      themeKey="la_carriera"
      leaderboard={showGameHeader ? <MiniLeaderboardTV players={players} animateUpdates /> : undefined}
    >
      <div className="career-game">
        {showGameHeader && (
          <header className="career-header">
            <div className="career-brand">
              <div className="career-brand__ball">⚽</div>
              <div><div className="career-kicker">Indovina il calciatore</div><h1>La Carriera</h1></div>
            </div>
            <div className="career-round-pill">Carriera {questionIndex + 1} / {totalRounds}</div>
          </header>
        )}

        {gameState.phase === 'question' && currentCareer && (
          <section className="career-stage">
            <h2 className="career-prompt">Chi ha indossato queste maglie?</h2>
            <p className="career-subprompt">Una nuova tappa apparirà lungo la linea del tempo</p>
            <CareerTimeline teams={currentCareer.teams} visibleCount={(gameState.clueIndex || 0) + 1} />
            <div className="career-players">
              {Object.entries(players).map(([id, player]: any) => <PlayerChip key={id} player={player} answered={Boolean(gameState.answers?.[id])} />)}
            </div>
            <div className="career-progress">
              <ProgressBar key={`career-${gameState.roundId}`} startTime={gameState.startTime} durationMs={(gameState.settings?.duration || 30) * 1000} onComplete={handleRoundEnd} />
            </div>
          </section>
        )}

        {gameState.phase === 'reveal' && currentCareer && (
          <section className="career-stage career-answer">
            <div className="career-answer__eyebrow">La carriera appartiene a</div>
            <motion.h2 className="career-answer__name" initial={{ opacity: 0, scale: .76 }} animate={{ opacity: 1, scale: 1 }}>{currentCareer.name}</motion.h2>
            <CareerTimeline teams={currentCareer.teams} revealAll />
            <WaitingAdminTV />
          </section>
        )}

        {gameState.phase === 'results' && <RoundLeaderboardTV players={players} points={points} roundPoints={gameState.roundPoints || {}} roundName={`Carriera ${questionIndex + 1}`} />}
        {gameState.phase === 'finished' && <PodiumTV players={players} points={points} />}
      </div>
    </GameLayoutTV>
  );
}
