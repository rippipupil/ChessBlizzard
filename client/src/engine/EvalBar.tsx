// Barra de evaluación: la parte clara es la ventaja de las blancas (probabilidad de ganar).
import { useT } from '../i18n';
import { useSettings } from '../state/settings';
import { formatScore, winPercent, type Score } from './score';
import './engine.css';

export interface EvalBarProps {
  score: Score | null;
  /** Orientación del tablero: con 'white', las blancas abajo. */
  orientation?: 'white' | 'black';
  /** Barra horizontal (por ejemplo, encima del tablero en móvil). */
  horizontal?: boolean;
  /** El motor sigue pensando. */
  thinking?: boolean;
  className?: string;
}

export function EvalBar({ score, orientation = 'white', horizontal = false, thinking = false, className }: EvalBarProps) {
  const t = useT();
  const { settings } = useSettings();
  const pct = winPercent(score);
  const label = score ? formatScore(score, settings.locale) : '…';
  const whiteAhead = pct >= 50;
  // La etiqueta va en el extremo del bando que va mejor.
  const whiteAtStart = horizontal ? orientation === 'white' : orientation === 'black';
  const labelAtStart = whiteAhead === whiteAtStart;
  const cls = ['cb-evalbar', horizontal ? 'cb-evalbar-h' : 'cb-evalbar-v', whiteAtStart ? 'cb-evalbar-wstart' : 'cb-evalbar-wend'];
  if (thinking) cls.push('cb-evalbar-thinking');
  if (className) cls.push(className);
  return (
    <div
      className={cls.join(' ')}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      aria-valuetext={label}
      aria-label={t('lesson.engine.evalBar')}
    >
      <div className="cb-evalbar-fill" style={horizontal ? { width: `${pct}%` } : { height: `${pct}%` }} />
      <span className={`cb-evalbar-label ${labelAtStart ? 'cb-evalbar-label-start' : 'cb-evalbar-label-end'} ${whiteAhead ? 'cb-on-white' : 'cb-on-black'}`}>
        {label}
      </span>
    </div>
  );
}
