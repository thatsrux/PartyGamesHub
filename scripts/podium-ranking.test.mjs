import assert from 'node:assert/strict';
import test from 'node:test';
import { splitFinalStandings } from '../src/utils/ranking.ts';

test('the first three players go to the podium and every other player remains listed', () => {
  const players = Object.fromEntries(Array.from({ length: 8 }, (_, index) => [`p${index}`, { name: `Player ${index}`, score: 80 - index * 10 }]));
  const { podium, others } = splitFinalStandings(players);
  assert.deepEqual(podium.map(player => player.name), ['Player 0', 'Player 1', 'Player 2']);
  assert.deepEqual(others.map(player => player.name), ['Player 3', 'Player 4', 'Player 5', 'Player 6', 'Player 7']);
  assert.equal(new Set([...podium, ...others].map(player => player.id)).size, 8);
});

test('explicit final points override stale player scores', () => {
  const players = { a: { name: 'Ada', score: 10 }, b: { name: 'Bruno', score: 20 } };
  const { podium } = splitFinalStandings(players, { a: 100, b: 50 });
  assert.deepEqual(podium.map(player => player.name), ['Ada', 'Bruno']);
});
