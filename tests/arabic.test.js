import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {BASMALA, splitBasmala, arabicHTML} from '../assets/js/arabic.js';

test('opening basmala is separate in all 112 applicable surahs, preserving every character', () => {
  const {surahs} = JSON.parse(fs.readFileSync(new URL('../data/ayahs.json', import.meta.url)));
  let separated = 0;
  for (const [surah, verses] of Object.entries(surahs)) {
    for (const {number, text} of verses) {
      const result = splitBasmala(text, surah, number);
      if (number === 1 && ![1, 9].includes(Number(surah))) {
        assert.ok([BASMALA, BASMALA.replace('بِ', 'بِّ')].includes(result.basmala));
        assert.equal(`${result.basmala} ${result.verse}`, text);
        assert.ok(!result.verse.startsWith(BASMALA));
        separated++;
      } else {
        assert.deepEqual(result, {basmala: '', verse: text});
      }
    }
  }
  assert.equal(separated, 112);
});

test('basmala and ayah have separate block elements; Fatiha and Tawba retain their ayahs', () => {
  const escape = value => value;
  assert.match(arabicHTML(`${BASMALA} النص`, 96, 1, escape), /class="basmala".*display:block.*<\/span><span class="ayah-body"/);
  assert.equal(arabicHTML(BASMALA, 1, 1, escape), BASMALA);
  assert.equal(arabicHTML('براءة', 9, 1, escape), 'براءة');
});

test('readable Al-Muddassir rendering preserves all letters and marks, scoped to 1–10',()=>{
  const {surahs}=JSON.parse(fs.readFileSync(new URL('../data/ayahs.json',import.meta.url)));
  for(const {number,text} of surahs['74']){
    const html=arabicHTML(text,74,number,value=>value);
    assert.equal(html.includes('class="quran-readable"'),number<=10);
    const rendered=html.replace(/<\/span><span class="ayah-body"[^>]*>/,' ').replace(/<[^>]*>/g,'');
    assert.equal(rendered,text,`74:${number} characters unchanged`);
  }
  assert.ok(!arabicHTML('النص',96,2,value=>value).includes('quran-readable'));
});
