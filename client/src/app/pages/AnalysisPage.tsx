// Análisis (/analisis): tablero libre con Stockfish e importación de PGN (AnalysisBoard).
import { lazy, Suspense } from 'react';
import { useT } from '../../i18n';
import { useDocumentTitle } from '../hooks';
import { Loading, PageHeader } from '../ui';

const AnalysisBoard = lazy(() => import('../../lesson').then((m) => ({ default: m.AnalysisBoard })));

export default function AnalysisPage() {
  const t = useT();
  useDocumentTitle(t('app.nav.analysis'));
  return (
    <div className="app-page app-page--wide">
      <PageHeader eyebrow={t('app.analysis.eyebrow')} title={t('app.nav.analysis')}>
        <p className="app-page-lead">{t('app.analysis.lead')}</p>
      </PageHeader>
      <Suspense fallback={<Loading />}>
        <AnalysisBoard />
      </Suspense>
    </div>
  );
}
