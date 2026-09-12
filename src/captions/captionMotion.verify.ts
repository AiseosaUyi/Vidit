import assert from 'node:assert/strict';
import type { CaptionPage } from './types';
import {
  captionPageMotionStyle,
  captionWordMotionStyle,
  isCaptionMotionPreset,
} from './captionMotion';

const page: CaptionPage = {
  start: 1_000,
  end: 2_000,
  words: [
    { id: 'first', text: 'first', start: 1_000, end: 1_400 },
    { id: 'second', text: 'second', start: 1_500, end: 1_900 },
  ],
};

assert.equal(isCaptionMotionPreset('karaoke-pulse'), true);
assert.equal(isCaptionMotionPreset('unknown'), false);
assert.deepEqual(captionPageMotionStyle(undefined, page, 1_200), {});
assert.deepEqual(captionPageMotionStyle('none', page, 1_200), {});
assert.deepEqual(captionWordMotionStyle(undefined, page.words[0]!, 1_200), {});

const fadeStart = captionPageMotionStyle('fade-up', page, 1_000);
assert.equal(fadeStart.opacity, 0);
assert.equal(fadeStart.transform, 'translateY(18px)');
const fadeSettled = captionPageMotionStyle('fade-up', page, 1_500);
assert.equal(fadeSettled.opacity, 1);
assert.equal(fadeSettled.transform, 'translateY(0px)');
assert.deepEqual(
  captionPageMotionStyle('fade-up', page, 1_075),
  captionPageMotionStyle('fade-up', page, 1_075),
  'identical timeline milliseconds must produce identical render styles',
);
assert.equal(captionPageMotionStyle('pop', page, page.end).opacity, 0);

const hiddenWord = captionWordMotionStyle('word-pop', page.words[1]!, 1_499);
assert.equal(hiddenWord.opacity, 0);
const enteredWord = captionWordMotionStyle('word-pop', page.words[1]!, 1_700);
assert.equal(enteredWord.opacity, 1);
assert.equal(enteredWord.transform, 'scale(1)');

assert.deepEqual(captionWordMotionStyle('karaoke-pulse', page.words[0]!, 999), {});
assert.equal(captionWordMotionStyle('karaoke-pulse', page.words[0]!, 1_200).transform, 'scale(1.08)');
assert.deepEqual(captionPageMotionStyle('word-pop', page, 1_200), {});

// typewriter: word-level reveal only, page style stays empty
assert.deepEqual(captionPageMotionStyle('typewriter', page, 1_200), {});
const hiddenTyped = captionWordMotionStyle('typewriter', page.words[1]!, 1_499);
assert.equal(hiddenTyped.opacity, 0);
const enteredTyped = captionWordMotionStyle('typewriter', page.words[1]!, 1_700);
assert.equal(enteredTyped.opacity, 1);
assert.equal(enteredTyped.transform, 'scaleX(1)');

// slide-in-word: word-level only, opacity ramps with entry easing
assert.deepEqual(captionPageMotionStyle('slide-in-word', page, 1_200), {});
assert.deepEqual(captionWordMotionStyle('slide-in-word', page.words[1]!, 1_499), { display: 'inline-block', opacity: 0, transform: 'translateY(14px)', transformOrigin: 'center bottom' });
const slideEntered = captionWordMotionStyle('slide-in-word', page.words[1]!, 1_700);
assert.equal(slideEntered.opacity, 1);
assert.equal(slideEntered.transform, 'translateY(0px)');

// bounce-in-page: page-level only, exaggerated scale-in
assert.deepEqual(captionWordMotionStyle('bounce-in-page', page.words[0]!, 1_200), {});
assert.equal(captionPageMotionStyle('bounce-in-page', page, page.end).opacity, 0);
const bounceStart = captionPageMotionStyle('bounce-in-page', page, 1_000);
assert.equal(bounceStart.opacity, 0);
assert.equal(bounceStart.transform, 'scale(0.55)');

// shake-emphasis: word-level only, active only within the word's own window
assert.deepEqual(captionPageMotionStyle('shake-emphasis', page, 1_200), {});
assert.deepEqual(captionWordMotionStyle('shake-emphasis', page.words[0]!, 999), {});
assert.deepEqual(
  captionWordMotionStyle('shake-emphasis', page.words[0]!, 1_100),
  captionWordMotionStyle('shake-emphasis', page.words[0]!, 1_100),
  'identical timeline milliseconds must produce identical shake offsets',
);

console.log('captionMotion.verify: deterministic preview/export motion contract passed');
