// Página de desarrollo del núcleo de ajedrez (solo para probar en local: /dev-lesson.html).
// No forma parte de la app: la app monta los componentes en sus propias rutas.
import { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Chess } from 'chess.js';
import { START_FEN } from '@chessblizzard/shared';
import { ProgressProvider } from '../state/progress';
import { SettingsProvider } from '../state/settings';
import '../styles/tokens.css';
import '../styles/base.css';
import { Board, checkSquare, legalDests, type Orientation } from '../board';
import { EvalBar, analysisScore, formatScore, useAnalysis } from '../engine';

function BoardLab() {
  const [fen, setFen] = useState(START_FEN);
  const [last, setLast] = useState<[string, string] | null>(null);
  const [orientation, setOrientation] = useState<Orientation>('white');
  const dests = useMemo(() => legalDests(fen), [fen]);
  const turn = fen.split(' ')[1] as 'w' | 'b';
  const analysis = useAnalysis(fen, { multipv: 3, depth: 14 });
  return (
    <div style={{ display: 'flex', gap: 16, padding: 16, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', gap: 8, width: 'min(560px, 100%)' }}>
        <EvalBar score={analysisScore(analysis)} orientation={orientation} thinking={analysis.running} />
        <Board
          fen={fen}
          orientation={orientation}
          movable={{ color: turn, dests }}
          lastMove={last}
          check={checkSquare(fen)}
          arrows={[
            { from: 'g1', to: 'f3', kind: 'plan' },
            { from: 'e7', to: 'e5', kind: 'rival' },
            { from: 'b1', to: 'c3', kind: 'hint' },
            { from: 'd2', to: 'd4', kind: 'best' },
          ]}
          marks={['d5', 'e4']}
          onMove={(from, to, promotion) => {
            const chess = new Chess(fen);
            try {
              chess.move({ from, to, promotion: promotion ?? 'q' });
              setFen(chess.fen());
              setLast([from, to]);
            } catch {
              // Ilegal: no hacemos nada.
            }
          }}
        />
      </div>
      <div data-testid="engine" style={{ fontFamily: 'monospace', fontSize: 13, minWidth: 260 }}>
        <button type="button" onClick={() => setOrientation((o) => (o === 'white' ? 'black' : 'white'))}>
          Girar
        </button>{' '}
        <button type="button" onClick={() => setFen(START_FEN)}>
          Reiniciar
        </button>
        <p data-testid="depth">profundidad {analysis.depth} {analysis.running ? '…' : '✓'}</p>
        {analysis.lines.map((l) => (
          <p key={l.multipv} data-testid="pv">
            {formatScore(l, 'es', { digits: 2 })} {l.san.join(' ')}
          </p>
        ))}
        {analysis.error && <p>Error: {analysis.error}</p>}
      </div>
    </div>
  );
}

function DevApp() {
  return <BoardLab />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <ProgressProvider>
        <DevApp />
      </ProgressProvider>
    </SettingsProvider>
  </StrictMode>,
);
