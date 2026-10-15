// Provisional: el equipo de la aplicación sustituye este archivo por las rutas y el layout.
import { ProgressProvider } from '../state/progress';
import { SettingsProvider } from '../state/settings';
import { Ghost } from '../theme/Ghost';

export function App() {
  return (
    <SettingsProvider>
      <ProgressProvider>
        <main style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', gap: 16 }}>
          <Ghost size={96} mood="happy" />
          <h1 style={{ fontFamily: 'var(--font-display)' }}>ChessBlizzard</h1>
        </main>
      </ProgressProvider>
    </SettingsProvider>
  );
}
