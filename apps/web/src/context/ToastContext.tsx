import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type Toast = { id: number; title: string; description?: string; tone: 'success' | 'error' };

type ToastContextValue = {
  notify: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = nextId++;
      setToasts((current) => [...current.slice(-2), { ...toast, id }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-pop surface pointer-events-auto flex w-full max-w-sm items-start gap-3 bg-navy/95 p-4 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.9)] backdrop-blur"
          >
            <span
              className={
                toast.tone === 'success'
                  ? 'mt-1 h-2 w-2 shrink-0 rounded-full bg-brand'
                  : 'mt-1 h-2 w-2 shrink-0 rounded-full bg-[#ff6b6b]'
              }
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-paper">{toast.title}</p>
              {toast.description ? (
                <p className="mt-0.5 text-[13px] leading-snug text-mute">{toast.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="text-mute transition hover:text-paper"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
