import type { VideoBitrateMode } from './bitrate';
import type { ExportResolution } from './mediaSettings';

/** canvas orientation a preset targets, derived from the exported width/height. */
export type PresetAspect = 'portrait' | 'square' | 'landscape';

export interface PlatformPreset {
  id: string;
  label: string;
  aspect: PresetAspect;
  aspectLabel: string;
  resolution: ExportResolution;
  fps: number;
  bitrateMode: VideoBitrateMode;
}

/** One-click bundles for the common social delivery targets — resolution, fps, and a
 * bitrate headroom platforms re-encode aggressively (so `high` beats the automatic
 * default for vertical/short-form). Codec is always h264 for maximum compatibility. */
export const PLATFORM_PRESETS: readonly PlatformPreset[] = [
  { id: 'tiktok', label: 'TikTok', aspect: 'portrait', aspectLabel: '9:16', resolution: '1080p', fps: 30, bitrateMode: 'high' },
  { id: 'reels', label: 'Instagram Reels', aspect: 'portrait', aspectLabel: '9:16', resolution: '1080p', fps: 30, bitrateMode: 'high' },
  { id: 'shorts', label: 'YouTube Shorts', aspect: 'portrait', aspectLabel: '9:16', resolution: '1080p', fps: 30, bitrateMode: 'high' },
  { id: 'feed', label: 'Instagram Feed', aspect: 'square', aspectLabel: '1:1', resolution: '1080p', fps: 30, bitrateMode: 'recommended' },
  { id: 'youtube', label: 'YouTube', aspect: 'landscape', aspectLabel: '16:9', resolution: '1080p', fps: 30, bitrateMode: 'recommended' },
];

export function aspectOf(width: number, height: number): PresetAspect {
  if (width === height) return 'square';
  return width > height ? 'landscape' : 'portrait';
}
