import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {BASMALA} from '../assets/js/arabic.js';
import {sourceWords, languagePoster, sections} from '../assets/js/language-cards.js';

const read = name => JSON.parse(fs.readFileSync(new URL(`../data/${name}.json`, import.meta.url)));
const content = read('al-qalam'), language = read('al-qalam-language'), tajik = read('al-qalam-tajik');
const verses = read('ayahs').surahs['68'];

test('Al-Qalam covers only 68:1–7 with separate illustrations and attributed tafsir', () => {
  assert.equal(content.surah, 68);
  assert.deepEqual(content.cards.map(c=>[c.from,c.to]), Array.from({length:7},(_,i)=>[i+1,i+1]));
  assert.match(content.translationNotice, /Локальный перевод не добавлен/);
  const hashes = content.cards.map(card => {
    assert.ok(card.note && card.hook && card.imageAlt);
    assert.match(card.tafsir.label, /Ас-Саади/);
    assert.equal(card.tafsir.source, 'https://quran-online.ru/68/saadi');
    const bytes=fs.readFileSync(new URL(`../assets/images/${card.image}`,import.meta.url));
    assert.equal(bytes.toString('ascii',0,4),'RIFF');
    assert.equal(bytes.toString('ascii',8,12),'WEBP');
    return createHash('sha256').update(bytes).digest('hex');
  });
  assert.equal(new Set(hashes).size,7);
  assert.match(content.cards[4].tafsir.label,/68:5–6/);
  assert.match(content.cards[5].tafsir.label,/68:5–6/);
});

test('all 33 Quran words have Russian and Tajik lessons with intact canonical spelling', () => {
  assert.deepEqual(language.lessons.map(l=>l.ayah),[1,2,3,4,5,6,7]);
  assert.deepEqual(tajik.lessons.map(l=>l.ayah),[1,2,3,4,5,6,7]);
  let total=0;
  for (const lesson of language.lessons) {
    const verse=verses[lesson.ayah-1], words=sourceWords(verse.text,lesson.ayah,68);
    assert.equal(words.join(' '),lesson.ayah===1?verse.text.slice(BASMALA.length+1):verse.text);
    assert.equal(lesson.words.length,words.length);
    const tg=tajik.lessons[lesson.ayah-1];
    assert.equal(tg.words.length,words.length);
    total+=words.length;
    assert.ok(lesson.grammar.length>=3 && lesson.family.length>=2 && lesson.examples.length>=2);
    assert.ok(lesson.memory && lesson.tajweed.rules.length>=2 && lesson.tajweed.stop);
    for (const w of tg.words) {
      assert.ok(w.text && w.refs.length);
      for (const ref of w.refs) {
        assert.ok(tajik.dictionary[ref].meaning);
        assert.match(tajik.dictionary[ref].source,/^https:\/\/vazhaju\.tj\/word\/[^/]+\/[A-Za-z0-9]+$/);
      }
    }
    for(const bridge of tg.bridges) {
      assert.ok(lesson.words[bridge.wordIndex]);
      if(bridge.kind==='cognate') assert.equal(bridge.root,lesson.words[bridge.wordIndex].root);
      else assert.equal(bridge.root,undefined);
      for(const term of bridge.terms)assert.ok(tajik.dictionary[term].source);
    }
  }
  assert.equal(total,33);
  assert.equal(sourceWords(verses[0].text,1,68)[0],'نٓ');
});

test('all 42 language panels use surah 68, its route and its own sources', () => {
  const data={...language,tajik};
  for(const verse of verses.slice(0,7)) {
    const rendered=[];
    for(const [section] of sections) {
      const html=languagePoster(data,verse,section);
      assert.ok(html.includes(`Арабский язык · 68:${verse.number}`));
      assert.doesNotMatch(html,/undefined|73:|74:|chapter=73|chapter=74/);
      assert.ok(html.includes(section==='tajweed'?data.tajweed.source:`chapter=68&amp;verse=${verse.number}`));
      if(section==='words')for(const word of sourceWords(verse.text,verse.number,68))assert.ok(html.includes(`>${word}</bdi>`));
      if(section==='memory')assert.ok(html.includes(language.memoryRoute));
      rendered.push(html);
    }
    assert.equal(new Set(rendered).size,6);
  }
  assert.throws(()=>languagePoster(data,verses[7]),/не совпадает/);
  assert.match(tajik.dictionary['сатр'].source,/uZn4mZm$/);
  assert.match(tajik.dictionary['ӯ'].source,/uJm0KZm$/);
  assert.match(tajik.dictionary['мамнун'].meaning,/не подходит/);
});
