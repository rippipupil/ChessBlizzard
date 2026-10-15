// Avisos breves (etapa bloqueada, sesión iniciada...). La región aria-live existe siempre
// para que los lectores de pantalla anuncien cada aviso nuevo.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useT } from '../i18n';
import { Icon, type IconName } from './icons';

export type ToastTone = 'info' | 'success' | 'warn' | 'error';

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
  at: number;
}

type ShowToast = (message: string, tone?: ToastTone) => void;

const ToastContext = createContext<ShowToast>(() => {});

const ICON: Record<ToastTone, IconName> = { info: 'info', success: 'check', warn: 'lock', error: 'cloudOff' };
const DURATION = 5000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const t = useT();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const show = useCallback<ShowToast>((message, tone = 'info') => {
    const now = Date.now();
    setToasts((list) => {
      // Evita duplicados (por ejemplo, el doble efecto de StrictMode en desarrollo).
      if (list.some((x) => x.message === message && now - x.at < 1500)) return list;
      return [...list.slice(-2), { id: nextId.current++, message, tone, at: now }];
    });
  }, []);

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((x) => x.id !== id)), []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const oldest = toasts[0];
    const timer = setTimeout(() => dismiss(oldest.id), Math.max(0, oldest.at + DURATION - Date.now()));
    return () => clearTimeout(timer);
  }, [toasts, dismiss]);

  const value = useMemo(() => show, [show]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="app-toasts" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`app-toast app-toast--${toast.tone}`}>
            <Icon name={ICON[toast.tone]} size={20} />
            <span className="app-toast-text">{toast.message}</span>
            <button type="button" className="app-toast-close" onClick={() => dismiss(toast.id)} aria-label={t('app.close')}>
              <Icon name="close" size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ShowToast {
  return useContext(ToastContext);
}
