const PERFECT_ANSWER_BONUS = 500;
const PARTICIPATION_FLOOR = 5;

/**
 * Rewards precision with a smooth curve while guaranteeing a small score to
 * every valid answer. Across the meaningful accuracy range the curve remains
 * decreasing; only very distant answers meet at the consolation floor.
 */
export function calculatePiuVicinoScore(answer: number, correctAnswer: number, min: number, max: number): number {
  if (![answer, correctAnswer, min, max].every(Number.isFinite)) return 0;

  const range = Math.max(1, Math.abs(max - min));
  const distance = Math.abs(answer - correctAnswer);
  const normalizedDistance = distance / range;
  const accuracyPoints = Math.round(100 * Math.exp(-12 * normalizedDistance ** 2));
  const basePoints = Math.max(PARTICIPATION_FLOOR, accuracyPoints);

  return distance === 0 ? basePoints + PERFECT_ANSWER_BONUS : basePoints;
}
