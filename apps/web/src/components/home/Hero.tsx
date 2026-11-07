import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/Button';
import { WatchTheFilmButton } from '../PromoFilm';
import { ArrowRightIcon, CraftIcon, TruckIcon, WaveIcon } from '../../lib/icons';
import { classNames } from '../../lib/format';
import { useScrollScrubbedVideo, useVideoReadiness } from '../../hooks/useScrollScrubbedVideo';

const BENEFITS = [
  { icon: WaveIcon, title: 'Studio-Grade Sound', copy: 'True to the original' },
  { icon: CraftIcon, title: 'Premium Craftsmanship', copy: 'Built to last' },
  { icon: TruckIcon, title: 'Free Shipping', copy: 'On orders over $99' },
];

/**
 * Hero film. Two encodes of the same 8s scene: a 1280px desktop cut and a 854px
 * mobile cut (roughly a third of the bytes). Both were re-encoded from the master
 * with a keyframe every 6 frames and `-movflags +faststart` so seeking is cheap —
 * see the notes at the top of `useScrollScrubbedVideo`.
 */
const VIDEO_DESKTOP = '/videos/sonique-hero-1280.mp4';
const VIDEO_MOBILE = '/videos/sonique-hero-854.mp4';
/** First frame, shown until the film can be scrubbed. */
const VIDEO_POSTER = '/videos/sonique-hero-poster.jpg';
/** Still photograph used when the film cannot load at all. */
const HERO_FALLBACK = '/images/editorial/hero-headphones.jpg';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const SMALL_SCREEN = '(max-width: 767px)';

