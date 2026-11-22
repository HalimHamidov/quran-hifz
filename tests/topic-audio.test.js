import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => readFileSync(new URL('../'+p, import.meta.url), 'utf8');
test('Arabic topics provide three correct on-demand audio players and preserve source distinction', () => {
  const janaza = read('topics/janaza/index.html');
  const kursi = read('surahs/002-ayat-al-kursi/index.html');
  const players = [janaza,kursi].flatMap(page => [...page.matchAll(/<audio\b([^>]*)><source type="audio\/mpeg" src="([^"]+)"><\/audio>/g)]);
  assert.equal(players.length,3);
  for (const [,attrs] of players) {
    assert.match(attrs,/\bcontrols\b/);
    assert.match(attrs,/preload="none"/);
    assert.doesNotMatch(attrs,/autoplay/);
  }
  assert.deepEqual(players.map(m=>m[2]), [
    'https://everyayah.com/data/Husary_Muallim_128kbps/020055.mp3',
    'https://static.lifewithallah.com/file/LifeWithAllah/other/37-Death/534.mp3',
    'https://everyayah.com/data/Husary_Muallim_128kbps/002255.mp3'
  ]);
  assert.match(janaza,/Поёни ин сабт аз поёни лавҳа фарқ мекунад/);
});
