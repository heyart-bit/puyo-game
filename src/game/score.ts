import { MatchGroup } from './types';

const CHAIN_BONUS = [0, 8, 16, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384];
const COLOR_BONUS = [0, 0, 3, 6, 12, 24];
const GROUP_BONUS = [0, 0, 0, 0, 0, 2, 3, 4, 5, 6, 7, 10];

export function calculateScore(matches: MatchGroup[], chainNumber: number): number {
  const totalEliminated = matches.reduce((sum, m) => sum + m.cells.length, 0);
  const colorCount = new Set(matches.map(m => m.color)).size;
  const groupBonus = matches.reduce(
    (sum, m) => sum + (GROUP_BONUS[Math.min(m.cells.length, GROUP_BONUS.length - 1)] ?? 10),
    0
  );
  const chainBonus = CHAIN_BONUS[Math.min(chainNumber - 1, CHAIN_BONUS.length - 1)] ?? 384;
  const colorBonus = COLOR_BONUS[Math.min(colorCount, COLOR_BONUS.length - 1)] ?? 24;
  const bonus = Math.max(chainBonus + colorBonus + groupBonus, 1);
  return totalEliminated * 10 * bonus;
}

export function getFallSpeed(level: number): number {
  return Math.max(80, 1000 - (level - 1) * 80);
}

export function getLevelFromPairs(pairsDropped: number): number {
  return Math.floor(pairsDropped / 15) + 1;
}
