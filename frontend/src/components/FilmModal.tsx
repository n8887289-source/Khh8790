import { useEffect, useRef, useState } from 'react';
import { Pause, Play, X } from 'lucide-react';
import { useBodyLock, useEscapeKey, useMediaQuery } from '../lib/hooks';

const FRAMES = [
  { src: '/img/hero.jpg', caption: 'Engineered in the dark, tuned for the light' },
  { src: '/img/story.jpg', caption: 'Built for the moments that matter' },
  { src: '/img/promo-speaker.jpg', caption: 'Rugged. Portable. Unstoppable.' },
];

const DURATION_MS = 12000;

/**
 * "Watch the Film" - this store has no video asset configured, so instead of a broken
 * player the panel plays a cinematic still sequence with a real play/pause control and
 * timeline. Drop a real film file in and it can replace this stage.
 */
export function FilmModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const frameRef = useRef(0);
  const [frame, setFrame] = useState(0);

  useBodyLock(open);
  useEscapeKey(open, onClose);

  useEffect(() => {
    if (!open) {
      setPlaying(false);
      setProgress(0);
      frameRef.current = 0;
      setFrame(0);
      return undefined;
    }
    if (!reducedMotion) setPlaying(true);
    return undefined;
  }, [open, reducedMotion]);

  useEffect(() => {
    if (!open || !playing) return undefined;
    const timer = window.setInterval(() => {
      setProgress((current) => {
        const next = current + (100 / (DURATION_MS / 100));
        if (next >= 100) {
          const nextFrame = (frameRef.current + 1) % FRAMES.length;
          frameRef.current = nextFrame;
          setFrame(nextFrame);
          return 0;
        }
        return next;
      });
    }, 100);
    return () => window.clearInterval(timer);
  }, [open, playing]);

  if (!open) return null;

  const seconds = Math.round((progress / 100) * (DURATION_MS / 1000));

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="SONIQUE film">
      <div className="absolute inset-0 bg-void/92 backdrop-blur-md" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-4xl animate-scale-in overflow-hidden rounded-2xl border border-graphite bg-midnight">
        <div className="relative aspect-[16/9] overflow-hidden bg-void">
          {FRAMES.map((item, index) => (
            <img
              key={item.src}
              src={item.src}
              alt=""
              aria-hidden={index !== frame}
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                opacity: index === frame ? 1 : 0,
                transform: playing && index === frame ? 'scale(1.06)' : 'scale(1)',
                transition: 'opacity 900ms ease, transform 6000ms ease-out',
              }}
            />
          ))}
          <span className="absolute inset-0 bg-gradient-to-t from-void via-void/25 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-5 sm:p-7">
            <div>
              <p className="label-xs">Sonique film</p>
              <p className="mt-2 max-w-md text-lg font-medium sm:text-2xl">
                {FRAMES[frame].caption}
              </p>
              <p className="mt-2 text-xs text-mist">
                Motion still sequence — no video file is configured for this demo store.
              </p>
            </div>
            <div className="hidden items-end gap-1 sm:flex" aria-hidden="true">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((bar) => (
                <span
                  key={bar}
                  className="w-1.5 rounded-full bg-violet/80"
                  style={{
                    height: `${18 + ((bar * 7) % 26)}px`,
                    animation: playing ? `bar 1.1s ease-in-out ${bar * 90}ms infinite` : 'none',
                    transform: playing ? undefined : 'scaleY(0.35)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t border-graphite px-5 py-4">
          <button
            type="button"
            onClick={() => setPlaying((value) => !value)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet text-white transition hover:bg-violet-soft"
            aria-label={playing ? 'Pause the film' : 'Play the film'}
          >
            {playing ? <Pause size={18} /> : <Play size={18} className="translate-x-[1px]" />}
          </button>
          <div className="flex-1">
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sonic to-violet transition-[width] duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-mist">
              <span>{playing ? 'Playing' : 'Paused'}</span>
              <span>
                {String(Math.floor(seconds / 60)).padStart(2, '0')}:
                {String(seconds % 60).padStart(2, '0')} / 00:12
              </span>
            </div>
          </div>
          <button type="button" className="icon-btn" aria-label="Close film" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
