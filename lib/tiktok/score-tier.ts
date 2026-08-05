/** Libellé marketing affiché sous le score (style looksmaxxing / TikTok). */
export function scoreTier(score: number): string {
  if (score >= 8.5) return "Giga Chad";
  if (score >= 7.5) return "Chad";
  if (score >= 6.5) return "HTN";
  if (score >= 5) return "MTN";
  return "LTN";
}

export function formatScore(score: number): string {
  return score.toFixed(1).replace(".", ",");
}

export function scoreProgress(score: number): number {
  return Math.min(100, Math.max(0, (score / 10) * 100));
}
