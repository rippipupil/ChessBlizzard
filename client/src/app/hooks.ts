// Utilidades de la aplicación: título del documento, formatos según el idioma, medidas de
// elementos y el curso elegido (que se recuerda en el navegador).
import { useCallback, useEffect, useLayoutEffect, useMemo, useState, useSyncExternalStore, type RefObject } from 'react';
import { courses, type Course } from '@chessblizzard/shared';
import { useLocale, useT } from '../i18n';

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · ChessBlizzard` : 'ChessBlizzard';
  }, [title]);
}

/** Números, porcentajes y fechas en el idioma de la interfaz ("1.240" en español). */
export function useFormat() {
  const locale = useLocale();
  return useMemo(() => {
    const tag = locale === 'es' ? 'es-ES' : 'en-GB';
    const num = new Intl.NumberFormat(tag, { useGrouping: 'always' });
    const date = new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'long', year: 'numeric' });
    const short = new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'short' });
    return {
      num: (n: number) => num.format(n),
      pct: (ratio: number) => `${Math.round(ratio * 100)}%`,
      /** Fecha AAAA-MM-DD o ISO. */
      date: (value: string) => date.format(new Date(value.length === 10 ? `${value}T12:00:00` : value)),
      shortDate: (value: string) => short.format(new Date(value.length === 10 ? `${value}T12:00:00` : value)),
    };
  }, [locale]);
}

/** Texto en singular o plural: claves "x.one" y "x.other" con {n}. */
export function usePlural() {
  const t = useT();
  return useCallback((key: string, n: number, vars?: Record<string, string | number>) => t(`${key}.${n === 1 ? 'one' : 'other'}`, { n, ...vars }), [t]);
}

/** Ancho del contenido de un elemento, actualizado al cambiar de tamaño. */
export function useElementWidth(ref: RefObject<HTMLElement | null>, initial: number): number {
  const [width, setWidth] = useState(initial);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w !== undefined) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

// --- Curso elegido ------------------------------------------------------------

const COURSE_KEY = 'cb.course.v1';
const courseListeners = new Set<() => void>();

function readCourseId(): string {
  try {
    const id = localStorage.getItem(COURSE_KEY);
    if (id && courses.some((c) => c.id === id)) return id;
  } catch {
    // Sin almacenamiento: el primer curso.
  }
  return courses[0].id;
}

let currentCourseId = readCourseId();

/** Recuerda el curso (por ejemplo, al abrir una etapa desde un enlace). */
export function rememberCourse(id: string) {
  if (id === currentCourseId || !courses.some((c) => c.id === id)) return;
  currentCourseId = id;
  try {
    localStorage.setItem(COURSE_KEY, id);
  } catch {
    // Ignorado.
  }
  courseListeners.forEach((l) => l());
}

function subscribeCourse(cb: () => void) {
  courseListeners.add(cb);
  return () => courseListeners.delete(cb);
}

export function useSelectedCourse(): [Course, (id: string) => void] {
  const id = useSyncExternalStore(subscribeCourse, () => currentCourseId);
  const course = courses.find((c) => c.id === id) ?? courses[0];
  return [course, rememberCourse];
}
