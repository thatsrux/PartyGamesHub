import { motion } from 'framer-motion';
import type { CareerTeam } from './data';
import { getTeamBadge } from './data';

interface CareerTimelineProps {
  teams: CareerTeam[];
  visibleCount?: number;
  compact?: boolean;
  revealAll?: boolean;
}

function TeamBadge({ team, compact = false }: { team: CareerTeam; compact?: boolean }) {
  return (
    <div className={`career-team-card${compact ? ' career-team-card--compact' : ''}`}>
      <div className="career-team-card__badge-wrap">
        <img className="career-team-card__badge" src={getTeamBadge(team.teamId)} alt={`Logo ${team.name}`} />
      </div>
      <div className="career-team-card__name">{team.name}</div>
      <div className="career-team-card__years">{team.years}</div>
    </div>
  );
}

export default function CareerTimeline({ teams, visibleCount = teams.length, compact = false, revealAll = false }: CareerTimelineProps) {
  const visibleTeams = teams.slice(0, Math.max(1, Math.min(visibleCount, teams.length)));
  return (
    <div className={`career-timeline${compact ? ' career-timeline--compact' : ''}${revealAll ? ' career-timeline--reveal' : ''}`}>
      <div className="career-timeline__rail" aria-hidden="true" />
      {visibleTeams.map((team, index) => (
        <motion.div
          className="career-timeline__stop"
          key={`${team.teamId}-${team.years}-${index}`}
          initial={{ opacity: 0, y: 24, scale: 0.84 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
          {index > 0 && <span className="career-timeline__arrow" aria-hidden="true">›</span>}
          <TeamBadge team={team} compact={compact} />
        </motion.div>
      ))}
    </div>
  );
}

