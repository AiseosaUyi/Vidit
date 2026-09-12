import assert from 'node:assert/strict';
import { CURRENT_PROJECT_VERSION } from '../../../shared/project-version';
import type { AgentContext } from '../context';
import { activeEditorState, activeTimeline, type ProjectDoc } from '../../editor/types';
import { historyReduce, type History } from '../../editor/reduce';
import type { EditorCommands } from '../../editor/store';
import { integratedLoudnessFromSamples } from '../../audio/loudness';
import { execMatchAudioTool, MATCH_AUDIO_TOOL_SCHEMAS } from './match-audio-tools';

const schema = MATCH_AUDIO_TOOL_SCHEMAS[0]!;
assert.equal(schema.name, 'match_audio');
const properties = schema.input_schema.properties as Record<string, Record<string, unknown>>;
assert(properties.target);
assert(properties.strength);
assert(properties.denoise);

const initial: ProjectDoc = {
  version: CURRENT_PROJECT_VERSION,
  assets: [],
  mediaFolders: [],
  activeTimelineId: 'timeline_main',
  timelines: [{
    id: 'timeline_main', name: 'Main', order: 0, fps: 30, width: 1920, height: 1080,
    trackOrder: ['track_video', 'track_audio'], tracks: { track_video: { kind: 'video' }, track_audio: { kind: 'audio' } }, selectedId: null,
    items: [
      // Uploaded video clip — eligible for both denoise and loudness matching.
      { id: 'clip_video_a', track: 'track_video', startFrame: 0, durationInFrames: 90, name: 'Scene A', kind: 'video', src: '/media/uploads/scene-a.mp4' },
      // Uploaded standalone audio clip — same treatment.
      { id: 'clip_audio_b', track: 'track_audio', startFrame: 0, durationInFrames: 90, name: 'VO B', kind: 'audio', src: '/media/uploads/scene-b.wav' },
      // Not uploaded yet — denoise must be skipped, loudness matching still applies.
      { id: 'clip_video_c', track: 'track_video', startFrame: 90, durationInFrames: 90, name: 'Scene C', kind: 'video', src: 'blob:local-preview-c' },
      // A text clip must never be touched by an audio tool.
      { id: 'clip_text_d', track: 'track_video', startFrame: 180, durationInFrames: 30, name: 'Title', kind: 'text' },
    ],
  }],
};

let history: History = { past: [], present: structuredClone(initial), future: [] };
const commands = {
  batch: (actions, label) => { history = historyReduce(history, { type: 'batch', actions, label }); },
} as Pick<EditorCommands, 'batch'>;
const ctx: AgentContext = {
  commands: commands as EditorCommands,
  getState: () => activeEditorState(history.present),
  getDoc: () => history.present,
  getCreativeMode: () => null,
  templates: [],
  audio: [],
};

const isolateCalls: string[] = [];
const decodedSrcs: string[] = [];
const originalFetch = globalThis.fetch;
const originalContext = globalThis.OfflineAudioContext;

globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);
  if (init?.method === 'POST' && url === '/api/isolate-voice') {
    const body = JSON.parse(String(init.body ?? '{}')) as { src: string; sourceRevision?: string };
    isolateCalls.push(body.src);
    return Response.json({
      path: `${body.src}.denoised.m4a`,
      sourceRevision: body.sourceRevision ?? 'rev',
      bytes: 512,
      engine: 'ffmpeg-open-box',
    });
  }
  decodedSrcs.push(url);
  return new Response(new Uint8Array([1]), { status: 200 });
}) as typeof fetch;

globalThis.OfflineAudioContext = class {
  async decodeAudioData() {
    return {
      numberOfChannels: 1,
      length: 4,
      sampleRate: 44100,
      getChannelData: () => new Float32Array([0.1, -0.1, 0.1, -0.1]),
    };
  }
} as unknown as typeof OfflineAudioContext;

