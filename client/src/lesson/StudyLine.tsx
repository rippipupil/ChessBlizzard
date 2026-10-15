// Estudio de una línea: se avanza y retrocede jugada a jugada (botones o flechas del
// teclado). Cuando le toca al alumno, el panel explica su jugada antes de hacerla y puede
// jugarla él mismo en el tablero. La parte inicial que ya conoce se reproduce rápido.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Course, LineDef, Ply } from '@chessblizzard/shared';
import { checkSquare, legalDests, type BoardArrow } from '../board';
import { useNotation, useT, useTx } from '../i18n';
import { useProgress } from '../state/progress';
import { useSettings } from '../state/settings';
import { BoardArea } from './BoardArea';
import { moveSound, useKeyNav, useSound } from './hooks';
import { alternativesAt, arrowText, fenAt, firstBook, lastMoveAt, linePlies, moveArrow, moveLabel, noteArrows } from './lessonData';
import { Comment, Section } from './Shell';
import { Button, Icon, IdeaChip, MOVE_SLOT, MoveList, RichText, WithMove } from './ui';

/** Pausa entre jugadas al reproducir el tronco común: el total ronda los 2,6 s. */
export function replayStep(plies: number): number {
  return Math.max(70, Math.min(190, Math.round(2600 / Math.max(1, plies))));
}

export interface StudyLineProps {
  course: Course;
  line: LineDef;
  /** Primera jugada nueva para el alumno: lo anterior se reproduce rápido al empezar. */
  newFrom: number;
  /** Cabecera del panel (título, pestañas, selector de líneas). */
  header: ReactNode;
  /** Se llama la primera vez que se llega al final. */
  onFinished?: () => void;
  onProgress?: (cursor: number, total: number) => void;
  /** Acciones del final de la línea (siguiente línea, empezar práctica...). */
  endActions?: ReactNode;
  /** Presentación de la etapa (texto del contenido, con jugadas entre corchetes). */
  intro?: string;
}

