// Tablero de análisis: tablero libre con importación de PGN o FEN, lista de jugadas
// navegable, barra de evaluación y las 3 mejores líneas de Stockfish en directo. Incluye
// una revisión de partida que clasifica cada jugada por la pérdida de evaluación.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { START_FEN, localizeSan } from '@chessblizzard/shared';
import { checkSquare, gameEnd, legalDests, makeChess, playOne, sideToMove, tryMove, type BoardArrow, type PlayedMove } from '../board';
import {
  EvalBar,
  analysisScore,
  classifyLoss,
  formatScore,
  getEngine,
  moveAccuracy,
  povScore,
  useAnalysis,
  winPercent,
  type MoveClass,
  type Score,
} from '../engine';
import { useLocale, useNotation, useT } from '../i18n';
import { BoardArea } from './BoardArea';
import { moveSound, useKeyNav, useSound } from './hooks';
import { moveArrow, moveLabel } from './lessonData';
import { Section } from './Shell';
import { Button, Icon, MoveList } from './ui';

const CLASSES: MoveClass[] = ['best', 'good', 'inaccuracy', 'mistake', 'blunder'];

interface Review {
  running: boolean;
  done: number;
  total: number;
  /** Evaluación (desde las blancas) de cada posición: la inicial y tras cada jugada. */
  evals: Array<Score | null>;
  /** Mejor jugada (UCI) en cada posición. */
  best: Array<string | null>;
}

function fenIsh(text: string) {
  const parts = text.trim().split(/\s+/);
  return parts.length >= 2 && parts[0].split('/').length === 8;
}

