// Columna del tablero: jugador de arriba, tablero (con barra de evaluación opcional),
// jugador de abajo con la leyenda de flechas, y controles para recorrer la línea.
import type { ReactNode } from 'react';
import { Board, type BoardProps } from '../board';
import { useT } from '../i18n';
import { ArrowLegend, Icon, PlayerTag } from './ui';

export interface PlayerInfo {
  name: string;
  note?: ReactNode;
}

export interface NavControls {
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
  canPrev: boolean;
  canNext: boolean;
}

export function BoardArea({
  board,
  players,
  nav,
  onFlip,
  evalBar,
  below,
}: {
  board: BoardProps;
  players: Record<'w' | 'b', PlayerInfo>;
  nav?: NavControls | null;
  onFlip?: () => void;
  evalBar?: ReactNode;
  below?: ReactNode;
}) {
  const t = useT();
  const orientation = board.orientation ?? 'white';
  const top: 'w' | 'b' = orientation === 'white' ? 'b' : 'w';
  const bottom: 'w' | 'b' = top === 'w' ? 'b' : 'w';
  const kinds = (board.arrows ?? []).map((a) => a.kind);
  return (
    <section className="cb-boardcol" aria-label={t('lesson.boardArea')}>
      <PlayerTag color={top} name={players[top].name} note={players[top].note} />
      <div className={`cb-boardwrap${evalBar ? ' cb-boardwrap-eval' : ''}`}>
        {evalBar}
        <Board {...board} />
      </div>
      <PlayerTag color={bottom} name={players[bottom].name} note={players[bottom].note}>
        <ArrowLegend kinds={kinds} />
      </PlayerTag>
      {(nav || onFlip) && (
        <div className="cb-boardnav">
          {nav && (
            <div className="cb-nav" role="group" aria-label={t('lesson.nav.label')}>
              <button type="button" className="cb-nav-btn" onClick={nav.onFirst} disabled={!nav.canPrev} aria-label={t('lesson.nav.first')} title={t('lesson.nav.first')}>
                <Icon name="first" />
              </button>
              <button type="button" className="cb-nav-btn" onClick={nav.onPrev} disabled={!nav.canPrev} aria-label={t('lesson.nav.prev')} title={t('lesson.nav.prev')}>
                <Icon name="prev" />
              </button>
              <button type="button" className="cb-nav-btn cb-nav-main" onClick={nav.onNext} disabled={!nav.canNext} aria-label={t('lesson.nav.next')} title={t('lesson.nav.next')}>
                <Icon name="next" />
              </button>
              <button type="button" className="cb-nav-btn" onClick={nav.onLast} disabled={!nav.canNext} aria-label={t('lesson.nav.last')} title={t('lesson.nav.last')}>
                <Icon name="last" />
              </button>
            </div>
          )}
          {onFlip && (
            <button type="button" className="cb-flip" onClick={onFlip} aria-label={t('lesson.nav.flip')} title={t('lesson.nav.flip')}>
              <Icon name="flip" stroke={2} />
            </button>
          )}
        </div>
      )}
      {below}
    </section>
  );
}