const matches = (query: string) =>
  typeof window !== 'undefined' && window.matchMedia(query).matches;

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [reducedMotion, setReducedMotion] = useState(() => matches(REDUCED_MOTION));
  const [source, setSource] = useState(() =>
    matches(SMALL_SCREEN) ? VIDEO_MOBILE : VIDEO_DESKTOP,
  );
  /** Height of the sticky header (announcement bar + nav), 0 until measured. */
  const [headerHeight, setHeaderHeight] = useState(0);

  const readiness = useVideoReadiness(videoRef, !reducedMotion);
  /** Scroll scrubbing runs only when there is a film to scrub. */
  const scrubbing = !reducedMotion && readiness !== 'error';

  useScrollScrubbedVideo({ sectionRef, videoRef, copyRef, progressRef, enabled: scrubbing });

  useEffect(() => {
    const query = window.matchMedia(REDUCED_MOTION);
    const onChange = () => setReducedMotion(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const query = window.matchMedia(SMALL_SCREEN);
    const onChange = () => setSource(query.matches ? VIDEO_MOBILE : VIDEO_DESKTOP);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  // The hero is pulled up behind the sticky header so its pinned viewport is the
  // whole screen from the first frame — nothing of the film or the strip below it
  // starts under the fold. Only the announcement bar and the nav bar are
  // measured, so opening the mobile menu does not move the hero.
  useEffect(() => {
    const header = document.querySelector('header');
    const bars = header ? (Array.from(header.children).slice(0, 2) as HTMLElement[]) : [];
    if (!bars.length) return;

    const measure = () =>
      setHeaderHeight(
        Math.round(bars.reduce((total, bar) => total + bar.getBoundingClientRect().height, 0)),
      );

    measure();
    const observer = new ResizeObserver(measure);
    bars.forEach((bar) => observer.observe(bar));
    window.addEventListener('resize', measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  // The hero film is always paused: scrolling moves `currentTime`, nothing else.
  // This guard stops anything (an extension, a browser heuristic) from playing it.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const keepPaused = () => video.pause();
    video.pause();
    video.addEventListener('play', keepPaused);
    return () => video.removeEventListener('play', keepPaused);
  }, [readiness]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-title"
      style={headerHeight ? { marginTop: -headerHeight } : undefined}
      className={classNames(
        'relative border-b border-line/70',
        // The extra height is the scroll distance the pinned film is scrubbed
        // across; a static hero (reduced motion or fallback) needs none of it.
        scrubbing && 'h-[240svh] sm:h-[300svh]',
      )}
    >
      <div
        className={classNames(
          'relative h-[100svh] w-full overflow-hidden',
          scrubbing && 'sticky top-0',
        )}
      >
        {/* Film */}
        <div aria-hidden="true" className="absolute inset-0">
          <img
            src={readiness === 'error' ? HERO_FALLBACK : VIDEO_POSTER}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
          {!reducedMotion && (
            <video
              ref={videoRef}
              src={source}
              poster={VIDEO_POSTER}
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              disableRemotePlayback
              tabIndex={-1}
              className={classNames(
                'absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out',
                readiness === 'ready' ? 'opacity-100' : 'opacity-0',
              )}
              onLoadedMetadata={(event) => {
                // Paused, first frame decoded and paintable before the reveal.
                const video = event.currentTarget;
                video.pause();
                if (video.currentTime === 0) video.currentTime = 0.001;
              }}
            />
          )}
        </div>

        {/* Light scrims: enough for legibility over the bright part of the scene,
            never enough to hide the film. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[68%] bg-[linear-gradient(to_top,rgba(5,6,9,0.95),rgba(5,6,9,0.55)_38%,transparent)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,rgba(5,6,9,0.72)_0%,rgba(5,6,9,0.3)_40%,transparent_66%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(to_bottom,rgba(5,6,9,0.55),transparent)]"
        />

        <div className="relative flex h-full flex-col">
          {/* Copy */}
          <div className="shell flex flex-1 flex-col justify-center pb-8 pt-[104px] sm:pb-12">
            <div
              ref={copyRef}
              className="max-w-[34rem] will-change-[opacity,transform] [text-shadow:0_1px_24px_rgba(3,4,8,0.55)]"
            >
              <p className="eyebrow text-white/70">Sound lives deeper</p>
              <h1
                id="hero-title"
                className="mt-3 text-[32px] font-semibold leading-[1.02] tracking-[-0.035em] sm:text-[46px] lg:text-[54px] xl:text-[62px]"
              >
                <span className="block">Hear Every</span>
                <span className="block text-brand-soft">Detail</span>
              </h1>
              <p className="mt-3 max-w-[30ch] text-[13.5px] font-medium leading-snug text-paper/90 sm:text-[15px]">
                Premium audio for a more meaningful you.
              </p>
              <p className="mt-2 max-w-[46ch] text-[12.5px] leading-relaxed text-paper/75 sm:mt-3 sm:text-[13.5px]">
                From immersive headphones to powerful speakers, SONIQUE brings your world to life
                with extraordinary clarity.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2 sm:mt-6">
                <Button to="/shop" size="sm">
                  Shop All Products
                  <ArrowRightIcon size={14} />
                </Button>
                <WatchTheFilmButton className="border-white/25 bg-ink/30 px-4 py-2 text-[12px] backdrop-blur-sm" />
              </div>
            </div>
          </div>

          {/* Hero footer: scroll cue, load state and the benefits strip */}
          <div className="relative">
            <div className="shell">
              <div className="flex items-center justify-between gap-4 border-t border-white/15 pt-3">
                <p className="flex items-center gap-2.5 text-[9px] uppercase tracking-[0.24em] text-white/65">
                  {scrubbing && (
                    <span
                      aria-hidden="true"
                      className="h-1 w-1 animate-pulse rounded-full bg-brand-soft"
                    />
                  )}
                  {scrubbing ? 'Scroll to explore' : 'Sound lives deeper'}
                </p>
                <p className="hidden text-[9px] uppercase tracking-[0.24em] text-white/45 sm:block">
                  {scrubbing && readiness === 'loading'
                    ? 'Preparing experience'
                    : 'A higher standard of sound'}
                </p>
              </div>

              <ul className="grid grid-cols-3 gap-2 py-4 sm:gap-6 sm:py-5">
                {BENEFITS.map((benefit, index) => (
                  <li
                    key={benefit.title}
                    className={classNames(
                      'flex items-start gap-2 sm:gap-3',
                      index > 0 && 'border-l border-white/15 pl-2 sm:pl-5',
                    )}
                  >
                    <benefit.icon size={16} className="mt-0.5 shrink-0 text-brand-soft" />
                    <div className="min-w-0">
                      <p className="text-[11.5px] font-semibold leading-tight sm:text-[12.5px]">
                        {benefit.title}
                      </p>
                      <p className="text-[10.5px] leading-tight text-white/60 sm:text-[11.5px]">
                        {benefit.copy}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {scrubbing && (
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-px overflow-hidden bg-white/10"
              >
                <div
                  ref={progressRef}
                  className="h-px w-full origin-left bg-gradient-to-r from-electric to-brand-soft"
                  style={{ transform: 'scale3d(0, 1, 1)' }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
