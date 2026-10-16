import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const read=name=>JSON.parse(fs.readFileSync(new URL(`../data/${name}.json`,import.meta.url)));
test('Al-Muddassir covers exactly 74:1–10 with distinct images and preserves Umma 8–9 range',()=>{
  const content=read('al-muddassir'),tafsir=read('al-muddassir-tafsir'),plan=read('al-muddassir-visual-plan');
  const numbers=Array.from({length:10},(_,i)=>i+1);
  assert.equal(content.surah,74);
  assert.deepEqual(content.cards.map(c=>c.from),numbers);
  assert.ok(content.cards.every(c=>c.from===c.to));
  assert.deepEqual(tafsir.entries.flatMap(e=>Array.from({length:e.to-e.from+1},(_,i)=>e.from+i)),numbers);
  assert.ok(tafsir.entries.some(e=>e.from===8&&e.to===9));
  assert.equal(tafsir.source,content.translationURL);
  assert.equal(new URL(tafsir.source).hostname,'umma.ru');
  assert.deepEqual(plan.prompts.map(p=>p.ayah),numbers);
  const hashes=content.cards.map(card=>{
    const bytes=fs.readFileSync(new URL(`../assets/images/${card.image}`,import.meta.url));
    assert.equal(bytes.toString('ascii',8,12),'WEBP');
    return createHash('sha256').update(bytes).digest('hex');
  });
  assert.equal(new Set(hashes).size,10);
});
