// Marco de las lecciones en modo concentración: barra superior (salir, progreso, XP),
// contenido (tablero + panel) y barra inferior de feedback al estilo Duolingo.
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Ghost, type GhostMood } from '../theme/Ghost';
import { useT } from '../i18n';
import { usePlural } from './hooks';
import { BoltIcon, Button, FlameIcon, Icon, IconButton, type IconName } from './ui';
import './lesson.css';

/** true dentro de <LessonShell>: el feedback va en una barra fija abajo. */
const ShellContext = createContext(false);

export function useInShell() {
  return useContext(ShellContext);
}

export interface ShellProgress {
  /** Texto de la izquierda ("India de Rey · Línea principal"). */
  label: string;
  /** Texto de la derecha ("Jugada 10 de 28"). */
  right?: string;
  /** 0–1. */
  value: number;
  /** Barra por tramos (una por línea en el repaso). */
  segments?: { done: number; total: number };
}

export function LessonShell({
  onExit,
  progress,
  xp,
  streak,
  feedback,
  children,
  wide = false,
}: {
  onExit: () => void;
  progress: ShellProgress;
  /** XP ganada en esta sesión. */
  xp?: number;
  /** Racha de días (se muestra en lugar de la XP si se da). */
  streak?: number;
  feedback?: ReactNode;
  children: ReactNode;
  /** Contenido a lo ancho (pantallas de resultado, listas). */
  wide?: boolean;
}) {
  const t = useT();
  const plural = usePlural();
  const pct = Math.round(Math.max(0, Math.min(1, progress.value)) * 100);
  const [pop, setPop] = useState(false);
  const prevXp = useRef(xp ?? 0);
  useEffect(() => {
    if ((xp ?? 0) > prevXp.current) {
      setPop(true);
      const id = setTimeout(() => setPop(false), 700);
      prevXp.current = xp ?? 0;
      return () => clearTimeout(id);
    }
    prevXp.current = xp ?? 0;
  }, [xp]);

  return (
    <ShellContext.Provider value={true}>
      <div className="cb-lesson">
        <header className="cb-lesson-top">
          <IconButton icon="close" label={t('lesson.exitLabel')} onClick={onExit} className="cb-exit" />
          <div className="cb-top-progress">
            <div className="cb-top-labels">
              <span className="cb-top-label">{progress.label}</span>
              {progress.right && <span className="cb-top-right">{progress.right}</span>}
            </div>
            {progress.segments ? (
              <div
                className="cb-segs"
                style={{ gridTemplateColumns: `repeat(${progress.segments.total}, minmax(0, 1fr))` }}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={progress.segments.total}
                aria-valuenow={progress.segments.done}
                aria-label={progress.label}
              >
                {Array.from({ length: progress.segments.total }, (_, i) => (
                  <span key={i} className={`cb-seg${i < progress.segments!.done ? ' cb-seg-done' : ''}`} />
                ))}
              </div>
            ) : (
              <div className="cb-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={progress.label}>
                <div className="cb-progress-fill" style={{ width: `${pct}%` }} />
              </div>
            )}
          </div>
          {streak !== undefined ? (
            <div className="cb-pill" aria-label={t('lesson.streakLabel', { n: streak })}>
              <FlameIcon />
              {plural('lesson.streakDays', streak)}
            </div>
          ) : (
            <div className={`cb-pill cb-xp${pop ? ' cb-xp-pop' : ''}`} aria-label={t('lesson.xpLabel', { n: xp ?? 0 })} aria-live="polite">
              <BoltIcon />+{xp ?? 0} XP
            </div>
          )}
        </header>
        <main className={`cb-lesson-main${wide ? ' cb-lesson-main-wide' : ''}`}>{children}</main>
        {feedback}
      </div>
    </ShellContext.Provider>
  );
}

// --- Panel ------------------------------------------------------------------

export function PanelHeader({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <div className="cb-panel-head">
      <div className="cb-panel-titles">
        <span className="cb-kicker">{kicker}</span>
        <h1 className="cb-title">{title}</h1>
      </div>
      {children}
    </div>
  );
}

export interface TabItem<T extends string> {
  id: T;
  label: string;
  disabled?: boolean;
}

