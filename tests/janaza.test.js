import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const read = file => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const topic = read('topics/janaza/index.html');

test('Tajik topic preserves the three plaque sections, four takbirs and ten advice pairs', () => {
  assert.match(topic, /<html lang="tg">/);
  for (const id of ['khok','janaza','pand']) {
    assert.match(topic, new RegExp('href="#' + id + '"'));
    assert.match(topic, new RegExp('id="' + id + '"'));
  }
  assert.equal((topic.match(/class="takbir"/g) ?? []).length, 4);
  assert.equal((topic.split('class="pairs"')[1].split('</ol>')[0].match(/<li>/g) ?? []).length, 10);
  assert.match(topic, /Илмро/);
  assert.match(topic, /Саховатро/);
  assert.match(topic, /Дуо барои кӯдаки норасида/);
});

test('Tajik topic uses the exact repository ayah, local art, and safe external source links', () => {
  const ayah = JSON.parse(read('data/ayahs.json')).surahs['20'].find(a => a.number === 55).text;
  assert.ok(topic.includes(ayah));
  for (const match of topic.matchAll(/<a href="https:[^>]+>/g)) {
    assert.match(match[0], /target="_blank" rel="noopener noreferrer"/);
  }
  for (const file of ['janaza-cover.webp','plaque-khok.jpg','plaque-prayer.jpg','plaque-advice.jpg']) {
    assert.ok(topic.includes('/janaza/' + file));
    assert.ok(existsSync(new URL('../assets/images/janaza/' + file, import.meta.url)));
    assert.ok(read('service-worker.js').includes('/janaza/' + file));
  }
  assert.match(read('index.html'), /href="topics\/janaza\/"/);
  assert.match(read('assets/js/app.js'), /href="topics\/janaza\/"/);
  assert.match(read('service-worker.js'), /'topics\/janaza\/page.css\?v=1.0.0.34'/);
});
