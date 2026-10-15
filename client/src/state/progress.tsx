// Progreso del alumno. Se calcula siempre en el navegador con el mismo reductor que el
// servidor, para que la interfaz responda al instante. Con sesión iniciada, los eventos
// también se envían al servidor mediante el adaptador `sync`.
//
// Protocolo con el servidor:
//  1. Al activarse `sync` (inicio de sesión o recarga con sesión), `attach` sube el progreso
//     local y el servidor lo fusiona con el de la cuenta. Ese progreso ya incluye los eventos
//     que estuvieran en la cola, así que esos se dan por enviados.
//  2. Después, cada evento se envía con `push`. La respuesta (el progreso oficial) sustituye
//     al local, reaplicando encima los eventos que hayan llegado mientras tanto.
//  3. Sin red se reintenta con una espera creciente y al recuperar la conexión. Si el servidor
//     rechaza un lote (validación), se envía evento a evento y se descartan solo los rechazados.
//  4. Si la sesión se cierra (`sync` pasa a null), el progreso local era una copia del de la
//     cuenta: se borra para que el siguiente invitado empiece de cero.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { applyEvent, emptyProgress, localDay, type ProgressEvent, type ProgressState } from '@chessblizzard/shared';

const STORAGE_KEY = 'cb.progress.v1';
const RETRY_MIN = 5_000;
const RETRY_MAX = 120_000;
/** El servidor admite como mucho 200 eventos por petición. */
const MAX_BATCH = 100;

type DistributiveOmit<T, K extends keyof never> = T extends unknown ? Omit<T, K> : never;
export type ProgressEventInput = DistributiveOmit<ProgressEvent, 'day'>;

export interface ProgressSync {
  /** Envía eventos al servidor. Debe resolver con el progreso oficial de la cuenta. */
  push(events: ProgressEvent[]): Promise<ProgressState>;
  /** Sube el progreso local al activarse la sesión y devuelve el oficial ya fusionado. */
  attach?(local: ProgressState): Promise<ProgressState>;
  /** Descarga el progreso oficial (si el servidor rechaza lo que se le envía). */
  pull?(): Promise<ProgressState>;
}

/** local: modo invitado · syncing: enviando · synced: al día · offline: pendiente de enviar. */
export type SyncStatus = 'local' | 'syncing' | 'synced' | 'offline';

interface ProgressContextValue {
  state: ProgressState;
  /** Fecha local de hoy (AAAA-MM-DD). */
  today: string;
  /** Registra un evento (completar etapa, repasar línea, resolver puzzle...). Devuelve la XP ganada. */
  record(event: ProgressEventInput): number;
  /** Sustituye el progreso. */
  replace(state: ProgressState): void;
  /** XP ganada en el último evento, para animaciones. */
  lastXp: { amount: number; at: number } | null;
  /** Estado de la sincronización con la cuenta. */
  syncStatus: SyncStatus;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

function parseProgress(raw: string | null): ProgressState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ProgressState;
    if (parsed && parsed.v === 1) return { ...emptyProgress(), ...parsed };
  } catch {
    // Datos corruptos: se ignoran.
  }
  return null;
}

export function loadGuestProgress(): ProgressState {
  try {
    return parseProgress(localStorage.getItem(STORAGE_KEY)) ?? emptyProgress();
  } catch {
    // Sin almacenamiento: empezamos de cero.
    return emptyProgress();
  }
}

function reapply(base: ProgressState, events: ProgressEvent[]): ProgressState {
  let s = base;
  for (const e of events) s = applyEvent(s, e).state;
  return s;
}

/** El servidor ha rechazado los datos: reintentar el mismo envío no servirá de nada. */
function isRejected(err: unknown): boolean {
  const code = (err as { code?: unknown } | null)?.code;
  return code === 'validation' || code === 'not_found';
}

