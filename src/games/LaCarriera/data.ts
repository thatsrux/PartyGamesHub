import rawData from '../../data/footballers.json';
import badgeManifest from '../../data/teamBadges.json';
export { isCareerAnswerCorrect, searchableNames } from './careerMatching';

export type CareerTier = 'icone' | 'campioni';
export type CareerMode = CareerTier | 'completo';

export interface CareerTeam {
  name: string;
  years: string;
  teamId: string;
}

export interface CareerPlayer {
  id: string;
  name: string;
  aliases: string[];
  tier: CareerTier;
  teams: CareerTeam[];
}

interface CareerDatabase {
  version: number;
  updatedAt: string;
  players: CareerPlayer[];
}

export const careerDatabase = rawData as CareerDatabase;
export const careerPlayers = careerDatabase.players;
export const careerById = new Map(careerPlayers.map((player) => [player.id, player]));

export function getTeamBadge(teamId: string): string {
  return (badgeManifest as Record<string, string>)[teamId] || '/team-badges/fallback.svg';
}

export function getCareerPool(mode: string | undefined): CareerPlayer[] {
  const selectedTier: CareerTier = mode === 'campioni' ? 'campioni' : 'icone';
  const pool = mode === 'completo'
    ? careerPlayers
    : careerPlayers.filter((player) => player.tier === selectedTier);
  return pool.filter((player) => player.teams.length >= 2);
}

export function shuffleCareers<T>(values: T[]): T[] {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}
