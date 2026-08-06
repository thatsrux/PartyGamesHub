import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { isCareerAnswerCorrect, searchableNames } from '../src/games/LaCarriera/careerMatching.ts';

const database = JSON.parse(fs.readFileSync(new URL('../src/data/footballers.json', import.meta.url), 'utf8'));

test('ogni giocatore accetta nome completo, cognome/mononimo e tutti gli alias', () => {
  for (const player of database.players) {
    for (const answer of searchableNames(player)) {
      assert.equal(isCareerAnswerCorrect(player, answer), true, `${player.name} non accetta “${answer}”`);
    }
  }
});

test('la selezione autocomplete è esatta e non dipende da accenti o fuzzy matching', () => {
  for (const player of database.players) {
    assert.equal(isCareerAnswerCorrect(player, player.name, player.id), true, player.name);
    assert.equal(isCareerAnswerCorrect(player, player.name, `${player.id}-errato`), false, player.name);
  }
});

test('i casi segnalati sono riconosciuti anche senza accenti', () => {
  const zlatan = database.players.find((player) => player.id === 'zlatan-ibrahimovic');
  const pique = database.players.find((player) => player.id === 'gerard-pique');
  assert.equal(isCareerAnswerCorrect(zlatan, 'Ibrahimovic'), true);
  assert.equal(isCareerAnswerCorrect(zlatan, 'Zlatan Ibrahimovic'), true);
  assert.equal(isCareerAnswerCorrect(pique, 'Pique'), true);
  assert.equal(isCareerAnswerCorrect(pique, 'Gerard Pique'), true);
});