export function AnalysisBoard() {
  const t = useT();
  const locale = useLocale();
  const notation = useNotation();
  const sound = useSound();
  const [baseFen, setBaseFen] = useState(START_FEN);
  const [moves, setMoves] = useState<PlayedMove[]>([]);
  const [cursor, setCursor] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [engineOn, setEngineOn] = useState(true);
  const [text, setText] = useState('');
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [headers, setHeaders] = useState<Record<string, string>>({});
  const [review, setReview] = useState<Review | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const reviewRun = useRef(0);

  const fen = cursor > 0 ? moves[cursor - 1].fenAfter : baseFen;
  const reviewing = !!review?.running;
  const analysis = useAnalysis(engineOn && !reviewing ? fen : null, { multipv: 3, depth: 20 });
  const turn = sideToMove(fen);

  const go = (c: number) => {
    const target = Math.max(0, Math.min(moves.length, c));
    if (target === cursor + 1 && moves[cursor]) sound(moveSound(moves[cursor].san));
    setCursor(target);
  };
  useKeyNav({ prev: () => go(cursor - 1), next: () => go(cursor + 1), first: () => go(0), last: () => go(moves.length) });

  const playMove = (m: PlayedMove) => {
    sound(moveSound(m.san));
    if (moves[cursor]?.uci === m.uci) {
      setCursor(cursor + 1);
      return;
    }
    const next = [...moves.slice(0, cursor), m];
    setMoves(next);
    setCursor(next.length);
    // La revisión de las jugadas siguientes ya no vale.
    if (review) {
      reviewRun.current++;
      setReview(null);
    }
  };

  const onMove = (from: string, to: string, promotion?: string) => {
    const m = tryMove(fen, from, to, promotion);
    if (m) playMove(m);
  };

  const load = () => {
    const input = text.trim();
    if (!input) return;
    reviewRun.current++;
    setReview(null);
    if (fenIsh(input)) {
      const chess = makeChess(input);
      if (!chess) {
        setImportMsg({ ok: false, text: t('lesson.analysis.badFen') });
        return;
      }
      setBaseFen(chess.fen());
      setMoves([]);
      setCursor(0);
      setHeaders({});
      setImportMsg({ ok: true, text: t('lesson.analysis.loadedFen') });
      return;
    }
    try {
      const chess = new Chess();
      chess.loadPgn(input);
      const history = chess.history({ verbose: true });
      const start = history[0]?.before ?? chess.fen();
      const replay = new Chess(start);
      const list: PlayedMove[] = [];
      for (const h of history) {
        const moveNumber = replay.moveNumber();
        const m = replay.move({ from: h.from, to: h.to, promotion: h.promotion });
        list.push({
          san: m.san,
          from: m.from,
          to: m.to,
          promotion: m.promotion,
          captured: m.captured,
          fenBefore: m.before,
          fenAfter: m.after,
          color: m.color,
          moveNumber,
          uci: m.from + m.to + (m.promotion ?? ''),
        });
      }
      const hdr = chess.getHeaders();
      setBaseFen(start);
      setMoves(list);
      setCursor(0);
      setHeaders(Object.fromEntries(Object.entries(hdr).filter(([, v]) => typeof v === 'string' && v && v !== '?')) as Record<string, string>);
      setImportMsg({ ok: true, text: t('lesson.analysis.loadedPgn', { n: list.length }) });
    } catch {
      setImportMsg({ ok: false, text: t('lesson.analysis.badPgn') });
    }
  };

  const reset = () => {
    reviewRun.current++;
    setReview(null);
    setBaseFen(START_FEN);
    setMoves([]);
    setCursor(0);
    setHeaders({});
    setImportMsg(null);
  };

  const pgn = useMemo(() => {
    const chess = new Chess(baseFen);
    for (const m of moves) {
      try {
        chess.move(m.san);
      } catch {
        break;
      }
    }
    for (const [k, v] of Object.entries(headers)) chess.setHeader(k, v);
    return chess.pgn();
  }, [baseFen, moves, headers]);

  const copy = async (what: 'pgn' | 'fen') => {
    try {
      await navigator.clipboard.writeText(what === 'pgn' ? pgn : fen);
      setCopied(what);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  };

  // --- Revisión de partida ---
  const startReview = async () => {
    if (!moves.length) return;
    const run = ++reviewRun.current;
    const positions = [baseFen, ...moves.map((m) => m.fenAfter)];
    const evals: Array<Score | null> = positions.map(() => null);
    const best: Array<string | null> = positions.map(() => null);
    setReview({ running: true, done: 0, total: positions.length, evals: [...evals], best: [...best] });
    const engine = getEngine();
    for (let i = 0; i < positions.length; i++) {
      if (reviewRun.current !== run) return;
      const chess = makeChess(positions[i]);
      const end = chess ? gameEnd(chess) : null;
      if (end) {
        evals[i] = end === 'checkmate' ? { winner: chess!.turn() === 'w' ? 'b' : 'w' } : { winner: 'draw' };
      } else {
        try {
          const res = await engine.analyze(positions[i], { depth: 12, channel: 'review' }).promise;
          const top = res.lines[0];
          evals[i] = top ? { cp: top.cp, mate: top.mate } : null;
          best[i] = res.best;
        } catch {
          evals[i] = null;
        }
      }
      if (reviewRun.current !== run) return;
      setReview({ running: i < positions.length - 1, done: i + 1, total: positions.length, evals: [...evals], best: [...best] });
    }
  };

  useEffect(
    () => () => {
      reviewRun.current++;
    },
    [],
  );

  const classified = useMemo(() => {
    const marks: Partial<Record<number, MoveClass>> = {};
    const acc = { w: [] as number[], b: [] as number[] };
    const counts = { w: Object.fromEntries(CLASSES.map((c) => [c, 0])) as Record<MoveClass, number>, b: Object.fromEntries(CLASSES.map((c) => [c, 0])) as Record<MoveClass, number> };
    if (!review) return { marks, acc: null, counts };
    moves.forEach((m, i) => {
      const before = review.evals[i];
      const after = review.evals[i + 1];
      if (!before || !after) return;
      const wb = winPercent(povScore(before, m.color));
      const wa = winPercent(povScore(after, m.color));
      const loss = Math.max(0, wb - wa);
      const cls = classifyLoss(loss, review.best[i] === m.uci);
      marks[i] = cls;
      counts[m.color][cls]++;
      acc[m.color].push(moveAccuracy(loss));
    });
    const avg = (l: number[]) => (l.length ? Math.round(l.reduce((a, b) => a + b, 0) / l.length) : null);
    return { marks, acc: { w: avg(acc.w), b: avg(acc.b) }, counts };
  }, [review, moves]);

  // Jugada seleccionada en la revisión: si fue un error, flecha con la mejor.
  const arrows: BoardArrow[] = [];
  const selected = cursor - 1;
  const selClass = selected >= 0 ? classified.marks[selected] : undefined;
  let betterSan: string | null = null;
  if (review && selected >= 0 && selClass && selClass !== 'best' && selClass !== 'good') {
    const bestUci = review.best[selected];
    if (bestUci) {
      const m = playOne(moves[selected].fenBefore, bestUci);
      if (m) {
        betterSan = moveLabel(m, notation);
        arrows.push(moveArrow(m.from, m.to, 'best'));
      }
    }
  } else if (engineOn && !reviewing && analysis.lines[0]?.pv[0] && analysis.fen === fen) {
    const uci = analysis.lines[0].pv[0];
    arrows.push(moveArrow(uci.slice(0, 2), uci.slice(2, 4), 'hint'));
  }

  const orientation = flipped ? 'black' : 'white';
  const score = analysisScore(analysis);
  const lastMove = cursor > 0 ? ([moves[cursor - 1].from, moves[cursor - 1].to] as [string, string]) : null;
  const white = headers.White ?? t('lesson.white');
  const black = headers.Black ?? t('lesson.black');

  return (
    <div className="cb-embed cb-analysis">
      <BoardArea
        board={{
          fen,
          orientation,
          movable: { color: turn, dests: legalDests(fen) },
          onMove,
          lastMove,
          check: checkSquare(fen),
          arrows,
          ariaLabel: t('lesson.board.analysisLabel'),
        }}
        players={{ w: { name: white, note: headers.WhiteElo }, b: { name: black, note: headers.BlackElo } }}
        evalBar={engineOn ? <EvalBar score={score} orientation={orientation} thinking={analysis.running} /> : undefined}
        nav={{
          onFirst: () => go(0),
          onPrev: () => go(cursor - 1),
          onNext: () => go(cursor + 1),
          onLast: () => go(moves.length),
          canPrev: cursor > 0,
          canNext: cursor < moves.length,
        }}
        onFlip={() => setFlipped((f) => !f)}
      />
      <aside className="cb-panel" aria-label={t('lesson.panel.analysis')}>
        <div className="cb-section cb-engine">
          <div className="cb-engine-head">
            <label className="cb-switch">
              <input type="checkbox" checked={engineOn} onChange={(e) => setEngineOn(e.target.checked)} />
              <span className="cb-switch-track" aria-hidden="true" />
              <span className="cb-engine-name">
                <Icon name="cpu" size={16} /> Stockfish 19
              </span>
            </label>
            {engineOn && (
              <span className="cb-engine-meta" aria-live="polite">
                {reviewing
                  ? t('lesson.analysis.paused')
                  : analysis.end
                    ? t(`lesson.analysis.end.${analysis.end}`)
                    : t('lesson.analysis.depth', { n: analysis.depth || '…' })}
                {score && !analysis.end && <b className="cb-engine-score">{formatScore(score, locale, { digits: 2 })}</b>}
              </span>
            )}
          </div>
          {engineOn && !reviewing && (
            <ol className="cb-pvs">
              {analysis.lines.map((l) => (
                <li key={l.multipv}>
                  <button
                    type="button"
                    className="cb-pv"
                    onClick={() => {
                      const m = l.pv[0] ? playOne(fen, l.pv[0]) : null;
                      if (m) playMove(m);
                    }}
                    title={t('lesson.analysis.playLine')}
                  >
                    <span className={`cb-pv-score ${(l.mate ?? l.cp ?? 0) >= 0 ? 'cb-pv-w' : 'cb-pv-b'}`}>{formatScore(l, locale, { digits: 2 })}</span>
                    <span className="cb-pv-moves">{pvText(fen, l.san, notation)}</span>
                  </button>
                </li>
              ))}
              {analysis.lines.length === 0 && !analysis.end && (
                <li className="cb-pv-wait">{analysis.error ? t('lesson.engine.unavailable') : t('lesson.analysis.thinking')}</li>
              )}
            </ol>
          )}
        </div>

        <Section label={t('lesson.moves')}>
          {moves.length ? (
            <MoveList moves={moves} current={cursor - 1} onSelect={(i) => go(i + 1)} marks={classified.marks} scroll />
          ) : (
            <p className="cb-text cb-text-2">{t('lesson.analysis.noMoves')}</p>
          )}
          {betterSan && selClass && (
            <p className={`cb-better cb-better-${selClass}`}>
              {t(`lesson.class.${selClass}`)} · {t('lesson.analysis.better', { move: betterSan })}
            </p>
          )}
        </Section>

        <Section label={t('lesson.analysis.review')}>
          {!review && (
            <>
              <p className="cb-text cb-text-2">{t('lesson.analysis.reviewHelp')}</p>
              <Button icon="chart" onClick={startReview} disabled={moves.length === 0}>
                {t('lesson.analysis.reviewStart')}
              </Button>
            </>
          )}
          {review && review.running && (
            <div className="cb-review-run">
              <div className="cb-progress" role="progressbar" aria-valuemin={0} aria-valuemax={review.total} aria-valuenow={review.done}>
                <div className="cb-progress-fill" style={{ width: `${(review.done / review.total) * 100}%` }} />
              </div>
              <span className="cb-text cb-text-2">{t('lesson.analysis.reviewing', { k: review.done, n: review.total })}</span>
              <Button
                variant="ghost"
                onClick={() => {
                  reviewRun.current++;
                  setReview(null);
                }}
              >
                {t('lesson.cancel')}
              </Button>
            </div>
          )}
          {review && !review.running && classified.acc && (
            <div className="cb-review-sum">
              {(['w', 'b'] as const).map((c) => (
                <div key={c} className="cb-review-side">
                  <div className="cb-review-side-head">
                    <span className={`cb-swatch cb-swatch-${c}`} aria-hidden="true" />
                    <span className="cb-review-side-name">{c === 'w' ? white : black}</span>
                    <span className="cb-review-acc">
                      {classified.acc![c] ?? '–'}
                      <small>%</small>
                    </span>
                  </div>
                  <ul className="cb-review-counts">
                    {CLASSES.map((cls) => (
                      <li key={cls} className={`cb-count cb-count-${cls}`}>
                        <span>{t(`lesson.class.${cls}`)}</span>
                        <b>{classified.counts[c][cls]}</b>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className="cb-text cb-text-2">{t('lesson.analysis.accuracyHelp')}</p>
            </div>
          )}
        </Section>

        <Section label={t('lesson.analysis.import')}>
          <textarea
            className="cb-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('lesson.analysis.importPlaceholder')}
            rows={4}
            spellCheck={false}
            aria-label={t('lesson.analysis.import')}
          />
          {importMsg && <p className={`cb-text ${importMsg.ok ? 'cb-text-ok' : 'cb-text-err'}`}>{importMsg.text}</p>}
          <div className="cb-row-btns">
            <Button variant="primary" icon="upload" onClick={load} disabled={!text.trim()}>
              {t('lesson.analysis.load')}
            </Button>
            <Button icon="retry" onClick={reset}>
              {t('lesson.analysis.reset')}
            </Button>
            <Button icon="copy" onClick={() => void copy('pgn')}>
              {copied === 'pgn' ? t('lesson.analysis.copied') : t('lesson.analysis.copyPgn')}
            </Button>
            <Button icon="copy" onClick={() => void copy('fen')}>
              {copied === 'fen' ? t('lesson.analysis.copied') : t('lesson.analysis.copyFen')}
            </Button>
          </div>
        </Section>
      </aside>
    </div>
  );
}

/** "12.Cf3 Cc6 13.d4" a partir de una variante en SAN desde una posición. */
function pvText(fen: string, san: string[], notation: 'es' | 'en'): string {
  const parts = fen.split(' ');
  let color: 'w' | 'b' = parts[1] === 'b' ? 'b' : 'w';
  let num = Number(parts[5]) || 1;
  const out: string[] = [];
  san.forEach((s, i) => {
    const m = localizeSan(s, notation);
    if (color === 'w') out.push(`${num}.${m}`);
    else out.push(i === 0 ? `${num}...${m}` : m);
    if (color === 'b') num++;
    color = color === 'w' ? 'b' : 'w';
  });
  return out.join(' ');
}
