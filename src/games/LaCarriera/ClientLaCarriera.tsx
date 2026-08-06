import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Send, Trophy } from 'lucide-react';
import { useLobby } from '../../hooks/useLobby';
import PodiumMobile from '../../components/shared/PodiumMobile';
import ProgressBar from '../../components/shared/ProgressBar';
import RoundLeaderboardMobile from '../../components/shared/RoundLeaderboardMobile';
import GameLayoutMobile from '../../components/shared/GameLayoutMobile';
import { getServerTime } from '../../utils/serverTime';
import { checkAnswerFuzzy, normalizeStr } from '../../utils/fuzzyMatch';
import CareerTimeline from './CareerTimeline';
import { careerById, careerPlayers, searchableNames } from './data';
import './LaCarriera.css';

export default function ClientLaCarriera({ lobbyCode, userId }: { lobbyCode: string; userId: string }) {
  const { lobby, updateGameState, returnToLobbyOrNextGame } = useLobby(lobbyCode);
  const [guess, setGuess] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [feedback, setFeedback] = useState<'wrong' | null>(null);

  const gameState = lobby?.game_state || {};
  const phase = gameState.phase || 'question';
  const isAdmin = Boolean(lobby?.players?.[userId]?.isAdmin);
  const selectedIds: string[] = gameState.selectedCareerIds || [];
  const questionIndex = gameState.questionIndex || 0;
  const currentCareer = careerById.get(selectedIds[questionIndex]);
  const myAnswer = gameState.answers?.[userId];
  const totalRounds = selectedIds.length || gameState.settings?.rounds || 10;

  useEffect(() => {
    setGuess('');
    setFeedback(null);
    setShowSuggestions(false);
  }, [gameState.roundId]);

  const suggestions = useMemo(() => {
    const query = normalizeStr(guess);
    if (!query) return [];
    return careerPlayers
      .map((player) => {
        const names = searchableNames(player);
        const normalizedNames = names.map(normalizeStr);
        const starts = normalizedNames.some((name) => name.startsWith(query));
        const includes = normalizedNames.some((name) => name.includes(query));
        return { player, rank: starts ? 0 : includes ? 1 : 2 };
      })
      .filter((entry) => entry.rank < 2)
      .sort((a, b) => a.rank - b.rank || a.player.name.localeCompare(b.player.name, 'it'))
      .slice(0, 7)
      .map((entry) => entry.player);
  }, [guess]);

  const submitGuess = (value: string) => {
    const submitted = value.trim();
    if (!submitted || !currentCareer || myAnswer || phase !== 'question') return;
    const correct = checkAnswerFuzzy(submitted, searchableNames(currentCareer));
    if (!correct) {
      setFeedback('wrong');
      setGuess('');
      setShowSuggestions(false);
      window.setTimeout(() => setFeedback(null), 1500);
      navigator.vibrate?.(180);
      updateGameState({ [`guessFeedback/${userId}`]: { status: 'wrong', timestamp: getServerTime() } });
      return;
    }

    navigator.vibrate?.([80, 40, 80]);
    setShowSuggestions(false);
    updateGameState({
      [`answers/${userId}`]: {
        value: currentCareer.name,
        submitted: submitted,
        timeElapsed: Math.max(0, getServerTime() - (gameState.startTime || getServerTime())),
      },
      [`guessFeedback/${userId}`]: { status: 'correct', timestamp: getServerTime() },
    });
  };

  const next = () => updateGameState({ action: 'next_round', actionId: getServerTime() });

  if (phase === 'finished') {
    return <PodiumMobile players={lobby?.players} userId={userId} isAdmin={isAdmin} onReturnToLobby={() => returnToLobbyOrNextGame()} themeKey="la_carriera" />;
  }

  if (phase === 'results') {
    return (
      <GameLayoutMobile themeKey="la_carriera" className="career-mobile" style={{ justifyContent: 'center' }}>
        <RoundLeaderboardMobile
          players={lobby?.players}
          points={Object.fromEntries(Object.entries(lobby?.players || {}).map(([id, player]: any) => [id, player.score || 0]))}
          roundPoints={gameState.roundPoints || {}}
          roundName={`Carriera ${questionIndex + 1}`}
        />
        {isAdmin && <button className="btn btn-primary" onClick={next}>Prossima carriera</button>}
      </GameLayoutMobile>
    );
  }

  if (phase === 'reveal' && currentCareer) {
    return (
      <GameLayoutMobile themeKey="la_carriera" className="career-mobile" style={{ justifyContent: 'center' }}>
        <div className="career-mobile-card career-answer">
          <div className="career-answer__eyebrow">Era lui</div>
          <motion.h1 initial={{ opacity: 0, scale: .82 }} animate={{ opacity: 1, scale: 1 }} style={{ color: '#fff', WebkitTextFillColor: 'initial', margin: '.5rem 0 1rem' }}>{currentCareer.name}</motion.h1>
          <CareerTimeline teams={currentCareer.teams} compact revealAll />
          <div className={`career-feedback ${myAnswer ? 'career-feedback--right' : 'career-feedback--wrong'}`}>
            {myAnswer ? `Risposta esatta · +${gameState.roundPoints?.[userId] || 0} punti` : 'Tempo scaduto'}
          </div>
          {isAdmin && <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={next}><Trophy size={20} /> Vedi classifica</button>}
        </div>
      </GameLayoutMobile>
    );
  }

  if (!currentCareer) return <GameLayoutMobile themeKey="la_carriera" className="career-mobile"><div /></GameLayoutMobile>;

  if (myAnswer) {
    return (
      <GameLayoutMobile themeKey="la_carriera" className="career-mobile">
        <div className="career-mobile__top"><div><div className="career-kicker">La Carriera</div><h1 className="career-mobile__title">{questionIndex + 1} di {totalRounds}</h1></div><div className="career-round-pill">✓ Inviata</div></div>
        <div className="career-mobile-card career-waiting">
          <div>
            <motion.div className="career-waiting__check" initial={{ scale: 0 }} animate={{ scale: 1 }}>✓</motion.div>
            <h2 style={{ color: '#fff' }}>Risposta esatta!</h2>
            <p style={{ color: 'rgba(209,250,229,.7)' }}>Hai riconosciuto <strong>{currentCareer.name}</strong>. Aspettiamo gli altri.</p>
          </div>
        </div>
        <ProgressBar key={`mobile-${gameState.roundId}`} startTime={gameState.startTime} durationMs={(gameState.settings?.duration || 30) * 1000} />
      </GameLayoutMobile>
    );
  }

  return (
    <GameLayoutMobile themeKey="la_carriera" className="career-mobile">
      <div className="career-mobile__top">
        <div><div className="career-kicker">Indovina il calciatore</div><h1 className="career-mobile__title">La Carriera</h1></div>
        <div className="career-round-pill">{questionIndex + 1} / {totalRounds}</div>
      </div>

      <div className="career-mobile-card">
        <CareerTimeline teams={currentCareer.teams} visibleCount={(gameState.clueIndex || 0) + 1} compact />
        <form onSubmit={(event) => { event.preventDefault(); submitGuess(guess); }}>
          <label className="career-input-label" htmlFor="career-guess">Chi ha giocato in queste squadre?</label>
          {feedback === 'wrong' && <motion.div className="career-feedback career-feedback--wrong" initial={{ x: -8 }} animate={{ x: [-8, 8, -5, 5, 0] }}>Non è lui. Riprova!</motion.div>}
          <div className="career-input-wrap">
            <Search size={21} style={{ position: 'absolute', left: '1rem', top: '1.05rem', color: '#a7f3d0', zIndex: 1 }} />
            <input
              id="career-guess" className="input career-input" value={guess} autoComplete="off" autoFocus
              placeholder="Scrivi nome o cognome..." style={{ paddingLeft: '3rem' }}
              onChange={(event) => { setGuess(event.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => window.setTimeout(() => setShowSuggestions(false), 160)}
            />
            <button type="submit" className="btn btn-primary career-submit" aria-label="Invia risposta"><Send size={22} /></button>
            {showSuggestions && suggestions.length > 0 && (
              <div className="career-suggestions">
                {suggestions.map((player) => (
                  <button type="button" className="career-suggestion" key={player.id} onMouseDown={(event) => event.preventDefault()} onClick={() => { setGuess(player.name); submitGuess(player.name); }}>
                    <span>{player.name}</span><span className="career-hint">INVIA</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </form>
        <ProgressBar key={`input-${gameState.roundId}`} startTime={gameState.startTime} durationMs={(gameState.settings?.duration || 30) * 1000} />
      </div>
    </GameLayoutMobile>
  );
}
