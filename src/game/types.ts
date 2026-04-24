export type PuyoColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple';
export type Cell = PuyoColor | 'garbage' | null;
export type Board = Cell[][];

export const COLS = 6;
export const ROWS = 12;

// Rotation: 0=free above, 1=free right, 2=free below, 3=free left
export type Rotation = 0 | 1 | 2 | 3;

export interface FallingPair {
  axisCol: number;
  axisRow: number;
  rotation: Rotation;
  axisColor: PuyoColor;
  freeColor: PuyoColor;
}

export interface MatchGroup {
  cells: Array<{ row: number; col: number }>;
  color: PuyoColor;
}

export type GamePhase =
  | 'idle'
  | 'playing'
  | 'locking'
  | 'flashing'
  | 'dropping'
  | 'gameover';

export interface GameState {
  board: Board;
  current: FallingPair | null;
  nextQueue: [FallingPair, FallingPair];
  score: number;
  level: number;
  pairsDropped: number;
  currentChain: number;
  maxChain: number;
  phase: GamePhase;
  fallTimer: number;
  lockTimer: number;
  flashTimer: number;
  dropTimer: number;
  flashingMatches: MatchGroup[];
  chainDisplay: number | null;
  chainDisplayKey: number;
  dasDirection: 'left' | 'right' | null;
  dasTimer: number;
  dasActive: boolean;
  softDropping: boolean;
}

export const PUYO_COLORS: PuyoColor[] = ['red', 'blue', 'green', 'yellow', 'purple'];

export const COLOR_STYLES: Record<PuyoColor | 'garbage', { bg: string; glow: string; dark: string }> = {
  red:     { bg: '#FF3355', glow: 'rgba(255,51,85,0.7)',   dark: '#CC0022' },
  blue:    { bg: '#2288FF', glow: 'rgba(34,136,255,0.7)',  dark: '#0055CC' },
  green:   { bg: '#22FF88', glow: 'rgba(34,255,136,0.7)', dark: '#00BB55' },
  yellow:  { bg: '#FFD700', glow: 'rgba(255,215,0,0.7)',   dark: '#CC9900' },
  purple:  { bg: '#CC33FF', glow: 'rgba(204,51,255,0.7)', dark: '#9900CC' },
  garbage: { bg: '#8899AA', glow: 'rgba(136,153,170,0.4)', dark: '#556677' },
};

export const DAS_DELAY = 170;
export const DAS_REPEAT = 50;
export const LOCK_DELAY = 500;
export const FLASH_DURATION = 400;
export const DROP_ANIM = 150;
export const SPAWN_ROW = 1;
export const SPAWN_COL = 2;
