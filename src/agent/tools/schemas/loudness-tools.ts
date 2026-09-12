import type { AgentToolSchema } from '../../tool-schema';

export const LOUDNESS_TOOL_SCHEMAS: AgentToolSchema[] = [
  {
    name: 'normalize_loudness',
    description:
      'Normalize video/audio clip(s) to a target integrated loudness (LUFS) by analyzing each clip offline (WebAudio) and applying the computed gain as the clip volume. Covers BOTH standalone audio clips and video clips (dialogue is usually embedded in the video track). Defaults to -14 LUFS (streaming loudness standard); use -16 to match speech/dialogue across clips cut from different takes or locations so the level does not jump at cuts. To normalize MANY/all clips, call this ONCE with NO itemId — a single call processes every video/audio clip on the active timeline and returns per-clip results ({itemId, measuredLufs, gain}). Do NOT call it once per clip. Pass itemId ONLY to normalize a single specific clip. For dirty audio (background noise, room tone) across many cut scenes, prefer match_audio, which combines denoise + loudness matching in one step.',
    input_schema: {
      type: 'object',
      properties: {
        target: { type: 'number', description: 'Target integrated loudness in LUFS (default -14).' },
        itemId: { type: 'string', description: 'Normalize only this clip (prefix id ok). Omit to normalize all audio clips.' },
      },
    },
  },
];

export const LOUDNESS_TOOL_NAMES = new Set(LOUDNESS_TOOL_SCHEMAS.map((t) => t.name));
