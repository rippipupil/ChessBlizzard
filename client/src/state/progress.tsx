// Progreso del alumno. Se calcula siempre en el navegador con el mismo reductor que el
// servidor, para que la interfaz responda al instante. Con sesión iniciada, los eventos
// también se envían al servidor mediante el adaptador `sync`.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { applyEvent, emptyProgress, localDay, type ProgressEvent, type ProgressState } from '@chessblizzard/shared';

const STORAGE_KEY = 'cb.progress.v1';

type DistributiveOmit<T, K extends keyof never> = T extends unknown ? Omit<T, K> : never;
export type ProgressEventInput = DistributiveOmit<ProgressEvent, 'day'>;

export interface ProgressSync {
  /** Envía eventos al servidor. Debe resolver con el progreso oficial de la cuenta. */
  push(events: ProgressEvent[]): Promise<ProgressState>;
}

interface ProgressContextValue {
  state: ProgressState;
  /** Fecha local de hoy (AAAA-MM-DD). */
  today: string;
  /** Registra un evento (completar etapa, repasar línea, resolver puzzle...). Devuelve la XP ganada. */
  record(event: ProgressEventInput): number;
  /** Sustituye el progreso (por ejemplo, al iniciar sesión con el de la cuenta). */
  replace(state: ProgressState): void;
  /** XP ganada en el último evento, para animaciones. */
  lastXp: { amount: number; at: number } | null;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function loadGuestProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ProgressState;
      if (parsed && parsed.v === 1) return { ...emptyProgress(), ...parsed };
    }
  } catch {
    // Sin almacenamiento o datos corruptos: empezamos de cero.
  }
  return emptyProgress();
}

export function ProgressProvider({ children, sync }: { children: ReactNode; sync?: ProgressSync | null }) {
  const [state, setState] = useState<ProgressState>(loadGuestProgress);
  const [lastXp, setLastXp] = useState<ProgressContextValue['lastXp']>(null);
  const [today, setToday] = useState(() => localDay());
  const stateRef = useRef(state);
  const queue = useRef<ProgressEvent[]>([]);
  const flushing = useRef(false);
  stateRef.current = state;

  // La fecha cambia a medianoche aunque la pestaña siga abierta.
  useEffect(() => {
    const id = setInterval(() => setToday(localDay()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignorado: sin almacenamiento el progreso dura lo que la pestaña.
    }
  }, [state]);

  const flush = useCallback(async () => {
    if (!sync || flushing.current || queue.current.length === 0) return;
    flushing.current = true;
    const batch = queue.current.splice(0, queue.current.length);
    try {
      const official = await sync.push(batch);
      // Reaplicamos los eventos que hayan llegado mientras tanto.
      let next = official;
      for (const e of queue.current) next = applyEvent(next, e).state;
      setState(next);
    } catch {
      // Sin conexión: devolvemos el lote a la cola y lo reintentamos más tarde.
      queue.current.unshift(...batch);
      setTimeout(() => void flush(), 15_000);
    } finally {
      flushing.current = false;
    }
  }, [sync]);

  const record = useCallback(
    (input: ProgressEventInput) => {
      const event = { ...input, day: localDay() } as ProgressEvent;
      const result = applyEvent(stateRef.current, event);
      stateRef.current = result.state;
      setState(result.state);
      if (result.xp > 0) setLastXp({ amount: result.xp, at: Date.now() });
      if (sync) {
        queue.current.push(event);
        void flush();
      }
      return result.xp;
    },
    [sync, flush],
  );

  const replace = useCallback((next: ProgressState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const value = useMemo(() => ({ state, today, record, replace, lastXp }), [state, today, record, replace, lastXp]);
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress necesita <ProgressProvider>');
  return ctx;
}
