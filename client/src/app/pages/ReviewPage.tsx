// Repaso de hoy (/repaso): si hay líneas pendientes, la sesión de repaso a pantalla completa;
// si no, un estado vacío dentro del marco con menú.
import { lazy, Suspense, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addDays, courses, dueLines, isDue } from '@chessblizzard/shared';
import { useT } from '../../i18n';
import { useProgress } from '../../state/progress';
import { useDocumentTitle, useFormat, usePlural } from '../hooks';
import { AppFrame } from '../Layout';
import { EmptyState, Loading } from '../ui';

const ReviewSession = lazy(() => import('../../lesson').then((m) => ({ default: m.ReviewSession })));

/** Próximo día con repasos y cuántas líneas tocan ese día. */
function useNextReview() {
  const { state, today } = useProgress();
  return useMemo(() => {
    const practiced = new Set(courses.flatMap((c) => c.lines.filter((l) => l.practice !== false).map((l) => l.id)));
    let day: string | null = null;
    let count = 0;
    for (const [id, card] of Object.entries(state.lines)) {
      if (!practiced.has(id) || isDue(card, today)) continue;
      if (!day || card.due < day) {
        day = card.due;
        count = 1;
      } else if (card.due === day) {
        count++;
      }
    }
    return { day, count, learned: Object.keys(state.lines).filter((id) => practiced.has(id)).length };
  }, [state, today]);
}

function EmptyReview() {
  const t = useT();
  const plural = usePlural();
  const f = useFormat();
  const { today } = useProgress();
  const next = useNextReview();
  const isTomorrow = next.day === addDays(today, 1);
  return (
    <div className="app-page app-page--center">
      <EmptyState
        mood={next.learned === 0 ? 'thinking' : 'happy'}
        title={t(next.learned === 0 ? 'app.review.empty.newTitle' : 'app.review.empty.title')}
        actions={
          <>
            <Link to="/" className="app-btn app-btn--primary">
              {t('app.review.empty.learn')}
            </Link>
            <Link to="/puzzles" className="app-btn app-btn--outline">
              {t('app.review.empty.puzzles')}
            </Link>
          </>
        }
      >
        <p>{t(next.learned === 0 ? 'app.review.empty.newText' : 'app.review.empty.text')}</p>
        {next.day && (
          <p className="app-empty-meta">
            {isTomorrow
              ? plural('app.review.empty.tomorrow', next.count)
              : plural('app.review.empty.next', next.count, { date: f.date(next.day) })}
          </p>
        )}
      </EmptyState>
    </div>
  );
}

export default function ReviewPage() {
  const t = useT();
  const navigate = useNavigate();
  const { state, today } = useProgress();
  useDocumentTitle(t('app.review.today'));
  // Se decide al entrar: al terminar el último repaso no hay que cortar la sesión a medias.
  const [running] = useState(() => dueLines(courses, state, today).length > 0);

  if (running) {
    return (
      <div className="app-fullscreen">
        <Suspense fallback={<Loading full />}>
          <ReviewSession onExit={() => navigate('/')} />
        </Suspense>
      </div>
    );
  }
  return (
    <AppFrame>
      <EmptyReview />
    </AppFrame>
  );
}
