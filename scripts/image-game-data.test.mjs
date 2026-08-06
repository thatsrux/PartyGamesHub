import assert from 'node:assert/strict';
import test from 'node:test';
import { indovinaImmagineQuestions } from '../src/games/IndovinaImmagine/data.ts';
import { getImageRevealStyle } from '../src/games/IndovinaImmagine/imageReveal.ts';

test('the curated image pool stays large, unique and free of known impossible answers', () => {
  assert.ok(indovinaImmagineQuestions.length >= 120);
  const blocked = ['francesco de gregori', 'de gregori', 'prosciutto', 'uluru', 'uluṟu'];
  const primaryAnswers = indovinaImmagineQuestions.map(question => question.answers[0].toLocaleLowerCase('it'));
  assert.equal(new Set(primaryAnswers).size, primaryAnswers.length);
  for (const answer of primaryAnswers) assert.ok(!blocked.includes(answer), `${answer} should not be in the pool`);
  for (const question of indovinaImmagineQuestions) {
    assert.match(question.imageUrl, /^https:\/\//);
    assert.ok(question.answers.length > 0);
  }
});

test('short rounds deblur faster while every duration finishes fully clear', () => {
  const shortRound = getImageRevealStyle(5_000, 10_000);
  const longRound = getImageRevealStyle(5_000, 30_000);
  assert.ok(shortRound.blurPx < longRound.blurPx);
  assert.ok(shortRound.brightness > longRound.brightness);
  assert.equal(getImageRevealStyle(10_000, 10_000).blurPx, 0);
  assert.equal(getImageRevealStyle(60_000, 10_000).progress, 1);
});