export function Tabs<T extends string>({ items, value, onChange, label }: { items: TabItem<T>[]; value: T; onChange: (id: T) => void; label: string }) {
  return (
    <div className="cb-tabs" role="tablist" aria-label={label} style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          role="tab"
          aria-selected={it.id === value}
          className="cb-tab"
          disabled={it.disabled}
          onClick={() => it.id !== value && onChange(it.id)}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

export function Section({ label, children, className }: { label?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`cb-section${className ? ` ${className}` : ''}`}>
      {label && <h2 className="cb-label">{label}</h2>}
      {children}
    </div>
  );
}

/** Comentario de la mascota con título y texto. */
export function Comment({ mood = 'neutral', title, children }: { mood?: GhostMood; title?: ReactNode; children?: ReactNode }) {
  return (
    <div className="cb-section cb-comment">
      <Ghost mood={mood} size={52} />
      <div className="cb-comment-body">
        {title && <h2 className="cb-comment-title">{title}</h2>}
        {children}
      </div>
    </div>
  );
}

// --- Feedback ---------------------------------------------------------------

export interface FeedbackAction {
  label: string;
  onClick: () => void;
}

/** Elementos que usan Intro por sí mismos (un botón enfocado con el teclado, un campo de texto...). */
function ownsEnter(el: Element | null) {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (el as HTMLElement).isContentEditable) return true;
  // Un botón pulsado con el ratón no se queda con Intro; uno al que se llegó con Tab, sí.
  if (tag === 'BUTTON' || tag === 'A') return el.matches(':focus-visible');
  return false;
}

/**
 * Barra de feedback: "¡Correcto!" o "No es la jugada del repertorio", con la explicación y
 * el botón Continuar (también con Intro). Dentro de LessonShell va fija abajo; fuera, en línea.
 */
export function Feedback({
  tone,
  title,
  icon,
  xp,
  mood,
  action,
  secondary,
  children,
}: {
  tone: 'ok' | 'err' | 'info';
  title: ReactNode;
  icon?: IconName;
  xp?: number;
  mood?: GhostMood;
  action?: FeedbackAction | null;
  secondary?: ReactNode;
  children?: ReactNode;
}) {
  const inShell = useInShell();
  const actionRef = useRef(action);
  actionRef.current = action;
  const hasAction = !!action;

  useEffect(() => {
    if (!hasAction) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.defaultPrevented || e.repeat) return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (ownsEnter(document.activeElement)) return;
      e.preventDefault();
      actionRef.current?.onClick();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hasAction]);

  const ghostMood: GhostMood = mood ?? (tone === 'ok' ? 'happy' : tone === 'err' ? 'sad' : 'thinking');
  const iconName: IconName = icon ?? (tone === 'ok' ? 'check' : tone === 'err' ? 'cross' : 'bulb');
  return (
    <div className={`cb-feedback cb-feedback-${tone}${inShell ? ' cb-feedback-fixed' : ' cb-feedback-inline'}`} role="status" aria-live="polite">
      <div className="cb-feedback-inner">
        <span className="cb-feedback-ghost">
          <Ghost mood={ghostMood} size={inShell ? 64 : 48} />
        </span>
        <div className="cb-feedback-body">
          <div className="cb-feedback-head">
            <Icon name={iconName} size={24} stroke={3} className="cb-feedback-icon" />
            <span className="cb-feedback-title">{title}</span>
            {xp !== undefined && xp > 0 && <span className="cb-xp-badge">+{xp} XP</span>}
          </div>
          {children && <div className="cb-feedback-text">{children}</div>}
        </div>
        {(action || secondary) && (
          <div className="cb-feedback-actions">
            {secondary}
            {action && (
              <Button variant="primary" className="cb-feedback-btn" onClick={action.onClick}>
                {action.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Pantalla de etapa completada --------------------------------------------

export function CompleteScreen({
  title,
  text,
  mood = 'happy',
  stats,
  actions,
  children,
}: {
  title: string;
  text?: ReactNode;
  mood?: GhostMood;
  stats?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="cb-complete" aria-label={title}>
      <div className="cb-complete-flakes" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 7) * 0.35}s`, animationDuration: `${3.2 + (i % 5) * 0.5}s` }} />
        ))}
      </div>
      <div className="cb-complete-ghost">
        <Ghost mood={mood} size={104} />
      </div>
      <h1 className="cb-complete-title">{title}</h1>
      {text && <p className="cb-complete-text">{text}</p>}
      {stats && <div className="cb-complete-stats">{stats}</div>}
      {children}
      {actions && <div className="cb-complete-actions">{actions}</div>}
    </section>
  );
}

/** Estado vacío elegante (sin puzzles, sin repasos...). */
export function EmptyNote({ title, text, mood = 'thinking', actions }: { title: string; text?: ReactNode; mood?: GhostMood; actions?: ReactNode }) {
  return (
    <section className="cb-empty">
      <Ghost mood={mood} size={88} />
      <h2 className="cb-empty-title">{title}</h2>
      {text && <p className="cb-empty-text">{text}</p>}
      {actions && <div className="cb-complete-actions">{actions}</div>}
    </section>
  );
}

export { Icon };