const expectedLufs = integratedLoudnessFromSamples(new Float32Array([0.1, -0.1, 0.1, -0.1]), 44100);

try {
  const result = await execMatchAudioTool('match_audio', {}, ctx) as {
    ok: boolean;
    matched: { itemId: string; denoised: boolean; measuredLufs: number; gain: number }[];
    target: number;
    denoiseStrength: number;
    skipped?: { itemId: string; note: string }[];
  };

  assert.equal(result.ok, true);
  assert.equal(result.target, -16, 'defaults to a shared -16 LUFS dialogue target');
  assert.equal(result.denoiseStrength, 60);

  // Only the two uploaded clips get denoised; the un-uploaded and text clips are excluded.
  assert.deepEqual(new Set(isolateCalls), new Set(['/media/uploads/scene-a.mp4', '/media/uploads/scene-b.wav']));

  // All three video/audio clips get loudness-matched to the SAME target — this is the
  // actual fix for cuts sounding inconsistent across scenes/locations.
  const matchedIds = result.matched.map((entry) => entry.itemId).sort();
  assert.deepEqual(matchedIds, ['clip_audio_b', 'clip_video_a', 'clip_video_c']);
  for (const entry of result.matched) {
    assert.equal(entry.measuredLufs, expectedLufs);
    assert.ok(Number.isFinite(entry.gain));
  }
  assert.equal(result.matched.find((e) => e.itemId === 'clip_video_a')?.denoised, true);
  assert.equal(result.matched.find((e) => e.itemId === 'clip_audio_b')?.denoised, true);
  assert.equal(result.matched.find((e) => e.itemId === 'clip_video_c')?.denoised, false);

  assert.deepEqual(result.skipped?.map((e) => e.itemId), ['clip_video_c']);

  const timeline = activeTimeline(history.present);
  assert.equal(timeline.items.find((i) => i.id === 'clip_video_a')?.denoisedSrc, '/media/uploads/scene-a.mp4.denoised.m4a');
  assert.equal(timeline.items.find((i) => i.id === 'clip_video_c')?.denoisedSrc, undefined, 'un-uploaded clip must not get a fabricated denoisedSrc');
  assert.equal(timeline.items.find((i) => i.id === 'clip_text_d')?.volume, undefined, 'text clip must never be touched');

  // The whole cross-clip fix is one undoable step.
  assert.equal(history.past.length, 1, 'denoise + loudness match across every clip is a single undo step');
  history = historyReduce(history, { type: 'undo' });
  assert.deepEqual(history.present, initial);
  history = historyReduce(history, { type: 'redo' });

  // itemId narrows to a single clip.
  isolateCalls.length = 0;
  const single = await execMatchAudioTool('match_audio', { itemId: 'clip_audio_b', target: -20 }, ctx) as {
    matched: { itemId: string }[];
  };
  assert.deepEqual(single.matched.map((e) => e.itemId), ['clip_audio_b']);
  assert.deepEqual(isolateCalls, ['/media/uploads/scene-b.wav']);

  // denoise=false only level-matches loudness, no ffmpeg call at all.
  isolateCalls.length = 0;
  const noDenoise = await execMatchAudioTool('match_audio', { denoise: false }, ctx) as {
    denoiseStrength: number | null;
    matched: { itemId: string; denoised: boolean }[];
  };
  assert.equal(noDenoise.denoiseStrength, null);
  assert.equal(isolateCalls.length, 0);
  assert.ok(noDenoise.matched.every((e) => e.denoised === false));

  const missing = await execMatchAudioTool('match_audio', { itemId: 'does-not-exist' }, ctx) as { error?: string };
  assert.match(String(missing.error), /no video\/audio clip/);
} finally {
  globalThis.fetch = originalFetch;
  globalThis.OfflineAudioContext = originalContext;
}

console.log('match_audio denoise+loudness cross-clip matching checks passed');
