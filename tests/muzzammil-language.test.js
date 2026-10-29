import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BASMALA } from '../assets/js/arabic.js';
import { languagePoster, sourceWords, sections } from '../surahs/073-al-muzzammil/language.js';

const read = name => JSON.parse(fs.readFileSync(new URL(`../data/${name}.json`, import.meta.url)));
const data = read('al-muzzammil-language');
const verses = read('ayahs').surahs['73'];

test('73:1–5 word lessons cover the canonical words exactly, excluding only the opening basmala', () => {
  assert.equal(data.surah, 73);
  assert.deepEqual(data.range, [1, 5]);
  assert.deepEqual(data.lessons.map(lesson => lesson.ayah), [1, 2, 3, 4, 5]);
  for (const lesson of data.lessons) {
    const verse = verses[lesson.ayah - 1];
    const expected = lesson.ayah === 1 ? verse.text.slice(BASMALA.length + 1) : verse.text;
    const words = sourceWords(verse.text, lesson.ayah);
    assert.equal(words.join(' '), expected);
    assert.equal(lesson.words.length, words.length);
    const html = languagePoster(data, verse);
    for (const [index, word] of words.entries()) {
      assert.ok(html.includes(`>${word}</bdi>`));
      assert.ok(html.includes(`location=(73:${lesson.ayah}:${index + 1})`));
      assert.ok(lesson.words[index].meaning && lesson.words[index].grammar && lesson.words[index].parts);
    }
    assert.ok(lesson.grammar.length && lesson.family.length && lesson.examples.length && lesson.memory);
    assert.ok(lesson.tajweed.rules.length && lesson.tajweed.stop);
  }
});

test('all six sections render for all five ayahs and retain their correct source references', () => {
  assert.equal(sections.length, 6);
  for (const verse of verses.slice(0, 5)) {
    const rendered = sections.map(([section]) => {
      const html = languagePoster(data, verse, section);
      assert.match(html, new RegExp(`Арабский язык · 73:${verse.number}`));
      assert.ok(html.includes(`data-lesson-tab="${section}" aria-pressed="true"`));
      assert.ok(html.includes(section === 'tajweed' ? data.tajweed.source : `chapter=73&amp;verse=${verse.number}`));
      assert.doesNotMatch(html, /undefined|74:/);
      return html;
    });
    assert.equal(new Set(rendered).size, 6);
  }
  assert.throws(() => languagePoster(data, verses[5]), /не совпадает/);
});

test('lesson metadata is escaped and verse boundaries cannot silently lose a word', () => {
  const modified = structuredClone(data);
  modified.lessons[0].words[0].meaning = '<img src=x onerror=alert(1)>';
  assert.ok(languagePoster(modified, verses[0]).includes('&lt;img'));
  assert.ok(!languagePoster(modified, verses[0]).includes('<img'));
  modified.lessons[0].words.pop();
  assert.throws(() => languagePoster(modified, verses[0]), /не совпадает/);
});
