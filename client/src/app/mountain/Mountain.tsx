// La montaña de un curso: silueta en sierra con sombra y nieve, el camino por las etapas
// (hecho en sólido, pendiente en punteado), los nodos con el icono de cada tipo de etapa y
// su estado, las etiquetas a los lados, los campamentos por altura y la bandera en la cumbre.
//
// Se dibuja a tamaño fijo (el de las maquetas: 740 px en escritorio y 390 px en móvil) y se
// escala para caber en el hueco disponible. Por debajo de 600 px usa la versión compacta.
import { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { flattenStages, type Course, type Stage, type StageStatus } from '@chessblizzard/shared';
import { useT, useTx } from '../../i18n';
import { useElementWidth, usePlural } from '../hooks';
import { Icon, STAGE_ICONS } from '../icons';
import { buildMountain, COMPACT_SPEC, FULL_SPEC } from './geometry';

const COMPACT_BELOW = 600;
const LABEL_W = 160;

interface Props {
  course: Course;
  statuses: StageStatus[];
  /** Se ha pulsado una etapa bloqueada. */
  onLocked(stage: Stage): void;
}

type CampState = 'done' | 'active' | 'locked';

export function Mountain({ course, statuses, onLocked }: Props) {
  const t = useT();
  const tx = useTx();
  const plural = usePlural();
  const wrapRef = useRef<HTMLDivElement>(null);
  const avail = useElementWidth(wrapRef, typeof window !== 'undefined' && window.innerWidth < 900 ? 390 : 740);
  const compact = avail < COMPACT_BELOW;
  const spec = compact ? COMPACT_SPEC : FULL_SPEC;

  const flat = useMemo(() => flattenStages(course), [course]);
  const sizesKey = course.camps.map((c) => c.stages.length).join(',');
  const current = statuses.indexOf('current');
  const geo = useMemo(() => buildMountain(spec, sizesKey.split(',').map(Number), current), [spec, sizesKey, current]);
  const scale = avail > 0 ? Math.min(1, avail / geo.width) : 1;

  const campStates: CampState[] = geo.camps.map((c) => {
    const slice = statuses.slice(c.first, c.last + 1);
    if (slice.every((s) => s === 'done')) return 'done';
    return slice.includes('current') ? 'active' : 'locked';
  });
  const activeCamp = Math.max(0, campStates.indexOf('active') >= 0 ? campStates.indexOf('active') : campStates.lastIndexOf('done'));
  const top = geo.camps[geo.camps.length - 1];
  const base = geo.camps[0];
  const mid = geo.camps[activeCamp];

  const stageLabel = (stage: Stage, status: StageStatus) =>
    [tx(stage.title), tx(stage.subtitle), t(`app.stage.status.${status}`)].filter(Boolean).join('. ');

  return (
    <div ref={wrapRef} className={`app-mountain-wrap${compact ? ' is-compact' : ''}`} style={{ height: geo.height * scale }}>
      <div
        className="app-mountain"
        style={{ width: geo.width, height: geo.height, transform: scale < 1 ? `scale(${scale})` : undefined, marginInline: scale < 1 ? 0 : 'auto' }}
      >
        <svg className="app-m-art" aria-hidden="true" focusable="false" width={geo.width} height={geo.height} viewBox={`0 0 ${geo.width} ${geo.height}`}>
          <g transform={`translate(${geo.ox} 0)`}>
            {geo.back.map((points, i) => (
              <polygon key={i} points={points} className="app-m-back" />
            ))}
            <polygon points={geo.front} className="app-m-front" />
            <polygon points={geo.shade} className="app-m-shade" />
            {geo.ridge && <polyline points={geo.ridge} className="app-m-ridge" />}
            <polygon points={geo.snow} className="app-m-snow" />
            <path d={geo.flagPole} className="app-m-pole" />
            <polygon points={geo.flag} className="app-m-flag" />
          </g>
          {!compact && top && base && mid && (
            <>
              <line x1={20} y1={top.y} x2={20} y2={mid.y} className="app-m-alt app-m-alt--todo" />
              <line x1={20} y1={mid.y} x2={20} y2={base.y} className="app-m-alt app-m-alt--done" />
            </>
          )}
          {geo.contours && <path d={geo.contours} className="app-m-contour" />}
          <g transform={`translate(${geo.ox} 0)`}>
            {geo.trailTodo && <path d={geo.trailTodo} className="app-m-trail app-m-trail--todo" />}
            {geo.trailDone && <path d={geo.trailDone} className="app-m-trail app-m-trail--done" />}
          </g>
        </svg>

        <ul className="app-m-camps" aria-label={t('app.learn.camps')}>
          {geo.camps.map((c, i) => {
            const camp = course.camps[c.campIndex];
            const total = c.last - c.first + 1;
            const done = statuses.slice(c.first, c.last + 1).filter((s) => s === 'done').length;
            const state = campStates[i];
            if (compact) {
              // En móvil solo se rotulan los campamentos de arriba, sobre su línea de cota.
              return c.first === 0 ? null : (
                <li key={camp.id} className={`app-m-camp-tag is-${state}`} style={{ top: c.y - 17 }}>
                  {tx(camp.name)}
                  <span className="app-visually-hidden">: {plural('app.learn.campCount', total, { done })}</span>
                </li>
              );
            }
            return (
              <li key={camp.id} className={`app-m-camp is-${state}`} style={{ top: c.y - 14 }}>
                <span className="app-m-camp-dot">
                  <Icon name={state === 'done' ? 'check' : 'flag'} size={14} strokeWidth={2.4} />
                </span>
                <span className="app-m-camp-text">
                  <span className="app-m-camp-name">{tx(camp.name)}</span>
                  {tx(camp.title) && <span className="app-m-camp-title">{tx(camp.title)}</span>}
                  <span className="app-m-camp-count">{plural('app.learn.campCount', total, { done })}</span>
                </span>
              </li>
            );
          })}
        </ul>

        <ol className="app-m-stages" aria-label={t('app.learn.path', { course: tx(course.name) })}>
          {flat.map(({ stage }, i) => {
            const status = statuses[i] ?? 'locked';
            const node = geo.nodes[i];
            if (!node) return null;
            const size = node.r * 2;
            const box = { left: node.x - node.r, top: node.y - node.r - 3, width: size, height: size };
            const iconSize = compact ? (status === 'locked' ? 18 : 20) : status === 'locked' ? 26 : 28;
            const icon =
              status === 'done' ? (
                <Icon name="check" size={iconSize} strokeWidth={3} />
              ) : (
                <Icon name={STAGE_ICONS[stage.type]} size={iconSize} strokeWidth={compact ? 2.4 : 2.2} />
              );
            return (
              <li key={stage.id} className={`app-m-stage is-${status}${node.summit ? ' is-summit' : ''}`}>
                {status === 'locked' ? (
                  <button type="button" className="app-m-node" style={box} aria-label={stageLabel(stage, status)} aria-disabled="true" onClick={() => onLocked(stage)}>
                    {icon}
                  </button>
                ) : (
                  <Link to={`/curso/${course.id}/${stage.id}`} className="app-m-node" style={box} aria-label={stageLabel(stage, status)}>
                    {status === 'current' && !compact && <span className="app-m-ring" aria-hidden="true" />}
                    {icon}
                    {status === 'current' && (
                      <span className="app-m-bubble" aria-hidden="true">
                        {t('app.learn.start')}
                      </span>
                    )}
                  </Link>
                )}
                {!compact && (
                  <span
                    className={`app-m-label${node.left ? ' is-left' : ''}`}
                    style={{ left: node.left ? node.x - node.r - 14 - LABEL_W : node.x + node.r + 14, top: node.y - 20, width: LABEL_W }}
                    aria-hidden="true"
                  >
                    <span className="app-m-label-title">{tx(stage.title)}</span>
                    {(status === 'done' || tx(stage.subtitle)) && (
                      <span className="app-m-label-sub">{status === 'done' ? t('app.stage.status.done') : tx(stage.subtitle)}</span>
                    )}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
