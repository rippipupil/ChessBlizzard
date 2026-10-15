// Piezas de interfaz comunes a las páginas de la aplicación.
import { useCallback, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { currentStreak, levelInfo, parseRichText, plainText } from '@chessblizzard/shared';
import { useNotation, useT } from '../i18n';
import { useProgress } from '../state/progress';
import { useSettings } from '../state/settings';
import { Ghost, ghostName, type GhostMood } from '../theme/Ghost';
import { useFormat, usePlural } from './hooks';
import { Icon } from './icons';

/**
 * Texto del contenido con las jugadas entre corchetes ("[9...Nd7]") pintadas como chips en
 * la notación elegida (C A T D R o N B R Q K).
 */
export function RichText({ text }: { text: string }) {
  const notation = useNotation();
  return (
    <>
      {parseRichText(text, notation).map((seg, i) =>
        seg.kind === 'move' ? (
          <span key={i} className="app-move">
            {seg.value}
          </span>
        ) : (
          seg.value
        ),
      )}
    </>
  );
}

/** Lo mismo como texto plano (para avisos, títulos y aria-label). */
export function usePlainText() {
  const notation = useNotation();
  return useCallback((text: string) => plainText(text, notation), [notation]);
}

/** Barra de progreso accesible. `ratio` entre 0 y 1. */
export function Bar({
  ratio,
  label,
  tone = 'done',
  size = 'm',
  className = '',
}: {
  ratio: number;
  label: string;
  tone?: 'done' | 'warn' | 'accent';
  size?: 's' | 'm' | 'l';
  className?: string;
}) {
  const pct = Math.round(Math.max(0, Math.min(1, Number.isFinite(ratio) ? ratio : 0)) * 100);
  return (
    <div
      className={`app-bar app-bar--${size} app-bar--${tone} ${className}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
    >
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Racha, XP y nivel. En la versión compacta (cabecera móvil) no sale el nivel. */
export function StatChips({ compact = false, className = '' }: { compact?: boolean; className?: string }) {
  const t = useT();
  const plural = usePlural();
  const f = useFormat();
  const { state, today } = useProgress();
  const streak = currentStreak(state, today);
  const { level } = levelInfo(state.xp);
  const iconSize = compact ? 16 : 20;
  return (
    <ul className={`app-chips${compact ? ' is-compact' : ''} ${className}`} aria-label={t('app.stats.label')}>
      <li className="app-chip" title={t('app.stats.streak')}>
        <Icon name="flame" size={iconSize} className="app-ic-warn" />
        <span aria-hidden="true">{streak}</span>
        <span className="app-visually-hidden">{plural('app.stats.streakDays', streak)}</span>
      </li>
      <li className="app-chip" title={t('app.stats.xp')}>
        <Icon name="bolt" size={iconSize} className="app-ic-accent" />
        <span aria-hidden="true">{f.num(state.xp)}</span>
        <span className="app-visually-hidden">{t('app.stats.xpLong', { n: f.num(state.xp) })}</span>
      </li>
      {!compact && (
        <li className="app-chip app-chip--level" title={t('app.stats.level')}>
          <span aria-hidden="true">{t('app.stats.levelShort', { n: level })}</span>
          <span className="app-visually-hidden">{t('app.stats.levelLong', { n: level })}</span>
        </li>
      )}
    </ul>
  );
}

export interface Choice<T extends string> {
  value: T;
  label: ReactNode;
}

/** Grupo de opciones excluyentes (role="radiogroup") con flechas del teclado. */
export function RadioGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  className = '',
}: {
  label: string;
  value: T;
  options: Choice<T>[];
  onChange(value: T): void;
  className?: string;
}) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const selected = options.findIndex((o) => o.value === value);
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = options.length - 1;
    const next =
      e.key === 'ArrowRight' || e.key === 'ArrowDown'
        ? i === last
          ? 0
          : i + 1
        : e.key === 'ArrowLeft' || e.key === 'ArrowUp'
          ? i === 0
            ? last
            : i - 1
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? last
              : -1;
    if (next < 0) return;
    e.preventDefault();
    onChange(options[next].value);
    refs.current[next]?.focus();
  };
  return (
    <div role="radiogroup" aria-label={label} className={`app-seg ${className}`}>
      {options.map((o, i) => (
        <button
          key={o.value}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          tabIndex={(selected < 0 ? i === 0 : i === selected) ? 0 : -1}
          className="app-seg-btn"
          onClick={() => onChange(o.value)}
          onKeyDown={(e) => onKeyDown(e, i)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Switch({ checked, onChange, labelledBy, describedBy }: { checked: boolean; onChange(next: boolean): void; labelledBy: string; describedBy?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className="app-switch"
      onClick={() => onChange(!checked)}
    >
      <span className="app-switch-knob" />
    </button>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <header className="app-page-head">
      <div className="app-page-head-text">
        <span className="app-eyebrow">{eyebrow}</span>
        <h1 className="app-h1">{title}</h1>
      </div>
      {children}
    </header>
  );
}

export function EmptyState({ mood = 'happy', title, children, actions }: { mood?: GhostMood; title: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <section className="app-empty" aria-labelledby="app-empty-title">
      <div className="app-empty-ghost app-float" aria-hidden="true">
        <Ghost size={96} mood={mood} />
      </div>
      <h1 id="app-empty-title" className="app-empty-title">
        {title}
      </h1>
      {children && <div className="app-empty-text">{children}</div>}
      {actions && <div className="app-empty-actions">{actions}</div>}
    </section>
  );
}

/** Consejo de la mascota. */
export function GhostTip({ text, mood = 'happy' }: { text: string; mood?: GhostMood }) {
  const { settings } = useSettings();
  return (
    <div className="app-card app-tip">
      <span className="app-tip-ghost" aria-hidden="true">
        <Ghost size={58} mood={mood} />
      </span>
      <p className="app-tip-text">
        <strong>{ghostName(settings.theme)}:</strong> {text}
      </p>
    </div>
  );
}

export function Loading({ full = false }: { full?: boolean }) {
  const t = useT();
  return (
    <div className={`app-loading${full ? ' is-full' : ''}`} role="status">
      <span className="app-float" aria-hidden="true">
        <Ghost mood="thinking" size={56} />
      </span>
      <span>{t('app.loading')}</span>
    </div>
  );
}
