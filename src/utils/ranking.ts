export interface RankedPlayer {
  id: string;
  name: string;
  photo?: string;
  score: number;
  rank: number;
}

export function computeRanking(players: any): RankedPlayer[] {
  if (!players) return [];
  
  // Sort by score descending
  const sorted = Object.entries(players)
    .sort((a: any, b: any) => (b[1].score || 0) - (a[1].score || 0));

  let currentRank = 1;
  let previousScore: number | null = null;
  
  return sorted.map(([id, p]: any, index) => {
    const score = p.score || 0;
    
    // If the score is lower than the previous player, the rank becomes (index + 1)
    // This implements the standard "1224 ranking" logic (tie-breaker skips subsequent ranks)
    if (previousScore !== null && score < previousScore) {
      currentRank = index + 1;
    }
    
    previousScore = score;
    
    return {
      id,
      name: p.name,
      photo: p.photo,
      score,
      rank: currentRank,
      ...p // Include other potential player properties just in case
    };
  });
}
