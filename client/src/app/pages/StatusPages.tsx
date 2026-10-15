// Página no encontrada y error al cargar una ruta (por ejemplo, un trozo de la app que no
// se puede descargar tras una actualización).
import { Link, useRouteError } from 'react-router-dom';
import { useT } from '../../i18n';
import { Backdrop } from '../../theme/Backdrop';
import { useDocumentTitle } from '../hooks';
import { EmptyState } from '../ui';

export function NotFoundPage() {
  const t = useT();
  useDocumentTitle(t('app.notFound.title'));
  return (
    <div className="app-page app-page--center">
      <EmptyState
        mood="sad"
        title={t('app.notFound.title')}
        actions={
          <Link to="/" className="app-btn app-btn--primary">
            {t('app.notFound.cta')}
          </Link>
        }
      >
        <p>{t('app.notFound.text')}</p>
      </EmptyState>
    </div>
  );
}

export function RouteErrorPage() {
  const t = useT();
  const error = useRouteError();
  if (import.meta.env.DEV) console.error(error);
  return (
    <>
      <Backdrop />
      <div className="app-root">
        <main className="app-page app-page--center app-page--solo">
          <EmptyState
            mood="sad"
            title={t('app.error.title')}
            actions={
              <>
                <button type="button" className="app-btn app-btn--primary" onClick={() => window.location.reload()}>
                  {t('app.error.reload')}
                </button>
                <a href="/" className="app-btn app-btn--outline">
                  {t('app.error.home')}
                </a>
              </>
            }
          >
            <p>{t('app.error.text')}</p>
          </EmptyState>
        </main>
      </div>
    </>
  );
}
