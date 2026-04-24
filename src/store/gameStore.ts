import { create } from 'zustand';
import {
  GameState, GamePhase,
  DAS_DELAY, DAS_REPEAT, LOCK_DELAY, FLASH_DURATION, DROP_ANIM,
} from '../game/types';
import { createBoard, findMatches, eliminateCells, applyGravity } from '../game/board';
import {
  generatePair, tryMove, tryRotate, hasLanded, placePair, isGameOver,
} from '../game/physics';
import { calculateScore, getFallSpeed, getLevelFromPairs } from '../game/score';

interface GameStore extends GameState {
  start: () => void;
  reset: () => void;
  pause: () => void;
  tick: (dt: number) => void;
  inputLeft: (pressed: boolean) => void;
  inputRight: (pressed: boolean) => void;
  inputRotateCW: () => void;
  inputRotateCCW: () => void;
  softDrop: (pressed: boolean) => void;
  hardDrop: () => void;
}

function initialState(): GameState {
  return {
    board: createBoard(),
    current: null,
    nextQueue: [generatePair(), generatePair()],
    score: 0,
    level: 1,
    pairsDropped: 0,
    currentChain: 0,
    maxChain: 0,
    phase: 'idle',
    fallTimer: 0,
    lockTimer: 0,
    flashTimer: 0,
    dropTimer: 0,
    flashingMatches: [],
    chainDisplay: null,
    chainDisplayKey: 0,
    dasDirection: null,
    dasTimer: 0,
    dasActive: false,
    softDropping: false,
  };
}

function spawnPair(state: GameState): GameState {
  const [next1, next2] = state.nextQueue;
  const newPair = next1!;
  const newNext2 = generatePair();

  if (isGameOver(state.board)) {
    return { ...state, phase: 'gameover', current: null };
  }

  return {
    ...state,
    current: newPair,
    nextQueue: [next2!, newNext2],
    phase: 'playing',
    fallTimer: getFallSpeed(state.level),
    lockTimer: 0,
    dasDirection: null,
    dasActive: false,
    dasTimer: 0,
    softDropping: false,
  };
}

