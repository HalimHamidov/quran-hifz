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

test('tajweed notes reference exact source fragments and distinguish joining from stopping',()=>{
  const content=read('al-muddassir-language');
  assert.match(content.tajweed.reading,/Хафс/);
  assert.equal(content.tajweed.reference.length,4);
  assert.match(content.tajweed.reference[3].text,/нет/);
  for(const lesson of content.lessons){
    assert.equal(lesson.tajweed.rules.length,2);
    for(const rule of lesson.tajweed.rules){
      assert.ok(lesson.words[rule.wordIndex].arabic.includes(rule.highlight),`74:${lesson.ayah} exact highlighted fragment`);
      assert.ok(rule.name&&rule.text);
    }
    assert.ok(lesson.tajweed.stop);
  }
  assert.match(content.lessons[5].tajweed.rules[1].text,/слитном/);
  assert.match(content.lessons[8].tajweed.rules[0].name,/Идгам/);
  assert.match(content.lessons[8].tajweed.rules[1].name,/Изхар/);
  assert.match(content.lessons[6].tajweed.rules[1].text,/без калькаля/);
});

test('mnemonics follow all ten ayahs and anchor every word without claiming Tajik pronunciation',()=>{
  const content=read('al-muddassir-language');
  assert.deepEqual(content.memory.route.map(step=>step.ayah),content.lessons.map(l=>l.ayah));
  assert.match(content.memory.scope,/1–10 из 56/);
  assert.match(content.memory.notice,/не транскрипция/);
  for(const lesson of content.lessons){
    assert.ok(lesson.mnemonic.scene&&lesson.mnemonic.tajik&&lesson.mnemonic.tajikMeaning);
    assert.deepEqual(lesson.mnemonic.anchors.map(a=>a.wordIndex),lesson.words.map((_,i)=>i));
    assert.ok(lesson.mnemonic.anchors.every(a=>a.cue));
  }
});

test('Tajik mnemonics prefer attested Arabic loans and explain differences in form',()=>{
  const {lessons}=read('al-muddassir-language');
  assert.match(lessons[2].mnemonic.tajik,/Рабб.*кабир.*такбир/);
  assert.match(lessons[3].mnemonic.tajik,/тоҳир.*таҳорат/);
  assert.match(lessons[3].mnemonic.bridgeNote,/формы разные/);
  assert.match(lessons[7].mnemonic.bridgeNote,/не барабан/);
  assert.match(lessons[8].mnemonic.tajik,/явм.*асир/);
  assert.match(lessons[9].mnemonic.tajik,/ғайр.*ясир/);
  assert.match(lessons[9].mnemonic.bridgeNote,/يسير.*лёгкий.*нелёгкий.*عسير/);
  assert.match(lessons[8].mnemonic.bridgeNote,/عسير.*трудный.*أسير.*пленник/);
  for(const {mnemonic:m} of lessons){
    assert.ok(m.bridgeLabel&&m.bridgeNote);
    if(m.bridgeSource)assert.equal(new URL(m.bridgeSource).protocol,'https:');
  }
});

test('74:3 tajweed explicitly annotates fakabbir rather than duplicating rabbaka',()=>{
  const lesson=read('al-muddassir-language').lessons[2],rule=lesson.tajweed.rules[1];
  assert.equal(rule.wordIndex,1);
  assert.equal(lesson.words[rule.wordIndex].arabic,'فَكَبِّرْ');
  assert.equal(rule.highlight,'بِّ');
  assert.match(rule.text,/без гунны/);
  assert.match(rule.text,/Мадда здесь нет/);
});
