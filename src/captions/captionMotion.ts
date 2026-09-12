import type { CSSProperties } from 'react';
import type { CaptionMotionPreset, CaptionPage } from './types';

export const CAPTION_MOTION_OPTIONS = [
  { id: 'none', label: '无动效' },
  { id: 'fade-up', label: '淡入上浮' },
  { id: 'pop', label: '弹性入场' },
  { id: 'word-pop', label: '逐词弹出' },
  { id: 'karaoke-pulse', label: '卡拉 OK 脉冲' },
  { id: 'typewriter', label: '打字机逐词' },
  { id: 'slide-in-word', label: '逐词滑入' },
  { id: 'bounce-in-page', label: '整句弹跳入场' },
  { id: 'shake-emphasis', label: '重音抖动' },
] as const satisfies ReadonlyArray<{ id: CaptionMotionPreset; label: string }>;

const PRESETS = new Set<CaptionMotionPreset>(CAPTION_MOTION_OPTIONS.map((option) => option.id));
const EMPTY_STYLE: CSSProperties = Object.freeze({});
const PAGE_ENTER_MS = 180;
const PAGE_EXIT_MS = 120;
const WORD_ENTER_MS = 140;

export function isCaptionMotionPreset(value: unknown): value is CaptionMotionPreset {
  return typeof value === 'string' && PRESETS.has(value as CaptionMotionPreset);
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function easeOutCubic(value: number): number {
  const clamped = clamp01(value);
  return 1 - (1 - clamped) ** 3;
}

function easeOutBack(value: number): number {
  const clamped = clamp01(value);
  const overshoot = 1.70158;
  return 1 + (overshoot + 1) * (clamped - 1) ** 3 + overshoot * (clamped - 1) ** 2;
}

function pageOpacity(page: CaptionPage, timelineMs: number): number {
  const enter = easeOutCubic((timelineMs - page.start) / PAGE_ENTER_MS);
  const exit = clamp01((page.end - timelineMs) / PAGE_EXIT_MS);
  return Math.min(enter, exit);
}

/** Page-level motion. Nest this below the placement container so layout transforms remain intact. */
export function captionPageMotionStyle(
  preset: CaptionMotionPreset | undefined,
  page: CaptionPage,
  timelineMs: number,
): CSSProperties {
  if (!preset || preset === 'none' || preset === 'word-pop' || preset === 'karaoke-pulse'
    || preset === 'typewriter' || preset === 'slide-in-word' || preset === 'shake-emphasis') {
    return EMPTY_STYLE;
  }
  const enter = easeOutCubic((timelineMs - page.start) / PAGE_ENTER_MS);
  const opacity = pageOpacity(page, timelineMs);
  if (preset === 'fade-up') {
    return { opacity, transform: `translateY(${Number(((1 - enter) * 18).toFixed(3))}px)` };
  }
  if (preset === 'bounce-in-page') {
    const scale = easeOutBack((timelineMs - page.start) / (PAGE_ENTER_MS * 1.4));
    return { opacity, transform: `scale(${Number((0.55 + scale * 0.45).toFixed(4))})`, transformOrigin: 'center' };
  }
  const scale = easeOutBack((timelineMs - page.start) / PAGE_ENTER_MS);
  return { opacity, transform: `scale(${Number((0.78 + scale * 0.22).toFixed(4))})`, transformOrigin: 'center' };
}

/** Per-word motion derived only from absolute edited-timeline milliseconds. */
export function captionWordMotionStyle(
  preset: CaptionMotionPreset | undefined,
  word: Pick<CaptionPage['words'][number], 'start' | 'end'>,
  timelineMs: number,
): CSSProperties {
  if (!preset || preset === 'none' || preset === 'fade-up' || preset === 'pop' || preset === 'bounce-in-page') return EMPTY_STYLE;
  if (preset === 'word-pop') {
    const enter = easeOutBack((timelineMs - word.start) / WORD_ENTER_MS);
    const visible = timelineMs >= word.start;
    return {
      display: 'inline-block',
      opacity: visible ? 1 : 0,
      transform: `scale(${Number((0.72 + enter * 0.28).toFixed(4))})`,
      transformOrigin: 'center bottom',
    };
  }
  if (preset === 'typewriter') {
    const enter = easeOutCubic((timelineMs - word.start) / WORD_ENTER_MS);
    const visible = timelineMs >= word.start;
    return {
      display: 'inline-block',
      opacity: visible ? 1 : 0,
      transform: `scaleX(${Number((0.3 + enter * 0.7).toFixed(4))})`,
      transformOrigin: 'left center',
    };
  }
  if (preset === 'slide-in-word') {
    const enter = easeOutCubic((timelineMs - word.start) / WORD_ENTER_MS);
    const visible = timelineMs >= word.start;
    return {
      display: 'inline-block',
      opacity: visible ? clamp01(enter) : 0,
      transform: `translateY(${Number(((1 - enter) * 14).toFixed(3))}px)`,
      transformOrigin: 'center bottom',
    };
  }
  if (preset === 'shake-emphasis') {
    if (timelineMs < word.start || timelineMs > word.end) return EMPTY_STYLE;
    const duration = Math.max(1, word.end - word.start);
    const t = (timelineMs - word.start) / duration;
    const seed = word.start % 1000;
    const shakeX = Math.sin(t * Math.PI * 6 + seed) * 3;
    const shakeY = Math.cos(t * Math.PI * 5 + seed) * 2;
    return {
      display: 'inline-block',
      transform: `translate(${Number(shakeX.toFixed(3))}px, ${Number(shakeY.toFixed(3))}px)`,
    };
  }
  if (timelineMs < word.start || timelineMs > word.end) return EMPTY_STYLE;
  const duration = Math.max(1, word.end - word.start);
  const progress = clamp01((timelineMs - word.start) / duration);
  const scale = 1 + Math.sin(progress * Math.PI) * 0.08;
  return {
    display: 'inline-block',
    transform: `scale(${Number(scale.toFixed(4))})`,
    transformOrigin: 'center bottom',
  };
}
