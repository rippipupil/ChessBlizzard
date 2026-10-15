// Ajustes (/ajustes), como en Temas.dc.html: pestañas Apariencia, Tablero, Idioma y Cuenta.
// Los cambios se aplican al momento y, con sesión, se guardan en la cuenta.
import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Settings } from '@chessblizzard/shared';
import { Piece, type PieceColor, type PieceType } from '../../board/pieces';
import { useT } from '../../i18n';
import { useSettings } from '../../state/settings';
import { Ghost } from '../../theme/Ghost';
import { AccountSection } from '../AccountSection';
import { useDocumentTitle } from '../hooks';
import { Icon } from '../icons';
import { RadioGroup, Switch } from '../ui';

const TABS = ['apariencia', 'tablero', 'idioma', 'cuenta'] as const;
type Tab = (typeof TABS)[number];
const TAB_KEYS: Record<Tab, string> = { apariencia: 'appearance', tablero: 'board', idioma: 'language', cuenta: 'account' };

const THEMES = ['blizzard', 'neon'] as const;
const PIECE_ORDER: PieceType[] = ['k', 'q', 'r', 'b', 'n', 'p'];

/** Miniatura de un tema: se pinta con sus propias variables gracias a data-theme/data-mode. */
function ThemeThumb({ theme, mode }: { theme: 'blizzard' | 'neon'; mode: 'dark' | 'light' }) {
  return (
    <div className="app-thumb" data-theme={theme} data-mode={mode} aria-hidden="true">
      {theme === 'blizzard' ? (
        <svg className="app-thumb-art" viewBox="0 0 200 120" preserveAspectRatio="none" focusable="false">
          <path d="M10 20l30 18M22 12l30 18M150 10l-24 20M162 16l-24 20" className="app-thumb-hatch" />
          <polygon points="0,120 0,90 30,70 40,78 70,50 80,58 100,30 120,58 130,50 160,78 170,70 200,90 200,120" className="app-thumb-mount" />
          <polygon points="100,30 92,46 100,42 108,46" className="app-thumb-snow" />
        </svg>
      ) : (
        <svg className="app-thumb-art" viewBox="0 0 200 120" preserveAspectRatio="none" focusable="false">
          <path
            d="M0 20h40M0 44h40M0 68h40M0 92h40M20 20v24M10 44v24M20 68v24M160 20h40M160 44h40M160 68h40M160 92h40M180 20v24M170 44v24M180 68v24"
            className="app-thumb-bricks"
          />
          <rect x="140" y="12" width="44" height="16" rx="5" className="app-thumb-sign" />
          <path d="M60 0l-6 26M100 10l-6 26M130 0l-6 26" className="app-thumb-rain" />
        </svg>
      )}
      <div className="app-thumb-board">
        <span className="app-sq app-sq--light">
          <Piece type="k" color="w" size="100%" />
        </span>
        <span className="app-sq app-sq--dark">
          <Piece type="n" color="b" size="100%" />
        </span>
        <span className="app-sq app-sq--light">
          <Piece type="q" color="b" size="100%" />
        </span>
      </div>
      <span className="app-thumb-ghost">
        <Ghost size={36} theme={theme} />
      </span>
    </div>
  );
}

/** Miniatura de un tema que aún no existe. */
function SoonThumb() {
  return (
    <div className="app-thumb app-thumb--soon" aria-hidden="true">
      <svg className="app-thumb-art" viewBox="0 0 200 120" preserveAspectRatio="none" focusable="false">
        <polygon points="0,120 0,96 40,74 70,88 110,52 150,84 200,70 200,120" className="app-thumb-soon-shape" />
      </svg>
      <div className="app-thumb-board app-thumb-board--soon">
        <span />
        <span />
        <span />
      </div>
      <span className="app-thumb-lock">
        <Icon name="lock" size={28} />
      </span>
    </div>
  );
}

