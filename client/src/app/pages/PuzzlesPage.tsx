// Puzzles de todos los cursos (/puzzles), agrupados por curso con su estado. Al abrir uno
// (?p=id) se resuelve con PuzzleSolver, que registra el intento en el progreso.
import { lazy, Suspense, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { courses, findPuzzle, type Course, type Puzzle } from '@chessblizzard/shared';
import { useT, useTx } from '../../i18n';
import { useProgress } from '../../state/progress';
import { useDocumentTitle, useFormat, usePlural } from '../hooks';
import { Icon } from '../icons';
import { useToast } from '../Toaster';
import { Bar, EmptyState, Loading, PageHeader, RadioGroup } from '../ui';

const PuzzleSolver = lazy(() => import('../../lesson').then((m) => ({ default: m.PuzzleSolver })));

type Filter = 'all' | 'pending' | 'solved';

function PuzzleView({ course, puzzle, onClose }: { course: Course; puzzle: Puzzle; onClose(): void }) {
  const t = useT();
  const tx = useTx();
  const toast = useToast();
  useDocumentTitle(`${tx(puzzle.theme)} · ${t('app.nav.puzzles')}`);
  return (
    <div className="app-page app-puzzle-view">
      <div className="app-puzzle-view-head">
        <button type="button" className="app-back" onClick={onClose}>
          <Icon name="chevronLeft" size={18} strokeWidth={2.4} />
          {t('app.puzzles.back')}
        </button>
        <div className="app-puzzle-view-title">
          <span className="app-eyebrow">{tx(course.name)}</span>
          <h1 className="app-h2">{tx(puzzle.theme)}</h1>
        </div>
        <span className="app-chip">{t('app.puzzles.rating', { n: puzzle.rating })}</span>
      </div>
      <Suspense fallback={<Loading />}>
        <PuzzleSolver
          key={puzzle.id}
          puzzle={puzzle}
          course={course}
          onDone={(solved) => {
            toast(t(solved ? 'app.puzzles.solvedToast' : 'app.puzzles.failedToast'), solved ? 'success' : 'info');
            onClose();
          }}
        />
      </Suspense>
    </div>
  );
}

function PuzzleList({ filter, setFilter }: { filter: Filter; setFilter(f: Filter): void }) {
  const t = useT();
  const tx = useTx();
  const plural = usePlural();
  const f = useFormat();
  const { state } = useProgress();
  useDocumentTitle(t('app.nav.puzzles'));

  const groups = useMemo(
    () =>
      courses
        .map((course) => {
          const all = course.puzzles;
          const solved = all.filter((p) => state.puzzles[p.id]?.solved).length;
          const shown = all.filter((p) => {
            const isSolved = !!state.puzzles[p.id]?.solved;
            return filter === 'all' || (filter === 'solved') === isSolved;
          });
          return { course, all, solved, shown };
        })
        .filter((g) => g.all.length > 0),
    [state, filter],
  );
  const total = groups.reduce((n, g) => n + g.all.length, 0);
  const solved = groups.reduce((n, g) => n + g.solved, 0);

  if (total === 0) {
    return (
      <div className="app-page app-page--center">
        <EmptyState
          mood="thinking"
          title={t('app.puzzles.empty.title')}
          actions={
            <Link to="/" className="app-btn app-btn--primary">
              {t('app.puzzles.empty.cta')}
            </Link>
          }
        >
          <p>{t('app.puzzles.empty.text')}</p>
        </EmptyState>
      </div>
    );
  }

  const anyShown = groups.some((g) => g.shown.length > 0);
  return (
    <div className="app-page">
      <PageHeader eyebrow={t('app.puzzles.eyebrow')} title={t('app.nav.puzzles')}>
        <div className="app-head-progress">
          <div className="app-learn-progress-row">
            <span className="app-tx2">{plural('app.puzzles.solvedOf', total, { solved })}</span>
            <strong>{f.pct(solved / total)}</strong>
          </div>
          <Bar ratio={solved / total} label={t('app.puzzles.progress')} />
        </div>
      </PageHeader>

      <RadioGroup<Filter>
        label={t('app.puzzles.filter')}
        value={filter}
        onChange={setFilter}
        className="app-seg--inline"
        options={[
          { value: 'all', label: t('app.puzzles.filter.all') },
          { value: 'pending', label: t('app.puzzles.filter.pending') },
          { value: 'solved', label: t('app.puzzles.filter.solved') },
        ]}
      />

      {!anyShown && <p className="app-muted-note">{t(filter === 'solved' ? 'app.puzzles.noneSolved' : 'app.puzzles.nonePending')}</p>}

      {groups
        .filter((g) => g.shown.length > 0)
        .map(({ course, all, solved: done, shown }) => (
          <section key={course.id} className="app-puzzle-group" aria-labelledby={`app-pg-${course.id}`}>
            <div className="app-section-head">
              <h2 id={`app-pg-${course.id}`} className="app-h3">
                {tx(course.name)}
              </h2>
              <span className="app-card-meta">{plural('app.puzzles.solvedOf', all.length, { solved: done })}</span>
            </div>
            <ul className="app-puzzle-grid">
              {shown.map((p) => {
                const rec = state.puzzles[p.id];
                const isSolved = !!rec?.solved;
                return (
                  <li key={p.id}>
                    <Link to={`?${new URLSearchParams({ ...(filter === 'all' ? {} : { f: filter }), p: p.id })}`} className={`app-puzzle-card${isSolved ? ' is-solved' : ''}`}>
                      <span className="app-puzzle-icon" aria-hidden="true">
                        <Icon name={isSolved ? 'check' : 'puzzle'} size={20} strokeWidth={isSolved ? 3 : 2} />
                      </span>
                      <span className="app-puzzle-text">
                        <span className="app-puzzle-theme">{tx(p.theme)}</span>
                        <span className="app-puzzle-meta">
                          {t('app.puzzles.rating', { n: p.rating })} · {rec ? plural('app.puzzles.attempts', rec.attempts) : t('app.puzzles.new')}
                        </span>
                      </span>
                      <span className={`app-tag${isSolved ? ' app-tag--done' : ''}`}>{t(isSolved ? 'app.puzzles.solved' : 'app.puzzles.pending')}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
    </div>
  );
}

export default function PuzzlesPage() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('f');
  const filter: Filter = raw === 'pending' || raw === 'solved' ? raw : 'all';
  const id = params.get('p');
  const found = id ? findPuzzle(id) : undefined;

  const keepFilter = (f: Filter): Record<string, string> => (f === 'all' ? {} : { f });
  if (found) {
    return <PuzzleView course={found.course} puzzle={found.puzzle} onClose={() => setParams(keepFilter(filter))} />;
  }
  return <PuzzleList filter={filter} setFilter={(f) => setParams(keepFilter(f), { replace: true })} />;
}
