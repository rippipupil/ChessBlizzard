// Textos de la interfaz en español e inglés.
//
// Cada parte de la app tiene su propio diccionario en ./strings para que varios
// equipos puedan trabajar a la vez sin pisarse:
//   strings/app.ts     -> menú, inicio, perfil, ajustes, cuenta
//   strings/lesson.ts  -> tablero, lecciones, práctica, puzzles, sparring, análisis
// Las claves llevan prefijo de su parte: "app.*" y "lesson.*".
import { useCallback } from 'react';
import type { L10n, NotationStyle } from '@chessblizzard/shared';
import { useSettings } from '../state/settings';
import { appStrings } from './strings/app';
import { lessonStrings } from './strings/lesson';

export type Dict = Record<string, L10n>;

const ALL: Dict = { ...appStrings, ...lessonStrings };

function interpolate(text: string, vars?: Record<string, string | number>): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/** Traduce una clave de la interfaz: t('lesson.correct', { move: 'Nf3' }). */
export function useT() {
  const { settings } = useSettings();
  return useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const entry = ALL[key];
      if (!entry) {
        if (import.meta.env.DEV) console.warn(`[i18n] falta la clave "${key}"`);
        return key;
      }
      return interpolate(entry[settings.locale], vars);
    },
    [settings.locale],
  );
}

/** Elige el idioma de un texto del contenido (L10n). */
export function useTx() {
  const { settings } = useSettings();
  return useCallback((text: L10n | undefined) => (text ? text[settings.locale] : ''), [settings.locale]);
}

export function useNotation(): NotationStyle {
  return useSettings().settings.notation;
}

export function useLocale() {
  return useSettings().settings.locale;
}
