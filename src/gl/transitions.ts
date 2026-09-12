// Registry of the GLSL transitions (builtin:tr-*), mapping our
// TransitionType → fragment source + default uniforms. Defaults follow the
// (name, default, min, max) table in shaders/README.md; the vec3
// color defaults aren't in that table — chosen by eye.
import type { GlslTransitionType, TransitionDirection } from '../editor/types';
import type { UniformValue } from './runtime';
import pageCurl from './shaders/page-curl.frag?raw';
import rackFocus from './shaders/rack-focus.frag?raw';
import organicDissolve from './shaders/organic-dissolve.frag?raw';
import impactShake from './shaders/impact-shake.frag?raw';
import anticipationZoom from './shaders/anticipation-zoom.frag?raw';
import cleanLineWipe from './shaders/clean-line-wipe.frag?raw';
import crossDissolve from './shaders/cross-dissolve.frag?raw';
import dipToBlack from './shaders/dip-to-black.frag?raw';
import flash from './shaders/flash.frag?raw';
import lumaBlend from './shaders/luma-blend.frag?raw';
import softWipe from './shaders/soft-wipe.frag?raw';
import whipPan from './shaders/whip-pan.frag?raw';
import circleWipe from './shaders/circle-wipe.frag?raw';
import radialBlur from './shaders/radial-blur.frag?raw';
import glitchCut from './shaders/glitch-cut.frag?raw';
import dipToColor from './shaders/dip-to-color.frag?raw';
import slideWipe from './shaders/slide-wipe.frag?raw';
import pushSwap from './shaders/push-swap.frag?raw';
import cubeRotate from './shaders/cube-rotate.frag?raw';
import cardFlip from './shaders/card-flip.frag?raw';
import diamondWipe from './shaders/diamond-wipe.frag?raw';
import starWipe from './shaders/star-wipe.frag?raw';
import heartWipe from './shaders/heart-wipe.frag?raw';
import lightLeak from './shaders/light-leak.frag?raw';
import filmBurn from './shaders/film-burn.frag?raw';
import kaleidoscope from './shaders/kaleidoscope.frag?raw';
import mirrorSlide from './shaders/mirror-slide.frag?raw';
import mosaicDissolve from './shaders/mosaic-dissolve.frag?raw';
import zoomPunch from './shaders/zoom-punch.frag?raw';
import datamosh from './shaders/datamosh.frag?raw';
import venetianBlinds from './shaders/venetian-blinds.frag?raw';
import clockWipe from './shaders/clock-wipe.frag?raw';
import checkerWipe from './shaders/checker-wipe.frag?raw';
import swirlWarp from './shaders/swirl-warp.frag?raw';

export interface GlslTransitionDef {
  frag: string;
  /** per-frame uniforms beyond u_progress/u_resolution/u_aspect */
  uniforms: (ctx: { time: number; aspect: number; direction: TransitionDirection }) => Record<string, UniformValue>;
}