function resolveAfterPlace(state: GameState): GameState {
  const matches = findMatches(state.board);
  if (matches.length === 0) {
    const newPairsDropped = state.pairsDropped + 1;
    const newLevel = getLevelFromPairs(newPairsDropped);
    return spawnPair({ ...state, pairsDropped: newPairsDropped, level: newLevel, currentChain: 0 });
  }

  const chain = state.currentChain + 1;
  const gained = calculateScore(matches, chain);
  return {
    ...state,
    score: state.score + gained,
    currentChain: chain,
    maxChain: Math.max(state.maxChain, chain),
    flashingMatches: matches,
    phase: 'flashing',
    flashTimer: FLASH_DURATION,
    chainDisplay: chain,
    chainDisplayKey: state.chainDisplayKey + 1,
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState(),

  start: () => {
    const state = { ...initialState(), phase: 'playing' as GamePhase };
    const spawned = spawnPair(state);
    set(spawned);
  },

  reset: () => {
    const state = { ...initialState(), phase: 'playing' as GamePhase };
    const spawned = spawnPair(state);
    set(spawned);
  },

  pause: () => {
    const { phase } = get();
    if (phase === 'playing' || phase === 'locking') {
      set({ phase: 'idle' });
    } else if (phase === 'idle') {
      set({ phase: 'playing' });
    }
  },

  tick: (dt: number) => {
    const s = get();
    if (s.phase === 'idle' || s.phase === 'gameover') return;
    if ((s.phase === 'playing' || s.phase === 'locking') && !s.current) return;

    const fallSpeed = s.softDropping
      ? Math.min(getFallSpeed(s.level), 80)
      : getFallSpeed(s.level);

    if (s.phase === 'playing') {
      let cur = s.current!;
      let { fallTimer, dasTimer, dasDirection, dasActive } = s;

      // DAS
      if (dasDirection) {
        dasTimer -= dt;
        if (dasTimer <= 0) {
          if (!dasActive) {
            dasActive = true;
            dasTimer = DAS_REPEAT;
          } else {
            dasTimer = DAS_REPEAT;
          }
          const dCol = dasDirection === 'left' ? -1 : 1;
          const moved = tryMove(s.board, cur, 0, dCol);
          if (moved) cur = moved;
        }
      }

      // Gravity
      fallTimer -= dt;
      if (fallTimer <= 0) {
        fallTimer = fallSpeed;
        const down = tryMove(s.board, cur, 1, 0);
        if (down) {
          cur = down;
        } else {
          set({ current: cur, fallTimer, dasTimer, dasActive, phase: 'locking', lockTimer: LOCK_DELAY });
          return;
        }
      }

      const landed = hasLanded(s.board, cur);
      set({ current: cur, fallTimer, dasTimer, dasActive, phase: landed ? 'locking' : 'playing', lockTimer: landed ? LOCK_DELAY : 0 });
      return;
    }

    if (s.phase === 'locking') {
      let cur = s.current!;
      let { lockTimer, dasTimer, dasDirection, dasActive } = s;

      // DAS during lock
      if (dasDirection) {
        dasTimer -= dt;
        if (dasTimer <= 0) {
          dasTimer = DAS_REPEAT;
          const dCol = dasDirection === 'left' ? -1 : 1;
          const moved = tryMove(s.board, cur, 0, dCol);
          if (moved) {
            cur = moved;
            if (!hasLanded(s.board, cur)) {
              set({ current: cur, dasTimer, dasActive, phase: 'playing', fallTimer: fallSpeed });
              return;
            }
            lockTimer = LOCK_DELAY;
          }
        }
      }

      lockTimer -= dt;
      if (lockTimer <= 0) {
        const newBoard = placePair(s.board, cur);
        const newPairsDropped = s.pairsDropped + 1;
        const newLevel = getLevelFromPairs(newPairsDropped);
        const newState: GameState = {
          ...s,
          board: newBoard,
          current: null,
          pairsDropped: newPairsDropped,
          level: newLevel,
          currentChain: 0,
          phase: 'playing',
        };
        const resolved = resolveAfterPlace(newState);
        set(resolved);
        return;
      }

      set({ current: cur, lockTimer, dasTimer, dasActive });
      return;
    }

    if (s.phase === 'flashing') {
      const flashTimer = s.flashTimer - dt;
      if (flashTimer <= 0) {
        const newBoard = applyGravity(eliminateCells(s.board, s.flashingMatches));
        set({ board: newBoard, flashingMatches: [], phase: 'dropping', dropTimer: DROP_ANIM, chainDisplay: null });
        return;
      }
      set({ flashTimer });
      return;
    }

    if (s.phase === 'dropping') {
      const dropTimer = s.dropTimer - dt;
      if (dropTimer <= 0) {
        const resolved = resolveAfterPlace({ ...s, phase: 'playing' });
        set(resolved);
        return;
      }
      set({ dropTimer });
      return;
    }
  },

  inputLeft: (pressed: boolean) => {
    const { phase, board, current } = get();
    if (!current || (phase !== 'playing' && phase !== 'locking')) return;
    if (pressed) {
      const moved = tryMove(board, current, 0, -1);
      set({
        current: moved ?? current,
        dasDirection: 'left',
        dasTimer: DAS_DELAY,
        dasActive: false,
        lockTimer: moved && hasLanded(board, moved) ? LOCK_DELAY : get().lockTimer,
      });
    } else {
      const { dasDirection } = get();
      if (dasDirection === 'left') set({ dasDirection: null });
    }
  },

  inputRight: (pressed: boolean) => {
    const { phase, board, current } = get();
    if (!current || (phase !== 'playing' && phase !== 'locking')) return;
    if (pressed) {
      const moved = tryMove(board, current, 0, 1);
      set({
        current: moved ?? current,
        dasDirection: 'right',
        dasTimer: DAS_DELAY,
        dasActive: false,
        lockTimer: moved && hasLanded(board, moved) ? LOCK_DELAY : get().lockTimer,
      });
    } else {
      const { dasDirection } = get();
      if (dasDirection === 'right') set({ dasDirection: null });
    }
  },

  inputRotateCW: () => {
    const { phase, board, current } = get();
    if (!current || (phase !== 'playing' && phase !== 'locking')) return;
    const rotated = tryRotate(board, current, true);
    set({ current: rotated, lockTimer: hasLanded(board, rotated) ? LOCK_DELAY : get().lockTimer });
  },

  inputRotateCCW: () => {
    const { phase, board, current } = get();
    if (!current || (phase !== 'playing' && phase !== 'locking')) return;
    const rotated = tryRotate(board, current, false);
    set({ current: rotated, lockTimer: hasLanded(board, rotated) ? LOCK_DELAY : get().lockTimer });
  },

  softDrop: (pressed: boolean) => {
    set({ softDropping: pressed });
  },

  hardDrop: () => {
    const { phase, board, current } = get();
    if (!current || (phase !== 'playing' && phase !== 'locking')) return;
    let p = current;
    let next = tryMove(board, p, 1, 0);
    while (next) { p = next; next = tryMove(board, p, 1, 0); }
    const newBoard = placePair(board, p);
    const newState = { ...get(), board: newBoard, current: null };
    const resolved = resolveAfterPlace(newState);
    set(resolved);
  },
}));
