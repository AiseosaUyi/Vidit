export { MATCH_AUDIO_TOOL_SCHEMAS, MATCH_AUDIO_TOOL_NAMES } from './schemas/match-audio-tools';
// match_audio — denoise + level-match audio across cut scenes in one step.
//
// Composes the two existing primitives instead of inventing new DSP:
//   1. isolate_voice's ffmpeg denoise (src/audio/isolateVoice.ts) per eligible clip.
//   2. normalize_loudness's offline WebAudio loudness analysis (src/audio/loudness.ts),
//      but against ONE shared target so every clip lands at the same level —
//      the actual fix for "clips cut from different takes/locations sound inconsistent".
import type { AgentContext } from '../context';
import type { AtomicAction } from '../../editor/reduce';
import { isolateVoiceOnSrc } from '../../audio/isolateVoice';
import { analyzeLoudnessBatch, gainForTarget } from '../../audio/loudness';
import { captureTimelineItemSource, validateTimelineItemSourceResult } from '../../editor/mediaSourceRevision';

type Args = Record<string, unknown>;

const DEFAULT_TARGET_LUFS = -16;
const DEFAULT_DENOISE_STRENGTH = 60;

function findTargetItems(ctx: AgentContext, itemId: unknown) {
  const candidates = ctx.getState().items.filter((it) => it.kind === 'audio' || it.kind === 'video');
  const q = itemId === undefined || itemId === null ? '' : String(itemId);
  if (!q) return candidates;
  const match = candidates.find((it) => it.id === q || it.id.startsWith(q));
  return match ? [match] : [];
}

export async function execMatchAudioTool(name: string, args: Args, ctx: AgentContext): Promise<unknown> {
  if (name !== 'match_audio') return { error: `unknown tool ${name}` };

  const items = findTargetItems(ctx, args.itemId);
  if (items.length === 0) {
    return args.itemId
      ? { error: `no video/audio clip ${args.itemId}` }
      : { ok: true, matched: [], note: 'timeline 上没有 video/audio clip' };
  }

  const target = typeof args.target === 'number' && Number.isFinite(args.target) ? args.target : DEFAULT_TARGET_LUFS;
  const denoiseStrength = Number.isFinite(Number(args.strength))
    ? Math.max(0, Math.min(100, Number(args.strength)))
    : DEFAULT_DENOISE_STRENGTH;
  const runDenoise = args.denoise !== false;
  const force = args.force === true;

  const doc = ctx.getDoc();
  const activeTimelineId = doc.activeTimelineId;
  const snapshots = items.map((item) => captureTimelineItemSource(item, doc.assets));

  const denoised = new Map<string, { denoisedSrc: string; strength: number; sourceRevision: string }>();
  const skipped: { itemId: string; note: string }[] = [];

  if (runDenoise) {
    await Promise.all(items.map(async (item, index) => {
      const snapshot = snapshots[index]!;
      if (!snapshot.src.startsWith('/media/uploads/')) {
        skipped.push({ itemId: item.id, note: '需先上传到媒体池（/media/uploads），已跳过降噪' });
        return;
      }
      try {
        const r = await isolateVoiceOnSrc(snapshot.src, denoiseStrength, { force, sourceRevision: snapshot.sourceRevision });
        denoised.set(item.id, { denoisedSrc: r.path, strength: r.strength, sourceRevision: r.sourceRevision });
      } catch (e) {
        skipped.push({ itemId: item.id, note: `降噪失败: ${e instanceof Error ? e.message : String(e)}` });
      }
    }));
  }

  const analyses = await analyzeLoudnessBatch(snapshots.map((s) => s.src).filter(Boolean));

  const actions: AtomicAction[] = [];
  const matched: { itemId: string; denoised: boolean; measuredLufs: number; gain: number }[] = [];

  for (const [index, item] of items.entries()) {
    const snapshot = snapshots[index]!;
    const denoiseResult = denoised.get(item.id);
    const current = ctx.getState().items.find((candidate) => candidate.id === item.id);
    const validation = validateTimelineItemSourceResult(
      snapshot,
      current,
      ctx.getDoc().assets,
      denoiseResult?.sourceRevision ?? snapshot.sourceRevision,
    );
    if (activeTimelineId !== ctx.getDoc().activeTimelineId || validation.status === 'stale') {
      skipped.push({ itemId: item.id, note: '源素材在处理期间已变化，请重试' });
      continue;
    }

    // Denoise and loudness-match are independent halves: a clip that fails one
    // still keeps the other rather than discarding a successful ffmpeg pass.
    if (denoiseResult) {
      actions.push({ type: 'setItemDenoise', id: item.id, denoisedSrc: denoiseResult.denoisedSrc, strength: denoiseResult.strength });
    }

    if (!snapshot.src) {
      skipped.push({ itemId: item.id, note: 'no src' });
      continue;
    }
    const analysis = analyses.get(snapshot.src);
    if (!analysis || analysis.status === 'rejected') {
      skipped.push({
        itemId: item.id,
        note: `响度分析失败: ${analysis?.status === 'rejected'
          ? (analysis.reason instanceof Error ? analysis.reason.message : String(analysis.reason))
          : 'unknown'}`,
      });
      continue;
    }
    const gain = gainForTarget(analysis.value, target);
    actions.push({ type: 'setVolume', id: item.id, volume: gain });
    matched.push({ itemId: item.id, denoised: Boolean(denoiseResult), measuredLufs: analysis.value, gain });
  }

  if (actions.length > 0) ctx.commands.batch(actions, 'Match audio across clips');

  return {
    ok: true,
    matched,
    target,
    denoiseStrength: runDenoise ? denoiseStrength : null,
    ...(skipped.length > 0 ? { skipped } : {}),
  };
}