export function StudyLine({ course, line, newFrom, header, onFinished, onProgress, endActions, intro }: StudyLineProps) {
  const t = useT();
  const tx = useTx();
  const notation = useNotation();
  const { settings } = useSettings();
  const { state } = useProgress();
  const sound = useSound();
  const plies = linePlies(line);
  const n = plies.length;
  const user = course.side;
  const startCursor = newFrom > 0 ? Math.min(n, newFrom + 1) : 0;

  const [cursor, setCursor] = useState(0);
  const [replay, setReplay] = useState(startCursor > 0);
  const [flipped, setFlipped] = useState(false);
  const [tryMsg, setTryMsg] = useState<string | null>(null);
  const finished = useRef(false);

  // Tramo común: se reproduce solo y deprisa hasta la primera jugada nueva.
  useEffect(() => {
    if (!replay) return;
    if (cursor >= startCursor) {
      setReplay(false);
      return;
    }
    const id = setTimeout(() => setCursor((c) => c + 1), cursor === 0 ? 450 : replayStep(startCursor));
    return () => clearTimeout(id);
  }, [replay, cursor, startCursor]);

  const progressRef = useRef(onProgress);
  progressRef.current = onProgress;
  useEffect(() => {
    progressRef.current?.(cursor, n);
  }, [cursor, n]);

  const finishRef = useRef(onFinished);
  finishRef.current = onFinished;
  useEffect(() => {
    if (cursor === n && !replay && !finished.current) {
      finished.current = true;
      finishRef.current?.();
    }
  }, [cursor, n, replay]);

  const go = (c: number) => {
    const target = Math.max(0, Math.min(n, c));
    setReplay(false);
    setTryMsg(null);
    if (target === cursor + 1 && plies[cursor]) sound(moveSound(plies[cursor].san));
    setCursor(target);
  };

  useKeyNav({
    prev: () => go(cursor - 1),
    next: () => go(cursor + 1),
    first: () => go(0),
    last: () => go(n),
  });

  const fen = fenAt(plies, cursor);
  const nextPly: Ply | undefined = plies[cursor];
  const lastPly: Ply | undefined = plies[cursor - 1];
  const preview = !replay && !!nextPly && nextPly.color === user;
  const focus = preview ? nextPly : lastPly;

  // Flechas: en la vista previa, la jugada que toca hacer y el plan rival de la jugada
  // anterior; después de una jugada, las flechas de su comentario.
  const arrows: BoardArrow[] = [];
  let marks: string[] = [];
  if (!replay) {
    const notes = preview ? noteArrows(lastPly?.note, { plan: false }) : noteArrows(lastPly?.note);
    if (settings.planArrows) arrows.push(...notes);
    if (preview && nextPly) arrows.unshift(moveArrow(nextPly.from, nextPly.to, 'plan'));
    marks = lastPly?.note?.marks ?? [];
  }

  const opponentPly = preview ? lastPly : lastPly && lastPly.color !== user ? lastPly : undefined;
  const alternatives = useMemo(
    () => (opponentPly && !replay ? alternativesAt(course, opponentPly, line.id, state, notation) : []),
    [course, opponentPly, line.id, state, notation, replay],
  );

  const sideName = (c: 'w' | 'b') => t(c === 'w' ? 'lesson.white' : 'lesson.black');
  const rival = user === 'w' ? 'b' : 'w';
  /** "Las blancas" (al empezar una frase) y "las blancas" (en medio). */
  const rivalThe = t(rival === 'w' ? 'lesson.theWhite' : 'lesson.theBlack');
  const rivalLower = t(rival === 'w' ? 'lesson.whiteLower' : 'lesson.blackLower');
  const book = firstBook(course);

  const onMove = (from: string, to: string, promotion?: string) => {
    if (!nextPly) return;
    if (nextPly.from === from && nextPly.to === to && (!nextPly.promotion || nextPly.promotion === promotion)) {
      go(cursor + 1);
    } else {
      setTryMsg(t('lesson.study.tryOther', { move: moveLabel(nextPly, notation) }));
      sound('wrong');
    }
  };

  // Ideas clave: las flechas que se ven en el tablero, explicadas en palabras.
  const chips =
    arrows.length > 0 ? (
      <div className="cb-chips">
        {arrows.map((a, i) => (
          <IdeaChip key={i} kind={a.kind}>
            {t(a.kind === 'plan' ? 'lesson.chip.plan' : 'lesson.chip.rival')} · {arrowText(a, fen, notation)}
          </IdeaChip>
        ))}
      </div>
    ) : null;

  let comment: ReactNode;
  if (replay) {
    comment = (
      <Comment mood="thinking" title={t('lesson.study.replayTitle')}>
        <p className="cb-text">{t('lesson.study.replayText')}</p>
        <div>
          <Button variant="ghost" icon="last" onClick={() => go(startCursor)}>
            {t('lesson.study.skip')}
          </Button>
        </div>
      </Comment>
    );
  } else if (!focus) {
    comment = (
      <Comment mood="happy" title={tx(line.name)}>
        {intro && (
          <p className="cb-text">
            <RichText text={intro} />
          </p>
        )}
        <p className="cb-text">{t('lesson.study.intro')}</p>
        <p className="cb-text cb-text-2">{t('lesson.study.introKeys')}</p>
      </Comment>
    );
  } else if (preview && nextPly) {
    comment = (
      <Comment mood="thinking" title={t('lesson.study.yourMove', { move: moveLabel(nextPly, notation) })}>
        {lastPly && (
          <div className="cb-context">
            <span className="cb-context-label">
              {t('lesson.study.theyPlayed', { side: rivalThe, move: moveLabel(lastPly, notation) })}
            </span>
            {lastPly.note?.text && (
              <p className="cb-text cb-text-2">
                <RichText text={tx(lastPly.note.text)} />
              </p>
            )}
          </div>
        )}
        <p className="cb-text">{nextPly.note?.text ? <RichText text={tx(nextPly.note.text)} /> : t('lesson.study.noNoteUser')}</p>
        {chips}
        {tryMsg && (
          <p className="cb-try" role="alert">
            {tryMsg}
          </p>
        )}
      </Comment>
    );
  } else if (lastPly) {
    const mine = lastPly.color === user;
    comment = (
      <Comment mood={mine ? (line.practice === false ? 'thinking' : 'happy') : 'neutral'} title={`${moveLabel(lastPly, notation)} · ${t(mine ? 'lesson.study.byYou' : 'lesson.study.byRival', { side: rivalLower })}`}>
        <p className="cb-text">
          {lastPly.note?.text ? (
            <RichText text={tx(lastPly.note.text)} />
          ) : (
            t(mine ? 'lesson.study.noNoteUser' : 'lesson.study.noNoteRival', { side: rivalThe, move: moveLabel(lastPly, notation) })
          )}
        </p>
        {chips}
      </Comment>
    );
  }

  let cta: ReactNode = null;
  if (!replay) {
    if (cursor >= n) cta = endActions;
    else if (preview && nextPly)
      cta = (
        <Button variant="primary" block onClick={() => go(cursor + 1)}>
          <WithMove text={t('lesson.study.playIt', { move: MOVE_SLOT })} move={moveLabel(nextPly, notation)} />
        </Button>
      );
    else
      cta = (
        <Button variant="primary" block onClick={() => go(cursor + 1)}>
          {cursor === 0 ? t('lesson.study.start') : t('lesson.study.next')}
        </Button>
      );
  }

  const orientation = (user === 'w') !== flipped ? 'white' : 'black';
  const lastMove = lastMoveAt(plies, cursor);

  return (
    <>
      <BoardArea
        board={{
          fen,
          orientation,
          lastMove,
          check: checkSquare(fen),
          arrows,
          marks,
          movable: preview ? { color: user, dests: legalDests(fen) } : null,
          onMove,
          ariaLabel: t('lesson.board.studyLabel', { line: tx(line.name) }),
        }}
        players={{
          w: { name: user === 'w' ? t('lesson.you', { side: sideName('w') }) : sideName('w'), note: user === 'w' ? undefined : t('lesson.bookMoves') },
          b: { name: user === 'b' ? t('lesson.you', { side: sideName('b') }) : sideName('b'), note: user === 'b' ? undefined : t('lesson.bookMoves') },
        }}
        nav={{
          onFirst: () => go(0),
          onPrev: () => go(cursor - 1),
          onNext: () => go(cursor + 1),
          onLast: () => go(n),
          canPrev: cursor > 0,
          canNext: cursor < n,
        }}
        onFlip={() => setFlipped((f) => !f)}
      />
      <aside className="cb-panel" aria-label={t('lesson.panel.study')}>
        {header}
        {comment}
        {cursor > 0 && (
          <Section label={t('lesson.moves')}>
            <MoveList moves={plies.slice(0, cursor)} current={cursor - 1} userColor={user} onSelect={(i) => go(i + 1)} />
          </Section>
        )}
        {alternatives.length > 1 && opponentPly && (
          <Section label={t('lesson.alts.title', { side: rivalLower, move: moveLabel(opponentPly, notation) })}>
            <ul className="cb-alts">
              {alternatives.map((a) => (
                <li key={a.san} className={`cb-alt${a.status === 'here' ? ' cb-alt-here' : ''}`}>
                  <span className="cb-alt-move">{a.label}</span>
                  <span className="cb-alt-name">{a.status === 'here' ? tx(line.name) : tx(a.lineName)}</span>
                  <span className={`cb-alt-status cb-alt-${a.status}`}>
                    {a.status === 'here' ? (
                      t('lesson.alts.here')
                    ) : a.status === 'done' ? (
                      <>
                        <Icon name="check" size={14} stroke={2.6} />
                        {tx(a.campName)}
                      </>
                    ) : a.status === 'locked' ? (
                      <>
                        <Icon name="lock" size={14} stroke={2} />
                        {tx(a.campName)}
                      </>
                    ) : (
                      tx(a.campName)
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        )}
        {cursor >= n && !replay && (
          <Section label={t('lesson.study.summary')} className="cb-summary">
            {line.summary && (
              <p className="cb-text">
                <RichText text={tx(line.summary)} />
              </p>
            )}
            {line.practice === false && <p className="cb-text cb-text-warn">{t('lesson.study.warningLine')}</p>}
            {book && (
              <p className="cb-ref">
                {t('lesson.study.reference', { author: book.author ?? '', title: book.title })}
              </p>
            )}
          </Section>
        )}
        {cta && <div className="cb-panel-foot">{cta}</div>}
      </aside>
    </>
  );
}
