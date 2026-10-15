// Ajustes del usuario: se guardan en el navegador y, con sesión iniciada, en la cuenta.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_SETTINGS, sanitizeSettings, type Settings } from '@chessblizzard/shared';

const STORAGE_KEY = 'cb.settings.v1';

interface SettingsContextValue {
  settings: Settings;
  /** Cambia uno o varios ajustes. */
  update(patch: Partial<Settings>): void;
  /** Sustituye los ajustes (por ejemplo, al iniciar sesión). */
  replace(settings: Settings): void;
  /** Modo de color efectivo, resolviendo "system". */
  mode: 'dark' | 'light';
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...sanitizeSettings(JSON.parse(raw)) };
  } catch {
    // El navegador puede bloquear el almacenamiento: seguimos con los valores por defecto.
  }
  const locale = typeof navigator !== 'undefined' && navigator.language?.startsWith('en') ? 'en' : 'es';
  return { ...DEFAULT_SETTINGS, locale, notation: locale };
}

function systemMode(): 'dark' | 'light' {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function SettingsProvider({ children, onChange }: { children: ReactNode; onChange?: (patch: Partial<Settings>) => void }) {
  const [settings, setSettings] = useState<Settings>(load);
  const [sysMode, setSysMode] = useState(systemMode);

  useEffect(() => {
    if (typeof matchMedia === 'undefined') return;
    const mq = matchMedia('(prefers-color-scheme: light)');
    const listener = () => setSysMode(mq.matches ? 'light' : 'dark');
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, []);

  const mode = settings.colorMode === 'system' ? sysMode : settings.colorMode;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    root.dataset.mode = mode;
    root.lang = settings.locale;
  }, [settings.theme, settings.locale, mode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Sin almacenamiento: los ajustes duran lo que dure la pestaña.
    }
  }, [settings]);

  // Cambios hechos en otra pestaña.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...sanitizeSettings(JSON.parse(e.newValue)) });
      } catch {
        // Valor corrupto: se ignora.
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const update = useCallback(
    (patch: Partial<Settings>) => {
      setSettings((s) => ({ ...s, ...patch }));
      onChange?.(patch);
    },
    [onChange],
  );
  const replace = useCallback((next: Settings) => setSettings({ ...DEFAULT_SETTINGS, ...sanitizeSettings(next) }), []);

  const value = useMemo(() => ({ settings, update, replace, mode }), [settings, update, replace, mode]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings necesita <SettingsProvider>');
  return ctx;
}
