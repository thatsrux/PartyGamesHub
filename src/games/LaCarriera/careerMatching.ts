import { checkAnswerFuzzy } from '../../utils/fuzzyMatch.ts';

export interface MatchableCareerPlayer {
  id: string;
  name: string;
  aliases: string[];
}

export function searchableNames(player: MatchableCareerPlayer): string[] {
  const parts = player.name.trim().split(/\s+/);
  const lastName = parts.at(-1) || player.name;
  const particles = new Set(['van', 'von', 'de', 'del', 'di', 'da']);
  const previous = parts.at(-2)?.toLowerCase();
  const compoundLastName = previous && particles.has(previous) ? `${parts.at(-2)} ${lastName}` : lastName;
  return [...new Set([player.name, compoundLastName, lastName, ...player.aliases])];
}

export function isCareerAnswerCorrect(player: MatchableCareerPlayer, answer: string, selectedPlayerId?: string): boolean {
  if (selectedPlayerId) return selectedPlayerId === player.id;
  return checkAnswerFuzzy(answer, searchableNames(player));
}
