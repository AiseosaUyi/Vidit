import type { AgentToolSchema } from '../../tool-schema';

export const MATCH_AUDIO_TOOL_SCHEMAS: AgentToolSchema[] = [
  {
    name: 'match_audio',
    description:
      'Clean up and level-match audio across cut scenes in one step: for each target video/audio clip it runs ffmpeg voice-isolation denoise (removes background noise/room tone/hum so the clips no longer sound like they were recorded in different places) '
      + 'and then normalizes every clip to the SAME target loudness (LUFS), so the sound stays consistent across cuts/joins instead of jumping in level or noise character from scene to scene. '
      + 'Denoise uses the same open-box ffmpeg engine as isolate_voice; loudness uses the same offline WebAudio analysis as normalize_loudness. '
      + 'To fix MANY/all clips, call this ONCE with NO itemId — a single call processes every video/audio clip on the active timeline. Pass itemId ONLY to target one specific clip. '
      + 'Set denoise=false to skip the noise-removal step and only level-match loudness.',
    input_schema: {
      type: 'object',
      properties: {
        itemId: { type: 'string', description: 'Target only this clip (prefix id ok). Omit to process every video/audio clip on the active timeline.' },
        target: { type: 'number', description: 'Target integrated loudness in LUFS shared by every processed clip (default -16, a dialogue-consistency target).' },
        strength: {
          type: 'number',
          minimum: 0,
          maximum: 100,
          description: 'Denoise strength 0..100 (default 60). Ignored when denoise=false.',
        },
        denoise: {
          type: 'boolean',
          description: 'Run ffmpeg voice-isolation denoise before loudness matching (default true). Set false to only level-match loudness.',
        },
        force: {
          type: 'boolean',
          description: 'Re-run denoise even when a matching cached artifact already exists for a clip.',
        },
      },
    },
  },
];

export const MATCH_AUDIO_TOOL_NAMES = new Set(MATCH_AUDIO_TOOL_SCHEMAS.map((t) => t.name));
