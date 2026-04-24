# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start dev server (Vite, hot reload)
npm run build     # TypeScript check + Vite production build
npm run preview   # serve the production build locally
```

No test runner is configured. TypeScript strict mode is enabled via `tsconfig.app.json`.

## Architecture

This is a Puyo Puyo game built with React 19, TypeScript, Vite 6, TailwindCSS v4, and Zustand v5. Framer Motion is installed but not yet used.

### Layer separation

**`src/game/`** — pure game logic, no React imports

| File | Role |
|---|---|
| `types.ts` | All shared types, constants (`COLS=6`, `ROWS=12`), timing constants (`DAS_DELAY`, `LOCK_DELAY`, `FLASH_DURATION`, `DROP_ANIM`), and `COLOR_STYLES` (bg/glow/dark per puyo color) |
| `board.ts` | Board operations: flood-fill connected-group detection (`findMatches` requires ≥4 connected), `eliminateCells` (also removes adjacent garbage), `applyGravity`, `getNeighborFlags` for blob-shape rendering |
| `physics.ts` | Falling pair: `generatePair`, `tryMove`, `tryRotate` (with wall kicks ±1/±2), `getGhostRow`, `placePair`, `isGameOver` |
| `score.ts` | `calculateScore` (chain/color/group bonus tables), `getFallSpeed` (ms per row, min 80ms), `getLevelFromPairs` (level-up every 15 pairs) |

**`src/store/gameStore.ts`** — single Zustand store holding all `GameState` and action methods

The entire game runs through a **phase state machine** driven by `tick(dt)` (called on every animation frame with millisecond delta):

```
idle ──start──► playing ──lands──► locking ──timeout──► (place pair)
                                                              │
                                              no matches ◄───┤
                                                              │
                                           matches found ──► flashing ──► dropping ──► (loop back)
                                                                                             │
                                                                       gameover ◄────────────┘
```

- `playing`: gravity timer + DAS (Delayed Auto Shift) for held left/right
- `locking`: lock delay timer; lateral movement can reset the timer or return to `playing` if piece lifts
- `flashing`: matched puyos flash for `FLASH_DURATION` before elimination
- `dropping`: post-gravity animation wait (`DROP_ANIM`) then re-checks for chain matches
- `idle`: also used as the paused state (toggled by `pause()`)

**`src/hooks/`**

- `useGameLoop.ts` — RAF loop; caps `dt` at 100ms to prevent spiral of death on tab blur
- `useInput.ts` — keyboard events mapped to store actions; supports WASD + arrow keys

**`src/components/`**

- `GameField.tsx` — renders the 6×12 board at `CELL=52px` using absolute positioning; draws placed cells, ghost pair, and falling pair (with CSS `transition` for smooth movement); computes `flashingSet` and `fallingCells` for neighbor-flag calculations
- `PuyoCell.tsx` — renders one puyo: blob shape via border-radius (50% on free sides, 10% on connected sides), radial-gradient body, highlight shine, eyes (two white circles with pupils), and connector bars between adjacent same-color puyos
- `ChainOverlay.tsx` — floating chain count text (only shows for ≥2 chains) with `chainPop` CSS animation; keyed by `chainDisplayKey` to re-trigger on consecutive chains
- `HUD.tsx` — stat boxes (SCORE / LEVEL / PAIRS / MAX CHAIN)
- `NextPanel.tsx` — displays the next 2 pairs at `CELL=40px`
- `Controls.tsx` — static key reference panel
- `App.tsx` — screen routing: `StartScreen` overlay when `phase==='idle'` before first start, then the `Game` layout containing all components

### Styling conventions

- Global dark space theme: `#070712` background, `#e0e8ff` text, purple/blue accent palette
- **Inline styles dominate**; Tailwind v4 is available (`@import "tailwindcss"` in `index.css`) but only used for resets
- Shared CSS utility classes in `index.css`: `.glass-panel` (glassmorphism), `.btn-neon` (purple neon button), `.scanlines` (pseudo-element scanline overlay)
- CSS keyframe animations: `flash` (brightness pulse on matched puyos), `chainPop` (scale-in chain text), `scoreUp`, `pulseGlow`
- `COLOR_STYLES` in `types.ts` is the single source of truth for puyo colors — add new colors there first