function ThemeSection() {
  const t = useT();
  const { settings, update, mode } = useSettings();
  return (
    <section className="app-settings-section" aria-labelledby="app-h-theme">
      <div className="app-section-head">
        <h2 id="app-h-theme" className="app-h3">
          {t('app.settings.theme.title')}
        </h2>
        <span className="app-card-meta">{t('app.settings.theme.hint')}</span>
      </div>
      <ul className="app-theme-grid">
        {THEMES.map((theme) => {
          const selected = settings.theme === theme;
          return (
            <li key={theme}>
              <button type="button" className="app-theme-card" aria-pressed={selected} onClick={() => update({ theme })}>
                <ThemeThumb theme={theme} mode={mode} />
                <span className="app-theme-card-body">
                  <span className="app-theme-card-name">
                    {t(`app.theme.${theme}.name`)}
                    {selected && <Icon name="check" size={18} strokeWidth={3} className="app-ic-accent" />}
                  </span>
                  <span className="app-theme-card-desc">{t(`app.theme.${theme}.desc`)}</span>
                </span>
              </button>
            </li>
          );
        })}
        {[3, 4, 5].map((n) => (
          <li key={n}>
            <div className="app-theme-card is-soon">
              <SoonThumb />
              <span className="app-theme-card-body">
                <span className="app-theme-card-name">{t('app.theme.soon.name', { n })}</span>
                <span className="app-theme-card-desc">{t('app.theme.soon.desc')}</span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Tablero en miniatura con las piezas del tema y su paleta (los valores salen de tokens.css). */
function PreviewSection() {
  const t = useT();
  const { settings, mode } = useSettings();
  const ref = useRef<HTMLUListElement>(null);
  const [hex, setHex] = useState<Record<string, string>>({});
  const swatches = [
    { key: 'bg', label: t('app.settings.palette.bg') },
    { key: 's1', label: t('app.settings.palette.surface') },
    { key: 'sq-dark', label: t('app.settings.palette.dark') },
    { key: 'sq-light', label: t('app.settings.palette.light') },
    { key: 'accent', label: t(`app.settings.palette.accent.${settings.theme}`) },
  ];
  useLayoutEffect(() => {
    if (!ref.current) return;
    const style = getComputedStyle(ref.current);
    const out: Record<string, string> = {};
    for (const key of ['bg', 's1', 'sq-dark', 'sq-light', 'accent']) out[key] = style.getPropertyValue(`--${key}`).trim().toLowerCase();
    setHex(out);
  }, [settings.theme, mode]);

  return (
    <section className="app-card app-settings-card" aria-labelledby="app-h-preview">
      <div className="app-section-head">
        <h2 id="app-h-preview" className="app-h3">
          {t('app.settings.preview.title', { theme: t(`app.theme.${settings.theme}.name`) })}
        </h2>
        <span className="app-card-meta">{t('app.settings.preview.hint')}</span>
      </div>
      <div className="app-preview-board" aria-hidden="true">
        {(['w', 'b'] as PieceColor[]).map((color, row) =>
          PIECE_ORDER.map((type, i) => (
            <span key={`${color}${type}`} className={`app-sq ${(i + row) % 2 ? 'app-sq--dark' : 'app-sq--light'}`}>
              <Piece type={type} color={color} size="84%" />
            </span>
          )),
        )}
      </div>
      <ul className="app-palette" ref={ref}>
        {swatches.map((s) => (
          <li key={s.key}>
            <span className="app-swatch" style={{ background: `var(--${s.key})` }} />
            <span className="app-swatch-name">{s.label}</span>
            <span className="app-swatch-hex">{hex[s.key] ?? ''}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ColorModeSection() {
  const t = useT();
  const { settings, update } = useSettings();
  return (
    <section className="app-card app-settings-card" aria-labelledby="app-h-mode">
      <h2 id="app-h-mode" className="app-h3">
        {t('app.settings.mode.title')}
      </h2>
      <RadioGroup<Settings['colorMode']>
        label={t('app.settings.mode.title')}
        value={settings.colorMode}
        onChange={(colorMode) => update({ colorMode })}
        className="app-seg--inset app-seg--3"
        options={[
          { value: 'dark', label: t('app.settings.mode.dark') },
          { value: 'light', label: t('app.settings.mode.light') },
          { value: 'system', label: t('app.settings.mode.system') },
        ]}
      />
      <p className="app-card-meta">{t('app.settings.mode.hint')}</p>
    </section>
  );
}

function NotationRow() {
  const t = useT();
  const { settings, update } = useSettings();
  return (
    <div className="app-setting-row app-setting-row--wrap">
      <div className="app-setting-text">
        <span className="app-setting-label" id="app-l-notation">
          {t('app.settings.notation.title')}
        </span>
        <span className="app-setting-hint">{t('app.settings.notation.hint')}</span>
      </div>
      <RadioGroup<Settings['notation']>
        label={t('app.settings.notation.title')}
        value={settings.notation}
        onChange={(notation) => update({ notation })}
        className="app-seg--inset app-seg--small"
        options={[
          { value: 'es', label: t('app.settings.notation.es') },
          { value: 'en', label: t('app.settings.notation.en') },
        ]}
      />
    </div>
  );
}

const TOGGLES = ['coordinates', 'highlightLastMove', 'planArrows', 'sounds'] as const;

function BoardSection({ idPrefix }: { idPrefix: string }) {
  const t = useT();
  const { settings, update } = useSettings();
  return (
    <section className="app-card app-settings-card app-settings-card--list" aria-labelledby={`${idPrefix}-h`}>
      <h2 id={`${idPrefix}-h`} className="app-h3">
        {t('app.settings.board.title')}
      </h2>
      {TOGGLES.map((key) => (
        <div key={key} className="app-setting-row">
          <div className="app-setting-text">
            <span className="app-setting-label" id={`${idPrefix}-${key}`}>
              {t(`app.settings.board.${key}`)}
            </span>
            <span className="app-setting-hint" id={`${idPrefix}-${key}-hint`}>
              {t(`app.settings.board.${key}.hint`)}
            </span>
          </div>
          <Switch
            checked={settings[key]}
            onChange={(on) => update({ [key]: on } as Partial<Settings>)}
            labelledBy={`${idPrefix}-${key}`}
            describedBy={`${idPrefix}-${key}-hint`}
          />
        </div>
      ))}
      <NotationRow />
    </section>
  );
}

// Posición de ejemplo: India de Rey tras 1.d4 Cf6 2.c4 g6 3.Cc3 Ag7 4.e4 d6.
const PREVIEW_FEN = 'rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR';
const FILES = 'abcdefgh';

/** Tablero de ejemplo que refleja los interruptores (coordenadas, última jugada y flechas). */
function BoardPreview() {
  const t = useT();
  const { settings } = useSettings();
  const rows = PREVIEW_FEN.split('/').map((row) => row.replace(/\d/g, (d) => '.'.repeat(Number(d))).split(''));
  const center = (sq: string) => ({ x: FILES.indexOf(sq[0]) * 12.5 + 6.25, y: (8 - Number(sq[1])) * 12.5 + 6.25 });
  // Flecha del plan de ejemplo (...e7-e5): el asta acaba donde empieza la punta.
  const from = center('e7');
  const to = center('e5');
  const len = Math.hypot(to.x - from.x, to.y - from.y);
  const ux = (to.x - from.x) / len;
  const uy = (to.y - from.y) / len;
  const tip = { x: to.x + ux * 2, y: to.y + uy * 2 };
  const base = { x: tip.x - ux * 7, y: tip.y - uy * 7 };
  const head = [
    [base.x - uy * 4.5, base.y + ux * 4.5],
    [tip.x, tip.y],
    [base.x + uy * 4.5, base.y - ux * 4.5],
  ]
    .map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`)
    .join(' ');
  return (
    <section className="app-card app-settings-card" aria-labelledby="app-h-board-preview">
      <div className="app-section-head">
        <h2 id="app-h-board-preview" className="app-h3">
          {t('app.settings.boardPreview.title')}
        </h2>
        <span className="app-card-meta">{t('app.settings.boardPreview.hint')}</span>
      </div>
      <div className="app-mini-board" aria-hidden="true">
        {rows.map((row, r) =>
          row.map((ch, f) => {
            const sq = `${FILES[f]}${8 - r}`;
            const dark = (f + (8 - r)) % 2 === 1;
            const last = settings.highlightLastMove && (sq === 'd7' || sq === 'd6');
            return (
              <span key={sq} className={`app-sq ${dark ? 'app-sq--dark' : 'app-sq--light'}${last ? ' is-last' : ''}`}>
                {settings.coordinates && f === 0 && <span className="app-coord app-coord--rank">{8 - r}</span>}
                {settings.coordinates && r === 7 && <span className="app-coord app-coord--file">{FILES[f]}</span>}
                {ch !== '.' && <Piece type={ch.toLowerCase() as PieceType} color={ch === ch.toUpperCase() ? 'w' : 'b'} size="88%" />}
              </span>
            );
          }),
        )}
        {settings.planArrows && (
          <svg className="app-mini-arrows" viewBox="0 0 100 100" focusable="false">
            <line x1={from.x + ux * 3} y1={from.y + uy * 3} x2={base.x} y2={base.y} />
            <polygon points={head} />
          </svg>
        )}
      </div>
    </section>
  );
}

function LanguageSection() {
  const t = useT();
  const { settings, update } = useSettings();
  return (
    <section className="app-card app-settings-card app-settings-card--list" aria-labelledby="app-h-lang">
      <h2 id="app-h-lang" className="app-h3">
        {t('app.settings.language.title')}
      </h2>
      <div className="app-setting-row app-setting-row--wrap">
        <div className="app-setting-text">
          <span className="app-setting-label">{t('app.settings.language.label')}</span>
          <span className="app-setting-hint">{t('app.settings.language.hint')}</span>
        </div>
        <RadioGroup<Settings['locale']>
          label={t('app.settings.language.label')}
          value={settings.locale}
          onChange={(locale) => update({ locale })}
          className="app-seg--inset app-seg--small"
          options={[
            { value: 'es', label: <span lang="es">Español</span> },
            { value: 'en', label: <span lang="en">English</span> },
          ]}
        />
      </div>
      <NotationRow />
    </section>
  );
}

export default function SettingsPage() {
  const t = useT();
  const [params, setParams] = useSearchParams();
  const raw = params.get('s');
  const tab: Tab = (TABS as readonly string[]).includes(raw ?? '') ? (raw as Tab) : 'apariencia';
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const title = t(`app.settings.tab.${TAB_KEYS[tab]}`);
  useDocumentTitle(`${title} · ${t('app.nav.settings')}`);

  const select = (next: Tab) => setParams(next === 'apariencia' ? {} : { s: next }, { replace: true });
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = TABS.length - 1;
    const next = e.key === 'ArrowRight' ? (i === last ? 0 : i + 1) : e.key === 'ArrowLeft' ? (i === 0 ? last : i - 1) : e.key === 'Home' ? 0 : e.key === 'End' ? last : -1;
    if (next < 0) return;
    e.preventDefault();
    select(TABS[next]);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="app-page app-settings">
      <header className="app-page-head app-page-head--stack">
        <div className="app-page-head-text">
          <span className="app-eyebrow">{t('app.nav.settings')}</span>
          <h1 className="app-h1">{title}</h1>
        </div>
        <div role="tablist" aria-label={t('app.settings.tabs')} className="app-tabs">
          {TABS.map((id, i) => (
            <button
              key={id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              id={`app-stab-${id}`}
              type="button"
              role="tab"
              aria-selected={tab === id}
              aria-controls="app-settings-panel"
              tabIndex={tab === id ? 0 : -1}
              className="app-tab"
              onClick={() => select(id)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              {t(`app.settings.tab.${TAB_KEYS[id]}`)}
            </button>
          ))}
        </div>
      </header>

      <div id="app-settings-panel" role="tabpanel" aria-labelledby={`app-stab-${tab}`} className="app-settings-panel">
        {tab === 'apariencia' && (
          <>
            <ThemeSection />
            <div className="app-settings-grid">
              <PreviewSection />
              <div className="app-settings-col">
                <ColorModeSection />
                <BoardSection idPrefix="app-b1" />
              </div>
            </div>
          </>
        )}
        {tab === 'tablero' && (
          <div className="app-settings-grid">
            <BoardSection idPrefix="app-b2" />
            <BoardPreview />
          </div>
        )}
        {tab === 'idioma' && (
          <div className="app-settings-narrow">
            <LanguageSection />
          </div>
        )}
        {tab === 'cuenta' && (
          <div className="app-settings-narrow">
            <AccountSection headingId="app-h-account" />
          </div>
        )}
      </div>
    </div>
  );
}
