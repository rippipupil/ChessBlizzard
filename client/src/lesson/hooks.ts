// Hooks compartidos por las lecciones: navegación con el teclado, sonidos, comparación de
// jugadas con Stockfish y plurales.
import { useCallback, useEffect, useRef, useState } from 'react';
import { playSound, type SoundKind } from '../board';
import { getEngine, type Score } from '../engine';
import { useT } from '../i18n';
import { useSettings } from '../state/settings';

function typing(el: Element | null) {
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (el as HTMLElement).isContentEditable;
}

export interface KeyNav {
  prev?: () => void;
  next?: () => void;
  first?: () => void;
  last?: () => void;
}

/** Flechas ← → para recorrer jugadas, ↑/Inicio y ↓/Fin para ir al principio o al final. */
export function useKeyNav(handlers: KeyNav, enabled = true) {
  const ref = useRef(handlers);
  ref.current = handlers;
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      if (typing(document.activeElement)) return;
      const h = ref.current;
      let fn: (() => void) | undefined;
      if (e.key === 'ArrowLeft') fn = h.prev;
      else if (e.key === 'ArrowRight') fn = h.next;
      else if (e.key === 'ArrowUp' || e.key === 'Home') fn = h.first;
      else if (e.key === 'ArrowDown' || e.key === 'End') fn = h.last;
      if (!fn) return;
      e.preventDefault();
      fn();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled]);
}

/** Sonido de una jugada según su SAN. */
export function moveSound(san: string): SoundKind {
  if (san.includes('+') || san.includes('#')) return 'check';
  if (san.includes('x')) return 'capture';
  return 'move';
}

/** Reproduce sonidos solo si el usuario los tiene activados. */
export function useSound() {
  const { settings } = useSettings();
  const on = settings.sounds;
  return useCallback((kind: SoundKind) => {
    if (on) playSound(kind);
  }, [on]);
}

/** Plural sencillo con claves ".one" y ".other": plural('lesson.days', 3) -> "3 días". */
export function usePlural() {
  const t = useT();
  return useCallback((key: string, n: number, vars: Record<string, string | number> = {}) => t(`${key}.${n === 1 ? 'one' : 'other'}`, { n, ...vars }), [t]);
}

export interface CompareSpec {
  fen: string;
  /** Jugada del alumno (UCI). */
  user: string;
  /** Jugada del repertorio (UCI). */
  book: string;
}

export interface CompareState {
  loading: boolean;
  user?: Score;
  book?: Score;
  failed?: boolean;
}

/**
 * Compara la jugada del alumno con la del repertorio en una sola búsqueda de Stockfish
 * (MultiPV 2 limitado a esas dos jugadas). Las evaluaciones van desde las blancas.
 */
export function useMoveCompare(spec: CompareSpec | null, depth = 13): CompareState {
  const [state, setState] = useState<CompareState>({ loading: false });
  const key = spec ? `${spec.fen}|${spec.user}|${spec.book}` : '';
  useEffect(() => {
    if (!spec) {
      setState({ loading: false });
      return;
    }
    let alive = true;
    setState({ loading: true });
    const task = getEngine().analyze(spec.fen, { depth, multipv: 2, searchmoves: [spec.user, spec.book], channel: 'compare' });
    task.promise.then(
      (res) => {
        if (!alive) return;
        const find = (uci: string) => {
          const line = res.lines.find((l) => l.pv[0] === uci);
          return line ? { cp: line.cp, mate: line.mate } : undefined;
        };
        const user = find(spec.user);
        const book = find(spec.book);
        setState({ loading: false, user, book, failed: !user || !book });
      },
      () => {
        if (alive) setState({ loading: false, failed: true });
      },
    );
    return () => {
      alive = false;
      task.cancel();
    };
    // `key` resume `spec`: evita relanzar la búsqueda si el objeto cambia pero no su contenido.
  }, [key, depth]);
  return state;
}
