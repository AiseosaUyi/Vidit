import type { TrackId } from './trackTypes.js';

/** transitions with a CSS fallback for non-texturable DOM clips. */
export type CssTransitionType =
  | 'cross-dissolve'
  | 'dip-to-black'
  | 'soft-wipe'
  | 'whip-pan'
  | 'flash'
  | 'luma-blend';

/** these video transitions run their real GLSL for video/image clips. */
export type GlslTransitionType =
  | CssTransitionType
  | 'page-curl'
  | 'rack-focus'
  | 'organic-dissolve'
  | 'impact-shake'
  | 'anticipation-zoom'
  | 'clean-line-wipe'
  | 'circle-wipe'
  | 'radial-blur'
  | 'glitch-cut'
  | 'dip-to-color'
  | 'slide-wipe'
  | 'push-swap'
  | 'cube-rotate'
  | 'card-flip'
  | 'diamond-wipe'
  | 'star-wipe'
  | 'heart-wipe'
  | 'light-leak'
  | 'film-burn'
  | 'kaleidoscope'
  | 'mirror-slide'
  | 'mosaic-dissolve'
  | 'zoom-punch'
  | 'datamosh'
  | 'venetian-blinds'
  | 'clock-wipe'
  | 'checker-wipe'
  | 'swirl-warp';

/** Audio-only transitions (preset `trAudioCrossFade`) — no picture. */
export type AudioTransitionType = 'audio-cross-fade';

/** builtin transition ids + extended library transitions + audio + custom shader.
 *  'custom-shader' = a submit_shader-generated transition; its two-input GLSL lives on the
 *  TransitionItem (customFrag), NOT in the exhaustive GLSL_TRANSITIONS record. */
export type TransitionType = GlslTransitionType | AudioTransitionType | 'custom-shader';

export const GLSL_TRANSITION_TYPES: ReadonlySet<string> = new Set<string>([
  'cross-dissolve', 'dip-to-black', 'soft-wipe', 'whip-pan', 'flash', 'luma-blend',
  'page-curl', 'rack-focus', 'organic-dissolve', 'impact-shake', 'anticipation-zoom', 'clean-line-wipe',
  'circle-wipe', 'radial-blur', 'glitch-cut', 'dip-to-color',
  'slide-wipe', 'push-swap', 'cube-rotate', 'card-flip', 'diamond-wipe', 'star-wipe', 'heart-wipe',
  'light-leak', 'film-burn', 'kaleidoscope', 'mirror-slide', 'mosaic-dissolve', 'zoom-punch',
  'datamosh', 'venetian-blinds', 'clock-wipe', 'checker-wipe', 'swirl-warp',
  'custom-shader', // takes the GL render path; frag comes from the item, not GLSL_TRANSITIONS
]);

export const CSS_TRANSITION_TYPES: ReadonlySet<string> = new Set<string>([
  'cross-dissolve', 'dip-to-black', 'soft-wipe', 'whip-pan', 'flash', 'luma-blend',
]);

export const AUDIO_TRANSITION_TYPES: ReadonlySet<AudioTransitionType> = new Set<AudioTransitionType>([
  'audio-cross-fade',
]);

export function isAudioTransition(type: TransitionType): type is AudioTransitionType {
  return AUDIO_TRANSITION_TYPES.has(type as AudioTransitionType);
}

export function isVisualTransition(type: TransitionType): type is GlslTransitionType {
  return !isAudioTransition(type);
}

// en labels for the transition library cards (Resource Library·Transition·Screen Transition).
// Shared by the inspector select + the resource-library grid.
export const TRANSITION_LABELS: Record<TransitionType, string> = {
  'anticipation-zoom': '推进转场',
  'clean-line-wipe': '白色划线转场',
  'cross-dissolve': '叠化转场',
  'dip-to-black': '闪黑转场',
  flash: '闪白转场',
  'impact-shake': '冲击抖动转场',
  'luma-blend': '叠加转场',
  'organic-dissolve': '光溶转场',
  'page-curl': '翻页转场',
  'rack-focus': '焦点转场',
  'soft-wipe': '柔化擦除转场',
  'whip-pan': '甩镜转场',
  'circle-wipe': '圆形擦除转场',
  'radial-blur': '径向模糊转场',
  'glitch-cut': '故障切换转场',
  'dip-to-color': '闪色转场',
  'slide-wipe': '滑动转场',
  'push-swap': '推拉转场',
  'cube-rotate': '立方体旋转转场',
  'card-flip': '卡片翻转转场',
  'diamond-wipe': '菱形擦除转场',
  'star-wipe': '星形擦除转场',
  'heart-wipe': '心形擦除转场',
  'light-leak': '漏光转场',
  'film-burn': '胶片灼烧转场',
  kaleidoscope: '万花筒转场',
  'mirror-slide': '镜像滑动转场',
  'mosaic-dissolve': '马赛克溶解转场',
  'zoom-punch': '冲击变焦转场',
  datamosh: '数据故障转场',
  'venetian-blinds': '百叶窗转场',
  'clock-wipe': '时钟扫描转场',
  'checker-wipe': '棋盘格转场',
  'swirl-warp': '漩涡扭曲转场',
  /** preset.name.trAudioCrossFade */
  'audio-cross-fade': '音频交叉淡化',
  /** submit_shader-generated custom transition (per-item label in customLabel) */
  'custom-shader': '自定义着色器转场',
};

/** catalog display order + extended visual transitions. */
export const TRANSITION_ORDER: readonly GlslTransitionType[] = [
  'anticipation-zoom',
  'clean-line-wipe',
  'cross-dissolve',
  'dip-to-black',
  'flash',
  'impact-shake',
  'luma-blend',
  'organic-dissolve',
  'page-curl',
  'rack-focus',
  'soft-wipe',
  'whip-pan',
  'circle-wipe',
  'radial-blur',
  'glitch-cut',
  'dip-to-color',
  'slide-wipe',
  'push-swap',
  'cube-rotate',
  'card-flip',
  'diamond-wipe',
  'star-wipe',
  'heart-wipe',
  'light-leak',
  'film-burn',
  'kaleidoscope',
  'mirror-slide',
  'mosaic-dissolve',
  'zoom-punch',
  'datamosh',
  'venetian-blinds',
  'clock-wipe',
  'checker-wipe',
  'swirl-warp',
];

/** Audio transition catalog (trAudioCrossFade). */
export const AUDIO_TRANSITION_ORDER: readonly AudioTransitionType[] = [
  'audio-cross-fade',
];

export type TransitionDirection = 'left' | 'right' | 'up' | 'down';

/** an independent transition item straddling the cut between two adjacent
 * same-track clips (transition_item: outgoing→incoming). */
export interface TransitionItem {
  id: string;
  type: TransitionType;
  /** transition length in frames (half retreats into outgoing, half into incoming) */
  durationInFrames: number;
  outgoingItemId: string;
  incomingItemId: string;
  trackId: TrackId;
  enabled?: boolean;
  /** direction for wipe/whip transitions (default 'left') */
  direction?: TransitionDirection;
  /** type='custom-shader' only: the submit_shader-generated two-input transition GLSL,
   *  stored here (not in a registry) so it persists with the project and renders after
   *  reload. customUniforms = {u_<key>: value}; customLabel = display name. */
  customFrag?: string;
  customUniforms?: Record<string, number>;
  customLabel?: string;
}
