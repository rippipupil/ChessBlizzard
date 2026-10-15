// Raíz de la aplicación: proveedores (ajustes, cuenta, progreso sincronizado y avisos), las
// piezas SVG compartidas y las rutas (docs/ARCHITECTURE.md). Las páginas pesadas se cargan
// cuando se visitan; el inicio va en el paquete principal para que aparezca al instante.
import { useEffect, type ComponentType, type ReactNode } from 'react';
import { createBrowserRouter, Outlet, RouterProvider, ScrollRestoration, useNavigation } from 'react-router-dom';
import { PieceSprite } from '../board/pieces';
import { AuthProvider, useAuth } from '../state/auth';
import { ProgressProvider } from '../state/progress';
import { SettingsProvider, useSettings } from '../state/settings';
import { Backdrop } from '../theme/Backdrop';
import { NavLayout } from './Layout';
import LearnPage from './pages/LearnPage';
import { NotFoundPage, RouteErrorPage } from './pages/StatusPages';
import { ToastProvider } from './Toaster';
import { Loading } from './ui';

const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({ Component: (await load()).default });

function Root() {
  const navigation = useNavigation();
  return (
    <>
      <Backdrop />
      <div className="app-root">
        <Outlet />
      </div>
      {navigation.state === 'loading' && <div className="app-route-progress" aria-hidden="true" />}
      <ScrollRestoration />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Root />,
    errorElement: <RouteErrorPage />,
    HydrateFallback: () => <Loading full />,
    children: [
      // Pantalla completa, sin menú.
      { path: 'curso/:courseId/:stageId', lazy: page(() => import('./pages/StagePage')) },
      // Pantalla completa si hay repaso; si no, un estado vacío con menú.
      { path: 'repaso', lazy: page(() => import('./pages/ReviewPage')) },
      {
        element: <NavLayout />,
        children: [
          { index: true, element: <LearnPage /> },
          { path: 'puzzles', lazy: page(() => import('./pages/PuzzlesPage')) },
          { path: 'analisis', lazy: page(() => import('./pages/AnalysisPage')) },
          { path: 'perfil', lazy: page(() => import('./pages/ProfilePage')) },
          { path: 'ajustes', lazy: page(() => import('./pages/SettingsPage')) },
          { path: 'entrar', lazy: async () => ({ Component: (await import('./pages/AuthPage')).LoginPage }) },
          { path: 'registro', lazy: async () => ({ Component: (await import('./pages/AuthPage')).RegisterPage }) },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);

/** Progreso con el adaptador de sincronización de la cuenta (null en modo invitado). */
function SyncedProgress({ children }: { children: ReactNode }) {
  const { sync } = useAuth();
  return <ProgressProvider sync={sync}>{children}</ProgressProvider>;
}

/** Color de la barra del navegador en móvil, el del fondo del tema. */
function ThemeColorMeta() {
  const { settings, mode } = useSettings();
  useEffect(() => {
    // Tras el efecto del proveedor, que es el que cambia data-theme y data-mode.
    const id = requestAnimationFrame(() => {
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
      if (bg) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg);
    });
    return () => cancelAnimationFrame(id);
  }, [settings.theme, mode]);
  return null;
}

export function App() {
  return (
    <SettingsProvider>
      <ThemeColorMeta />
      <AuthProvider>
        <SyncedProgress>
          <ToastProvider>
            <PieceSprite />
            <RouterProvider router={router} />
          </ToastProvider>
        </SyncedProgress>
      </AuthProvider>
    </SettingsProvider>
  );
}
