import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useStore } from '../store/StoreContext';

const TONES = {
  success: { icon: CheckCircle2, className: 'border-violet/40 bg-abyss text-ink' },
  error: { icon: AlertCircle, className: 'border-red-500/40 bg-abyss text-ink' },
  info: { icon: Info, className: 'border-graphite bg-abyss text-ink' },
} as const;

export function Toaster() {
  const { toasts, dismissToast } = useStore();

  return (
    <div
      className="pointer-events-none fixed bottom-5 right-5 z-[90] flex w-[min(92vw,22rem)] flex-col gap-2"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => {
        const tone = TONES[toast.tone];
        const Icon = tone.icon;
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl animate-fade-up ${tone.className}`}
          >
            <Icon
              size={16}
              className={
                toast.tone === 'success'
                  ? 'mt-0.5 text-violet'
                  : toast.tone === 'error'
                    ? 'mt-0.5 text-red-400'
                    : 'mt-0.5 text-mist'
              }
            />
            <p className="flex-1 text-[13px] leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-mist transition hover:text-ink"
              aria-label="Dismiss message"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
