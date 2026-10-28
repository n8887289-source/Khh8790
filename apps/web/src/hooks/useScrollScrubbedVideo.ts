import { useEffect, useState, type RefObject } from 'react';

/**
 * Scroll-driven video scrubbing.
 *
 * The hero film is never played. Its `currentTime` is written from the visitor's
 * scroll position, so the same frames run forwards and backwards and a stopped
 * scroll holds the exact frame it reached.
 *
 * Performance notes for whoever maintains this:
 *
 * - The scroll listener does not touch the video. It only schedules a frame;
 *   all reads happen inside `requestAnimationFrame`, once per rendered frame.
 * - `currentTime` is written against a *smoothed* time, not the raw scroll
 *   target, so a trackpad's uneven wheel events cannot throw the decoder around.
 * - One seek is in flight at a time. Writing `currentTime` while the browser is
 *   still resolving a previous seek is what makes scrubbing stutter, so a frame
 *   is skipped while `video.seeking` is true ("seeked" resumes the loop).
 * - Small changes are dropped (`MIN_SEEK`), which removes hundreds of pointless
 *   seeks per second on slow scrolls.
 * - The loop stops as soon as the smoothed time settles, so an idle page runs no
 *   animation work at all.
 * - Encoding matters as much as the code: the shipped files are H.264 with a
 *   keyframe every 6 frames (`-g 6 -sc_threshold 0`), which keeps a seek to a
 *   handful of decoded frames. Re-encode any replacement the same way; a file
 *   with one keyframe per second will scrub badly no matter what this code does.
 */

/** Portion of the remaining distance the smoothed time closes per 60Hz frame. */
const SMOOTHING = 0.22;
/** Smallest change in video time worth a decoder seek (~1/60s). */
const MIN_SEEK = 1 / 60;
/** Below this difference the smoothed time snaps to the target. */
const SETTLE = 0.004;
/** Scroll progress at which the hero copy has completely faded out. */
const COPY_FADE_END = 0.42;
/** Copy travel distance (px) while it fades, for a slight lift. */
const COPY_LIFT = 26;

type Options = {
  /** Tall (300svh) section that provides the scroll distance. */
  sectionRef: RefObject<HTMLElement>;
  videoRef: RefObject<HTMLVideoElement>;
  /** Hero copy that eases away as the scene moves. */
  copyRef?: RefObject<HTMLElement>;
  /** Thin rail under the hero that reports progress. */
  progressRef?: RefObject<HTMLElement>;
  enabled: boolean;
};

export function useScrollScrubbedVideo({
  sectionRef,
  videoRef,
  copyRef,
  progressRef,
  enabled,
}: Options) {
  useEffect(() => {
    if (!enabled) return;

    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    let frameHandle = 0;
    let lastFrameAt = 0;
    let duration = 0;
    /** Where the scroll says the film should be (seconds). */
    let targetTime = 0;
    /** Where the eased timeline currently is. */
    let smoothTime = 0;
    /** Last value handed to the decoder. */
    let paintedTime = -1;
    let lastCopyOpacity = -1;

    const schedule = () => {
      if (!frameHandle) frameHandle = window.requestAnimationFrame(step);
    };

    const paintCopy = (progress: number) => {
      const copy = copyRef?.current;
      if (!copy) return;
      const opacity = Math.max(0, 1 - progress / COPY_FADE_END);
      if (Math.abs(opacity - lastCopyOpacity) < 0.004) return;
      lastCopyOpacity = opacity;
      copy.style.opacity = opacity.toFixed(3);
      copy.style.transform = `translate3d(0, ${(-COPY_LIFT * (1 - opacity)).toFixed(2)}px, 0)`;
      copy.style.visibility = opacity < 0.02 ? 'hidden' : 'visible';
      // A faded-out hero must not swallow clicks meant for what is behind it.
      copy.style.pointerEvents = opacity < 0.15 ? 'none' : '';
    };

    const step = (timestamp: number) => {
      frameHandle = 0;

      // 1. Scroll position → progress. Measured from the live rect so a resize,
      //    an orientation change or a collapsing mobile URL bar cannot leave the
      //    mapping stale.
      const rect = section.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const progress = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 1;

      const rail = progressRef?.current;
      if (rail) rail.style.transform = `scale3d(${progress}, 1, 1)`;
      paintCopy(progress);

      if (duration <= 0) return;

      // 2. Progress → target time, eased with a frame-rate independent factor so
      //    120Hz screens do not converge twice as fast as 60Hz ones.
      const deltaMs = lastFrameAt ? Math.min(64, Math.max(8, timestamp - lastFrameAt)) : 16.7;
      lastFrameAt = timestamp;
      const ease = 1 - Math.pow(1 - SMOOTHING, deltaMs / 16.7);

      targetTime = progress * duration;
      smoothTime += (targetTime - smoothTime) * ease;
      if (Math.abs(targetTime - smoothTime) < SETTLE) smoothTime = targetTime;

      // 3. Seek, but never on top of a seek that is still resolving.
      if (video.seeking) return;

      if (Math.abs(smoothTime - paintedTime) > MIN_SEEK) {
        video.currentTime = Math.min(smoothTime, Math.max(0, duration - 0.001));
        paintedTime = smoothTime;
      }

      if (smoothTime !== targetTime) schedule();
    };

    const readDuration = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        duration = video.duration;
        schedule();
      }
    };

    const onMediaEvent = () => {
      lastFrameAt = 0;
      readDuration();
      schedule();
    };

    readDuration();
    schedule();

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);
    video.addEventListener('loadedmetadata', onMediaEvent);
    video.addEventListener('durationchange', onMediaEvent);
    video.addEventListener('seeked', onMediaEvent);

    return () => {
      if (frameHandle) window.cancelAnimationFrame(frameHandle);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('orientationchange', schedule);
      video.removeEventListener('loadedmetadata', onMediaEvent);
      video.removeEventListener('durationchange', onMediaEvent);
      video.removeEventListener('seeked', onMediaEvent);
    };
  }, [enabled, sectionRef, videoRef, copyRef, progressRef]);
}

export type VideoReadiness = 'loading' | 'ready' | 'error';

/**
 * Tracks whether the hero film has enough data to show and be scrubbed.
 * `error` is reported so the hero can fall back to its still photograph.
 */
export function useVideoReadiness(
  videoRef: RefObject<HTMLVideoElement>,
  enabled = true,
): VideoReadiness {
  const [state, setState] = useState<VideoReadiness>('loading');

  useEffect(() => {
    if (!enabled) return;
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    const set = (next: VideoReadiness) => {
      if (!cancelled) setState(next);
    };

    const onReady = () => set('ready');
    const onError = () => set('error');
    const onLoadStart = () => set('loading');

    // Already decoded (cached file, or a hot reload) — do not flash a poster.
    if (video.readyState >= 2) set('ready');

    video.addEventListener('loadstart', onLoadStart);
    video.addEventListener('loadeddata', onReady);
    video.addEventListener('canplay', onReady);
    video.addEventListener('error', onError);

    return () => {
      cancelled = true;
      video.removeEventListener('loadstart', onLoadStart);
      video.removeEventListener('loadeddata', onReady);
      video.removeEventListener('canplay', onReady);
      video.removeEventListener('error', onError);
    };
  }, [videoRef, enabled]);

  return state;
}
