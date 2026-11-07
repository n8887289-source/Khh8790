import { useEffect, useState } from 'react';
import { Modal } from './ui/Modal';
import { PlayIcon, WaveIcon } from '../lib/icons';
import { Button } from './ui/Button';
import { cn } from '../lib/cn';

type Segment = {
  id: string;
  title: string;
  caption: string;
  frame: string;
  /** How long the scene runs, in milliseconds. */
  duration: number;
};

/**
 * Promotional film modal.
 *
 * This store has no video file to stream, so rather than a broken player the
 * modal presents the campaign as an animated three-scene sequence with real
 * playback controls, and says exactly what it is.
 */
const SEGMENTS: Segment[] = [
  {
    id: 'deeper',
    title: 'Sound Lives Deeper',
    caption: 'Every SONIQUE product starts as a measurement of the room it will fill.',
    frame: '/images/editorial/film-1.jpg',
    duration: 8000,
  },
  {
    id: 'detail',
    title: 'Hear Every Detail',
    caption: 'Beryllium-coated drivers and adaptive cancellation, tuned by ear as well as by machine.',
    frame: '/images/editorial/film-2.jpg',
    duration: 8000,
  },
  {
    id: 'brighter',
    title: 'A Brighter You',
    caption: 'Music is not background. It is the room you live in.',
    frame: '/images/editorial/film-3.jpg',
    duration: 8000,
  },
];

export function PromoFilm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const segment = SEGMENTS[index];
  const remaining = Math.max(0, Math.ceil((segment.duration * (1 - progress)) / 1000));

  useEffect(() => {
    if (!open || !playing) return;

    const started = Date.now() - progress * segment.duration;
    const tick = window.setInterval(() => {
      const elapsed = Date.now() - started;
      const ratio = Math.min(elapsed / segment.duration, 1);
      setProgress(ratio);
      if (ratio >= 1) {
        window.clearInterval(tick);
        setPlaying(false);
        setProgress(0);
        setIndex((current) => (current + 1) % SEGMENTS.length);
      }
    }, 120);

    return () => window.clearInterval(tick);
    // `progress` intentionally excluded so the timer is not rebuilt on every tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, playing, segment.duration, index]);

  const close = () => {
    setPlaying(false);
    setProgress(0);
    setIndex(0);
    onClose();
  };

  const goTo = (position: number) => {
    setIndex(position);
    setProgress(0);
    setPlaying(true);
  };

  return (
    <Modal open={open} onClose={close} title="Watch the Film" className="max-w-3xl">
      <div className="relative overflow-hidden rounded-xl border border-line bg-ink">
        <img
          src={segment.frame}
          alt={`Campaign scene: ${segment.title}`}
          className="h-[210px] w-full object-cover opacity-90 transition-opacity duration-500 sm:h-[300px]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <p className="eyebrow mb-2 flex items-center gap-2">
            <WaveIcon size={14} /> Scene {index + 1} of {SEGMENTS.length}
          </p>
          <h3 className="text-2xl font-semibold sm:text-3xl">{segment.title}</h3>
          <p className="mt-2 max-w-xl text-[13.5px] text-mute">{segment.caption}</p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <button
          type="button"
          onClick={() => setPlaying((value) => !value)}
          aria-label={playing ? 'Pause the promotional film' : 'Play the promotional film'}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-white transition hover:brightness-110"
        >
          {playing ? (
            <span className="text-[13px] font-bold tracking-tight" aria-hidden="true">
              ❙❙
            </span>
          ) : (
            <PlayIcon size={16} />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div
            className="h-1 w-full overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-label="Scene progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
          >
            <div
              className="h-full bg-gradient-to-r from-electric to-brand transition-[width] duration-150"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11.5px] text-mute">
            <span>
              Scene {index + 1} / {SEGMENTS.length}
            </span>
            <span>{playing ? `${remaining}s remaining` : 'Paused'}</span>
          </div>
        </div>

        <div className="hidden shrink-0 gap-1 sm:flex">
          {SEGMENTS.map((item, position) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(position)}
              aria-label={`Go to scene ${position + 1}: ${item.title}`}
              aria-current={position === index}
              className={cn(
                'h-1.5 w-8 rounded-full transition',
                position === index ? 'bg-brand' : 'bg-white/15 hover:bg-white/30',
              )}
            />
          ))}
        </div>
      </div>

      <p className="mt-5 text-[12px] leading-relaxed text-mute">
        No video file is available for this storefront, so this is an animated campaign sequence
        rather than streaming footage.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button to="/shop" onClick={close}>
          Shop All Products
        </Button>
        <Button variant="outline" onClick={close}>
          Close
        </Button>
      </div>
    </Modal>
  );
}

/** Hero link that opens the promotional film. */
export function WatchTheFilmButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={cn('btn btn-outline', className)}
        onClick={() => setOpen(true)}
      >
        <PlayIcon size={13} />
        Watch the Film
      </button>
      <PromoFilm open={open} onClose={() => setOpen(false)} />
    </>
  );
}