export function ProgressProvider({ children, sync = null }: { children: ReactNode; sync?: ProgressSync | null }) {
  const [state, setState] = useState<ProgressState>(loadGuestProgress);
  const [lastXp, setLastXp] = useState<ProgressContextValue['lastXp']>(null);
  const [today, setToday] = useState(() => localDay());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('local');
  const stateRef = useRef(state);
  const syncRef = useRef<ProgressSync | null>(null);
  const queue = useRef<ProgressEvent[]>([]);
  const attached = useRef(false);
  const busy = useRef(false);
  const pending = useRef(false);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const retryDelay = useRef(RETRY_MIN);
  const flushRef = useRef<() => void>(() => {});

  const commit = useCallback((next: ProgressState) => {
    stateRef.current = next;
    setState(next);
  }, []);

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

  // Otra pestaña ha guardado progreso: lo adoptamos sin perder los eventos aún por enviar.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const next = parseProgress(e.newValue);
      if (next) commit(reapply(next, queue.current));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [commit]);

  const flush = useCallback(async () => {
    const s = syncRef.current;
    if (!s) return;
    if (busy.current) {
      pending.current = true;
      return;
    }
    if (attached.current && queue.current.length === 0) return;
    busy.current = true;
    clearTimeout(retryTimer.current);
    setSyncStatus('syncing');
    let dropped = false;
    try {
      if (!attached.current) {
        const covered = queue.current.length;
        if (s.attach) {
          let official: ProgressState;
          try {
            official = await s.attach(stateRef.current);
          } catch (err) {
            if (!isRejected(err) || !s.pull) throw err;
            official = await s.pull();
          }
          if (syncRef.current !== s) return;
          queue.current.splice(0, covered);
          commit(reapply(official, queue.current));
        }
        attached.current = true;
      }

      let oneByOne = false;
      while (queue.current.length > 0) {
        const batch = queue.current.slice(0, oneByOne ? 1 : MAX_BATCH);
        let official: ProgressState;
        try {
          official = await s.push(batch);
        } catch (err) {
          if (syncRef.current !== s) return;
          if (!isRejected(err)) throw err;
          if (batch.length > 1) {
            oneByOne = true;
          } else {
            // El servidor no acepta este evento (por ejemplo, una etapa que ya no existe).
            queue.current.shift();
            dropped = true;
          }
          continue;
        }
        if (syncRef.current !== s) return;
        queue.current.splice(0, batch.length);
        commit(reapply(official, queue.current));
        dropped = false;
      }
      if (dropped && s.pull) {
        const official = await s.pull();
        if (syncRef.current !== s) return;
        commit(reapply(official, queue.current));
      }
      retryDelay.current = RETRY_MIN;
      setSyncStatus('synced');
    } catch {
      if (syncRef.current !== s) return;
      // Sin conexión o servidor caído: se reintenta más tarde con espera creciente.
      setSyncStatus('offline');
      const delay = retryDelay.current;
      retryDelay.current = Math.min(RETRY_MAX, delay * 2);
      retryTimer.current = setTimeout(() => flushRef.current(), delay);
    } finally {
      busy.current = false;
      if (pending.current) {
        pending.current = false;
        if (syncRef.current) queueMicrotask(() => flushRef.current());
      }
    }
  }, [commit]);

  useEffect(() => {
    flushRef.current = () => void flush();
  }, [flush]);

  // Cambio de sesión: inicio (sube el progreso local), cierre (lo borra) o cambio de cuenta.
  useEffect(() => {
    const prev = syncRef.current;
    const next = sync ?? null;
    if (prev === next) return;
    syncRef.current = next;
    clearTimeout(retryTimer.current);
    retryDelay.current = RETRY_MIN;
    attached.current = false;
    if (prev) {
      queue.current = [];
      commit(emptyProgress());
    }
    if (next) {
      setSyncStatus('syncing');
      void flush();
    } else {
      setSyncStatus('local');
    }
  }, [sync, flush, commit]);

  // Al recuperar la conexión se reintenta enseguida.
  useEffect(() => {
    const onOnline = () => {
      retryDelay.current = RETRY_MIN;
      void flush();
    };
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('online', onOnline);
      clearTimeout(retryTimer.current);
    };
  }, [flush]);

  const record = useCallback(
    (input: ProgressEventInput) => {
      const event = { ...input, day: localDay() } as ProgressEvent;
      const result = applyEvent(stateRef.current, event);
      commit(result.state);
      setToday((d) => (d === event.day ? d : event.day));
      if (result.xp > 0) setLastXp({ amount: result.xp, at: Date.now() });
      if (syncRef.current) {
        queue.current.push(event);
        void flush();
      }
      return result.xp;
    },
    [commit, flush],
  );

  const value = useMemo(
    () => ({ state, today, record, replace: commit, lastXp, syncStatus }),
    [state, today, record, commit, lastXp, syncStatus],
  );
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress necesita <ProgressProvider>');
  return ctx;
}
