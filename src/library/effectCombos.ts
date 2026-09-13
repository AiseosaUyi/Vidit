/** One-click multi-effect stacks — apply 2-3 existing builtin:fx-* shaders together
 *  at their tuned default values via the existing per-effect apply path (onApplyFx),
 *  called once per id. No new engine/reducer work: this is a UI-level composition of
 *  the FX_EFFECTS catalog already in ./effects.ts. */
export interface EffectCombo {
  id: string;
  label: string;
  effectIds: string[];
}

export const EFFECT_COMBOS: EffectCombo[] = [
  { id: 'vhs-retro', label: 'VHS 复古', effectIds: ['builtin:fx-crt', 'builtin:fx-film-grain', 'builtin:fx-rgb-split'] },
  { id: 'layered-glitch', label: '叠层故障', effectIds: ['builtin:fx-glitch', 'builtin:fx-rgb-split'] },
  { id: 'dreamy-bloom', label: '梦幻光晕', effectIds: ['builtin:fx-bloom', 'builtin:fx-soft-blur', 'builtin:fx-vignette'] },
  { id: 'old-film', label: '老电影', effectIds: ['builtin:fx-sepia', 'builtin:fx-film-grain', 'builtin:fx-vignette'] },
];
