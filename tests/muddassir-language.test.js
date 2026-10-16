import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {splitBasmala} from '../assets/js/arabic.js';
const read=name=>JSON.parse(fs.readFileSync(new URL(`../data/${name}.json`,import.meta.url)));
test('language lessons cover every source word of 74:1–10 once, with separate original MSA examples',()=>{
  const content=read('al-muddassir-language'),texts=read('ayahs').surahs['74'];
  assert.equal(content.surah,74);
  assert.deepEqual(content.lessons.map(l=>l.ayah),Array.from({length:10},(_,i)=>i+1));
  assert.match(content.notice,/не перевод Шамиля/);
  assert.match(content.register,/фусха/);
  for(const lesson of content.lessons){
    const body=splitBasmala(texts[lesson.ayah-1].text,74,lesson.ayah).verse;
    assert.deepEqual(lesson.words.map(w=>w.arabic),body.split(/\s+/));
    assert.ok(lesson.grammar.length>=3&&lesson.family.length>=3&&lesson.examples.length>=2);
    for(const [i,word] of lesson.words.entries()){
      assert.ok(word.meaning&&word.parts&&word.grammar);
      assert.equal(new URL(word.source).hostname,'corpus.quran.com');
      assert.ok(word.source.endsWith(`(74:${lesson.ayah}:${i+1})`));
    }
    for(const example of lesson.examples)assert.ok(example.arabic&&example.meaning&&example.connection&&example.extra);
    assert.ok(lesson.nuance);
  }
});
