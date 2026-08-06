import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProfile, selectNewestProfile } from '../src/utils/profileStorage.ts';
import { mergePlayerSession } from '../src/utils/playerSession.ts';

test('normalizza un profilo valido e limita il nickname', () => {
  const profile = normalizeProfile({
    name: '  Un nickname davvero troppo lungo  ',
    photo: 'data:image/png;base64,AAAA',
    gameSettings: { quiz4: { rounds: 8 } },
    updatedAt: 42,
  });

  assert.equal(profile?.name, 'Un nickname dav');
  assert.equal(profile?.photo, 'data:image/png;base64,AAAA');
  assert.deepEqual(profile?.gameSettings, { quiz4: { rounds: 8 } });
  assert.equal(profile?.updatedAt, 42);
});

test('rifiuta profili corrotti e immagini non data-url', () => {
  assert.equal(normalizeProfile(null), null);
  assert.equal(normalizeProfile({ name: '   ' }), null);
  assert.deepEqual(normalizeProfile({ name: 'Ada', photo: 'javascript:alert(1)' }), { name: 'Ada' });
});

test('mantiene esplicitamente la rimozione della foto', () => {
  assert.deepEqual(normalizeProfile({ name: 'Ada', photo: null }), { name: 'Ada', photo: null });
});

test('sceglie la copia più recente tra dispositivo e cloud', () => {
  const local = { name: 'Locale', updatedAt: 200 };
  const remote = { name: 'Cloud', updatedAt: 100 };
  assert.equal(selectNewestProfile(local, remote), local);
  assert.equal(selectNewestProfile(remote, local), local);
  assert.equal(selectNewestProfile(local, null), local);
});

test('crea una nuova sessione giocatore con valori sicuri', () => {
  assert.deepEqual(
    mergePlayerSession(null, { name: '  Ada  ', photo: null, isAdmin: false }, 1000),
    { name: 'Ada', photo: null, score: 0, isReady: true, isAdmin: false, joinedAt: 1000 },
  );
});

test('il rientro aggiorna il profilo senza azzerare partita o ruolo', () => {
  const current = {
    name: 'Vecchio',
    photo: 'data:image/png;base64,OLD',
    score: 730,
    isReady: false,
    isAdmin: true,
    joinedAt: 123,
    customGameFlag: 'keep',
  };
  const merged = mergePlayerSession(current, { name: 'Nuovo', photo: null, isAdmin: false }, 999);

  assert.equal(merged.name, 'Nuovo');
  assert.equal(merged.photo, null);
  assert.equal(merged.score, 730);
  assert.equal(merged.isAdmin, true);
  assert.equal(merged.joinedAt, 123);
  assert.equal(merged.isReady, true);
  assert.equal(merged.customGameFlag, 'keep');
});
