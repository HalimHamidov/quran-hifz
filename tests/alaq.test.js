import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const read=name=>JSON.parse(fs.readFileSync(new URL(`../data/${name}.json`,import.meta.url)));
const alaq=read('al-alaq'),translations=read('translations');
test('Al-Alaq has one unique generated image per ayah, covering all 19 ayahs once',()=>{
  assert.equal(alaq.surah,96);assert.equal(alaq.cards.length,19);assert.equal(alaq.notes.length,19);
  const covered=alaq.cards.flatMap(card=>Array.from({length:card.to-card.from+1},(_,i)=>card.from+i));
  assert.deepEqual(covered,Array.from({length:19},(_,i)=>i+1));
  assert.deepEqual([...new Set(alaq.cards.map(c=>c.prayer))],['Фаджр','Зухр','Аср','Магриб','Иша']);
  const hashes=new Set();
  for(const card of alaq.cards){
    assert.equal(card.from,card.to);assert.ok(card.title&&card.keyword&&card.hook&&card.imageAlt);
    const image=fs.readFileSync(new URL(`../assets/images/${card.image}`,import.meta.url));
    assert.equal(image.toString('ascii',8,12),'WEBP');
    hashes.add(createHash('sha256').update(image).digest('hex'));
  }
  assert.equal(hashes.size,19,'Every ayah needs its own image, not repeated backgrounds');
});

test('user-provided Umma translation covers every ayah, preserving combined source ranges',()=>{
  const translation=read('al-alaq-translation'),plan=read('al-alaq-visual-plan');
  assert.equal(translation.source,alaq.translationURL);assert.equal(translation.author,'Шамиль Аляутдинов');
  assert.deepEqual(translation.entries.flatMap(item=>Array.from({length:item.to-item.from+1},(_,i)=>item.from+i)),Array.from({length:19},(_,i)=>i+1));
  assert.ok(translation.entries.some(item=>item.from===9&&item.to===10));
  assert.ok(translation.entries.some(item=>item.from===11&&item.to===12));
  for(const entry of translation.entries){assert.equal(entry.status,'user-provided');assert.ok(entry.text.trim());assert.ok(!entry.text.includes('svg'));}
  assert.ok(translation.basmala.startsWith('Именем Аллаха'));
  assert.ok(translation.entries.find(entry=>entry.from===5).footnoteURL.endsWith('#sdfootnote_5865_1_sym'));
  assert.ok(translation.entries.find(entry=>entry.from===19).footnoteURL.endsWith('#sdfootnote_5877_1_sym'));
  assert.deepEqual(plan.prompts.map(item=>item.ayah),Array.from({length:19},(_,i)=>i+1));
  assert.equal(new Set(plan.prompts.map(item=>item.prompt)).size,19);
});
test('Al-Alaq visual page and main reader use the same editorial source',()=>{
  assert.deepEqual(translations.surahs['96'].notes,alaq.notes);
  assert.equal(translations.surahs['96'].url,alaq.translationURL);
  assert.deepEqual(translations.surahs['96'].blocks.map(b=>[b.from,b.to]),alaq.cards.map(c=>[c.from,c.to]));
  assert.equal(new URL(alaq.historyURL).hostname,'sunnah.com');
});
