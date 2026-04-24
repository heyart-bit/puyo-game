import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export function useInput() {
  const { inputLeft, inputRight, inputRotateCW, inputRotateCCW, softDrop, hardDrop, pause } = useGameStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.repeat) return;
      switch (e.code) {
        case 'ArrowLeft':  case 'KeyA': e.preventDefault(); inputLeft(true);    break;
        case 'ArrowRight': case 'KeyD': e.preventDefault(); inputRight(true);   break;
        case 'ArrowUp':    case 'KeyW': case 'KeyX': e.preventDefault(); inputRotateCW();  break;
        case 'KeyZ':       e.preventDefault(); inputRotateCCW(); break;
        case 'ArrowDown':  case 'KeyS': e.preventDefault(); softDrop(true);     break;
        case 'Space':      e.preventDefault(); hardDrop();       break;
        case 'Escape':     case 'KeyP': e.preventDefault(); pause();            break;
      }
    };
    const up = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowLeft':  case 'KeyA': inputLeft(false);    break;
        case 'ArrowRight': case 'KeyD': inputRight(false);   break;
        case 'ArrowDown':  case 'KeyS': softDrop(false);     break;
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [inputLeft, inputRight, inputRotateCW, inputRotateCCW, softDrop, hardDrop, pause]);
}
