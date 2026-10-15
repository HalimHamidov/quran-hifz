import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=name=>JSON.parse(fs.readFileSync(new URL(`../data/${name}.json`,import.meta.url)));
const alaq=read('al-alaq'),translations=read('translations');
test('Al-Alaq visual cards cover all 19 ayahs once, with two cards per prayer',()=>{
  assert.equal(alaq.surah,96);assert.equal(alaq.cards.length,10);assert.equal(alaq.notes.length,19);
  const covered=alaq.cards.flatMap(card=>Array.from({length:card.to-card.from+1},(_,i)=>card.from+i));
  assert.deepEqual(covered,Array.from({length:19},(_,i)=>i+1));
  assert.deepEqual([...new Set(alaq.cards.map(c=>c.prayer))],['Фаджр','Зухр','Аср','Магриб','Иша']);
  for(const prayer of new Set(alaq.cards.map(c=>c.prayer)))assert.equal(alaq.cards.filter(c=>c.prayer===prayer).length,2);
  for(const file of Object.values(alaq.illustrations))assert.ok(fs.existsSync(new URL(`../assets/images/${file}`,import.meta.url)));
  for(const card of alaq.cards){assert.ok(card.title&&card.keyword&&card.hook);assert.ok(alaq.notes.slice(card.from-1,card.to).every(Boolean));}
});
test('Al-Alaq visual page and main reader use the same editorial source',()=>{
  assert.deepEqual(translations.surahs['96'].notes,alaq.notes);
  assert.equal(translations.surahs['96'].url,alaq.translationURL);
  assert.deepEqual(translations.surahs['96'].blocks.map(b=>[b.from,b.to]),alaq.cards.map(c=>[c.from,c.to]));
  assert.equal(new URL(alaq.historyURL).hostname,'sunnah.com');
});
