import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync as read} from 'node:fs';
const html=read('surahs/002-ayat-al-kursi/index.html','utf8');
const original=JSON.parse(read('data/ayahs.json','utf8')).surahs['2'][254].text;
const data=JSON.parse(read('data/ayat-al-kursi-study.json','utf8'));
test('Ayat al-Kursi preserves Tanzil verbatim and all 50 words',()=>{
 assert.ok(html.includes(original));
 const segments=[...html.matchAll(/<p class="arabic" lang="ar" dir="rtl">([^<]+)<\/p>/g)].map(m=>m[1]);
 assert.equal(segments.slice(1,10).join(' '),original);
 assert.equal(data.words.length,50);
 assert.equal([...html.matchAll(/wordmorphology.jsp\?location=\(2:255:/g)].length,50);
});
test('Ayat al-Kursi has six sections, sources and candid draft label',()=>{
 assert.equal([...html.matchAll(/data-tab=/g)].length,6);
 assert.ok(html.includes('не прошли словарную проверку'));
 assert.ok(html.includes('https://quran-online.ru/2/saadi'));
 assert.ok(read('surahs/002-ayat-al-kursi/ayat-al-kursi-a4.pdf').subarray(0,5).equals(Buffer.from('%PDF-')));
 assert.ok(read('service-worker.js','utf8').includes('surahs/002-ayat-al-kursi/index.html'));
});

test('Visual memory cards use three distinct local images and precise fragment links',()=>{
 const files=['sky-earth','permission','learning'];
 files.forEach(f=>assert.ok(read(`assets/images/ayat-al-kursi/${f}.webp`).length>1000));
 [3,4,6].forEach(n=>assert.ok(html.includes(`href="#part-${n}"`)));
 assert.ok(html.includes('id="memory-check"'));
 assert.ok(read('surahs/002-ayat-al-kursi/page.css','utf8').includes('visibility:visible'));
});
