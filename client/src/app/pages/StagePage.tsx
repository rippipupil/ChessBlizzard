// Ruta de etapa (/curso/:courseId/:stageId), a pantalla completa. Si la etapa no existe o
// aún está bloqueada, vuelve al inicio con un aviso.
import { lazy, Suspense, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { findStage, flattenStages, isStageUnlocked, stageStatuses } from '@chessblizzard/shared';
import { useT, useTx } from '../../i18n';
import { useProgress } from '../../state/progress';
import { rememberCourse, useDocumentTitle } from '../hooks';
import { RedirectHome } from '../RedirectHome';
import { Loading } from '../ui';

const StagePlayer = lazy(() => import('../../lesson').then((m) => ({ default: m.StagePlayer })));

export default function StagePage() {
  const t = useT();
  const tx = useTx();
  const navigate = useNavigate();
  const { courseId = '', stageId = '' } = useParams();
  const { state } = useProgress();
  const found = findStage(courseId, stageId);
  // Se decide al entrar en cada etapa: al completarla no hay que expulsar al alumno de la pantalla.
  const key = `${courseId}/${stageId}`;
  const check = () => ({ key, unlocked: found ? isStageUnlocked(found.course, stageId, state) : false });
  const [gate, setGate] = useState(check);
  if (gate.key !== key) setGate(check());
  const unlocked = gate.key === key ? gate.unlocked : check().unlocked;
  useDocumentTitle(found ? `${tx(found.stage.title)} · ${tx(found.course.name)}` : '');

  const foundCourse = found?.course.id;
  useEffect(() => {
    if (foundCourse) rememberCourse(foundCourse);
  }, [foundCourse]);

  if (!found) return <RedirectHome message={t('app.stage.missing')} />;
  if (!unlocked) {
    const flat = flattenStages(found.course);
    const next = flat[stageStatuses(found.course, state).indexOf('current')]?.stage;
    return (
      <RedirectHome
        message={
          next
            ? t('app.learn.locked', { stage: tx(found.stage.title), next: tx(next.title) })
            : t('app.learn.lockedShort', { stage: tx(found.stage.title) })
        }
        tone="warn"
      />
    );
  }

  return (
    <div className="app-fullscreen">
      <Suspense fallback={<Loading full />}>
        <StagePlayer key={`${found.course.id}/${found.stage.id}`} course={found.course} stage={found.stage} onExit={() => navigate('/')} />
      </Suspense>
    </div>
  );
}
