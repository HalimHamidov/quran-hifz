import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const read = path => fs.readFileSync(new URL(path, root));
const content = JSON.parse(read('data/al-muzzammil.json'));

test('Al-Muzzammil illustrates exactly ayahs 1–5 with five distinct WebP assets', () => {
  assert.equal(content.surah, 73);
  assert.deepEqual(content.cards.map(card => [card.from, card.to]), [[1,1],[2,2],[3,3],[4,4],[5,5]]);
  const hashes = content.cards.map(card => {
    assert.ok(card.imageAlt && card.note && card.hook);
    const image = read(`assets/images/${card.image}`);
    assert.equal(image.toString('ascii', 0, 4), 'RIFF');
    assert.equal(image.toString('ascii', 8, 12), 'WEBP');
    return createHash('sha256').update(image).digest('hex');
  });
  assert.equal(new Set(hashes).size, 5);
});

test('offline installation includes all five cards and every precached file exists', () => {
  let core;
  const script = read('service-worker.js').toString() + '\nglobalThis.core = CORE;';
  const context = { self: { addEventListener() {} } };
  vm.runInNewContext(script, context);
  core = Array.from(context.core);
  for (const path of core) {
    const clean = path.split('?')[0];
    assert.ok(fs.existsSync(new URL(clean, root)), `Missing precache file: ${path}`);
  }
  assert.ok(core.includes('surahs/073-al-muzzammil/'));
  assert.ok(core.includes('data/al-muzzammil.json'));
  for (const card of content.cards) assert.ok(core.includes(`assets/images/${card.image}`));
});
