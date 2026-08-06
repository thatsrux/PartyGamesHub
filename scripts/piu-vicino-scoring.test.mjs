import assert from 'node:assert/strict';
import test from 'node:test';
import { calculatePiuVicinoScore } from '../src/games/PiuVicinoVince/scoring.ts';

test('closer valid answers stay ahead throughout the useful scoring range', () => {
  const distances = [1, 5, 10, 20, 35, 50];
  const scores = distances.map((distance) => calculatePiuVicinoScore(50 + distance, 50, 0, 100));
  for (let index = 1; index < scores.length; index += 1) {
    assert.ok(scores[index - 1] > scores[index], `${scores[index - 1]} should be greater than ${scores[index]}`);
  }
});

test('valid distant answers receive a consolation score instead of zero', () => {
  assert.equal(calculatePiuVicinoScore(100, 0, 0, 100), 5);
  assert.equal(calculatePiuVicinoScore(1000, 0, 0, 100), 5);
});

test('the softened curve remains selective', () => {
  assert.equal(calculatePiuVicinoScore(60, 50, 0, 100), 89);
  assert.equal(calculatePiuVicinoScore(75, 50, 0, 100), 47);
  assert.equal(calculatePiuVicinoScore(100, 50, 0, 100), 5);
});

test('an exact answer keeps the special bonus', () => {
  assert.equal(calculatePiuVicinoScore(50, 50, 0, 100), 600);
});

test('invalid input is ignored safely', () => {
  assert.equal(calculatePiuVicinoScore(Number.NaN, 50, 0, 100), 0);
});
