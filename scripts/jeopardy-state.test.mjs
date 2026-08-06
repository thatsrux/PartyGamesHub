import assert from 'node:assert/strict';
import test from 'node:test';
import { completeJeopardyCell, openJeopardyCell } from '../src/games/Jeopardy/jeopardyState.ts';

const questionObj = { question: 'Domanda di prova?', answer: 'Risposta' };

test('una domanda nuova si apre senza mostrare subito la risposta', () => {
  const result = openJeopardyCell([], 'Sport', 300, questionObj);
  assert.equal(result.phase, 'question');
  assert.equal(result.currentCell.reopened, false);
});

test('una domanda completata si riapre con risposta e controlli punti', () => {
  const result = openJeopardyCell(['Sport-300'], 'Sport', 300, questionObj);
  assert.equal(result.phase, 'reveal');
  assert.equal(result.currentCell.reopened, true);
});

test('tornare al tabellone non duplica una cella già completata', () => {
  const currentCell = openJeopardyCell(['Sport-300'], 'Sport', 300, questionObj).currentCell;
  assert.deepEqual(completeJeopardyCell(['Sport-300'], currentCell), ['Sport-300']);
});
