import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast harus dipakai di dalam <ToastProvider>');
  }
  return ctx;
};

const TOAST_STYLE: Record<ToastType, { bg: string; iconBg: string }> = {
  success: { bg: 'bg-neo-mint text-neo-dark', iconBg: 'text-neo-dark' },
  error: { bg: 'bg-neo-pink text-neo-dark', iconBg: 'text-neo-dark' },
  warning: { bg: 'bg-neo-yellow text-neo-dark', iconBg: 'text-neo-dark' },
  info: { bg: 'bg-neo-toska text-neo-dark', iconBg: 'text-neo-dark' },
};

const TOAST_ICON: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={20} className="shrink-0" />,
  error: <XCircle size={20} className="shrink-0" />,
  warning: <AlertTriangle size={20} className="shrink-0" />,
  info: <Info size={20} className="shrink-0" />,
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const success = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const error = useCallback((message: string) => showToast(message, 'error'), [showToast]);
  const warning = useCallback((message: string) => showToast(message, 'warning'), [showToast]);
  const info = useCallback((message: string) => showToast(message, 'info'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}

      {/* Toast Message Box Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 w-[min(92vw,380px)] pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-toast-in pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border-3 border-neo-dark shadow-neo font-jakarta ${
              TOAST_STYLE[t.type].bg
            }`}
            role="alert"
          >
            <span className={`mt-0.5 ${TOAST_STYLE[t.type].iconBg}`}>{TOAST_ICON[t.type]}</span>
            <p className="flex-1 text-[13px] font-bold leading-snug break-words">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              title="Tutup"
              className="shrink-0 rounded-md p-0.5 opacity-70 hover:opacity-100 hover:bg-black/10 transition cursor-pointer"
            >
              <XCircle size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;