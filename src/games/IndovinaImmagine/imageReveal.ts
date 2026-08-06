export interface ImageRevealStyle {
  progress: number;
  blurPx: number;
  brightness: number;
  scale: number;
}

export function getImageRevealStyle(elapsedMs: number, durationMs: number): ImageRevealStyle {
  const safeDuration = Math.max(1, durationMs);
  const progress = Math.min(1, Math.max(0, elapsedMs / safeDuration));
  const remaining = 1 - progress;

  return {
    progress,
    blurPx: 36 * remaining ** 1.18,
    brightness: .52 + .48 * progress,
    scale: 1 + .08 * remaining
  };
}