export const GLSL_TRANSITIONS: Record<GlslTransitionType, GlslTransitionDef> = {
  'cross-dissolve': {
    frag: crossDissolve,
    uniforms: () => ({ u_easingAmount: 1 }),
  },
  'dip-to-black': {
    frag: dipToBlack,
    uniforms: () => ({ u_blackDuration: 0.2 }),
  },
  flash: {
    frag: flash,
    uniforms: () => ({ u_flashColor: [1, 1, 1], u_flashHold: 0.1, u_overexposure: 2 }),
  },
  'luma-blend': {
    frag: lumaBlend,
    uniforms: () => ({ u_intensity: 2, u_additiveAmount: 0.5, u_threshold: 0.3 }),
  },
  'soft-wipe': {
    frag: softWipe,
    uniforms: () => ({ u_feather: 0.4, u_parallax: 0.05 }),
  },
  'whip-pan': {
    frag: whipPan,
    uniforms: ({ direction }) => ({
      u_dir: direction === 'right' ? [-1, 0] : direction === 'up' ? [0, -1] : direction === 'down' ? [0, 1] : [1, 0],
      u_blurStrength: 0.15,
      u_bounceback: 0.1,
    }),
  },
  'page-curl': {
    frag: pageCurl,
    uniforms: () => ({
      u_radius: 0.12, // Ai default [0.02, 0.5]
      u_glossiness: 0.6, // Ai default [0, 1]
      u_paperTint: [0.97, 0.95, 0.9], // Paper back color (customized)
    }),
  },
  'rack-focus': {
    frag: rackFocus,
    uniforms: () => ({
      u_blurStrength: 0.5, // Ai default [0, 1]
      u_chromaticAberration: 0.4, // Ai default [0, 1]
      u_contrastLoss: 0.2, // Ai default [0, 1]
    }),
  },
  'organic-dissolve': {
    frag: organicDissolve,
    uniforms: ({ time, aspect }) => ({
      u_ratio: aspect,
      u_time: time,
      u_glowWidth: 0.05, // Ai default [0, 0.5]
      u_depth: 1.8, // Ai default [0.1, 4]
      u_glowColor: [1.0, 0.55, 0.18], // Burning edge orange (customized)
    }),
  },
  'impact-shake': {
    frag: impactShake,
    uniforms: () => ({
      u_shakeIntensity: 0.03, // Ai default [0, 0.2]
      u_zoomPunch: 1.08, // Ai default [1, 2]
      u_chromaticAmount: 0.01, // Ai default [0, 0.1]
    }),
  },
  'anticipation-zoom': {
    frag: anticipationZoom,
    uniforms: () => ({
      u_windupAmount: 0.15, // Ai default [0, 1]
      u_zoomAmount: 6, // Ai default [0, 20]
      u_incomingStartScale: 0.8, // Ai default [0.1, 1]
    }),
  },
  'clean-line-wipe': {
    frag: cleanLineWipe,
    uniforms: () => ({
      u_lineWidth: 0.006, // Thin bright line width (customized)
      u_lineColor: [1, 1, 1], // Custom
    }),
  },
  // ── Extended generated library ──────────────────────────────────────────
  'circle-wipe': {
    frag: circleWipe,
    uniforms: () => ({
      u_feather: 0.04,
      u_center: [0.5, 0.5],
    }),
  },
  'radial-blur': {
    frag: radialBlur,
    uniforms: () => ({
      u_blurStrength: 0.22,
      u_center: [0.5, 0.5],
    }),
  },
  'glitch-cut': {
    frag: glitchCut,
    uniforms: ({ time }) => ({
      u_intensity: 1,
      u_time: time,
    }),
  },
  'dip-to-color': {
    frag: dipToColor,
    uniforms: () => ({
      // warm brand flash — bright enough to read on dark library cards
      u_color: [0.95, 0.38, 0.14],
      // short hold so PREVIEW_PROGRESS (~0.42) still shows outgoing + color blend
      u_hold: 0.12,
    }),
  },
  // ── CapCut-parity batch: slide/push/3D/shape-mask/light/glitch/specialty ──
  'slide-wipe': {
    frag: slideWipe,
    uniforms: ({ direction }) => ({
      u_dir: direction === 'right' ? [-1, 0] : direction === 'up' ? [0, -1] : direction === 'down' ? [0, 1] : [1, 0],
    }),
  },
  'push-swap': {
    frag: pushSwap,
    uniforms: ({ direction }) => ({
      u_dir: direction === 'right' ? [-1, 0] : direction === 'up' ? [0, -1] : direction === 'down' ? [0, 1] : [1, 0],
    }),
  },
  'cube-rotate': {
    frag: cubeRotate,
    uniforms: () => ({}),
  },
  'card-flip': {
    frag: cardFlip,
    uniforms: () => ({}),
  },
  'diamond-wipe': {
    frag: diamondWipe,
    uniforms: () => ({ u_feather: 0.05, u_center: [0.5, 0.5] }),
  },
  'star-wipe': {
    frag: starWipe,
    uniforms: () => ({ u_feather: 0.04, u_center: [0.5, 0.5] }),
  },
  'heart-wipe': {
    frag: heartWipe,
    uniforms: () => ({ u_feather: 0.05, u_center: [0.5, 0.5] }),
  },
  'light-leak': {
    frag: lightLeak,
    uniforms: () => ({ u_leakColor: [1.0, 0.78, 0.45], u_intensity: 0.9 }),
  },
  'film-burn': {
    frag: filmBurn,
    uniforms: ({ time }) => ({ u_time: time, u_burnIntensity: 0.8 }),
  },
  kaleidoscope: {
    frag: kaleidoscope,
    uniforms: () => ({ u_segments: 8 }),
  },
  'mirror-slide': {
    frag: mirrorSlide,
    uniforms: () => ({}),
  },
  'mosaic-dissolve': {
    frag: mosaicDissolve,
    uniforms: () => ({}),
  },
  'zoom-punch': {
    frag: zoomPunch,
    uniforms: () => ({ u_punchAmount: 0.35 }),
  },
  datamosh: {
    frag: datamosh,
    uniforms: ({ time }) => ({ u_time: time, u_blockiness: 1 }),
  },
  'venetian-blinds': {
    frag: venetianBlinds,
    uniforms: ({ direction }) => ({
      u_slats: 10,
      u_vertical: direction === 'up' || direction === 'down' ? 0 : 1,
    }),
  },
  'clock-wipe': {
    frag: clockWipe,
    uniforms: () => ({ u_center: [0.5, 0.5] }),
  },
  'checker-wipe': {
    frag: checkerWipe,
    uniforms: () => ({ u_squares: 12 }),
  },
  'swirl-warp': {
    frag: swirlWarp,
    uniforms: () => ({ u_swirlAmount: 2.4 }),
  },
};
