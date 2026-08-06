import assert from 'node:assert/strict';
import test from 'node:test';
import { jeopardyCategories } from '../src/games/Jeopardy/data.ts';

const values = [100, 200, 300, 400, 500];
const englishQuestionStart = /^(?:in (?:which|basketball|tennis)|which|what|who|where|when|how|this|these|the)\b/i;
const untranslatedSportAnswers = new Set([
  'American Football', 'Basketball', 'Ice Hockey', 'Swimming', 'Rowing', 'Cycling',
  'Table Tennis', 'Volleyball', 'Sailing', 'Soccer', 'Surfing', 'Hammer throw',
  'Rifle shooting', 'United States', 'United Kingdom', 'New Zealand', 'South Africa',
  'South Korea', 'Southeast Asia', 'Netherlands', 'Norway', 'Thailand', 'Brazil',
  'England', 'Scotland', 'Black', 'Yellow', 'One', 'Two', 'Four', 'Six', 'Nine',
]);

test('il database Jeopardy conserva 65 domande per categoria e difficoltà', () => {
  assert.equal(jeopardyCategories.length, 10);
  for (const category of jeopardyCategories) {
    for (const value of values) {
      assert.equal(category.questions[value].length, 65, `${category.name} ${value}`);
      for (const item of category.questions[value]) {
        assert.ok(item.question.trim(), `${category.name} ${value}: domanda vuota`);
        assert.ok(item.answer.trim(), `${category.name} ${value}: risposta vuota`);
      }
    }
  }
});

test('nessuna domanda conserva un incipit interamente inglese', () => {
  for (const category of jeopardyCategories) {
    for (const value of values) {
      for (const item of category.questions[value]) {
        assert.doesNotMatch(item.question, englishQuestionStart, `${category.name} ${value}: ${item.question}`);
      }
    }
  }
});

test('tutte le 325 risposte Sport escludono le localizzazioni inglesi note', () => {
  const sport = jeopardyCategories.find((category) => category.name === 'Sport');
  assert.ok(sport);
  const questions = values.flatMap((value) => sport.questions[value]);
  assert.equal(questions.length, 325);
  for (const item of questions) {
    assert.equal(untranslatedSportAnswers.has(item.answer), false, `${item.question} => ${item.answer}`);
  }
});
