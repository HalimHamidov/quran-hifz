export const AUDIO_BASE = 'https://everyayah.com/data/';
export function audioURL(surah, ayah, mode = 'muallim') {
  return `${AUDIO_BASE}${mode === 'murattal' ? 'Husary_128kbps' : 'Husary_Muallim_128kbps'}/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`;
}
export class Recitation {
  constructor(element, onListen, onStatus) {
    this.element = element; this.onListen = onListen; this.onStatus = onStatus;
    this.token = 0; this.timer = null; this.cancelTrack = null;
  }
  stop() {
    this.token++; clearTimeout(this.timer); this.cancelTrack?.(); this.cancelTrack = null;
    this.element.pause(); this.element.removeAttribute('src'); this.element.load();
    this.onStatus('Аудио остановлено.');
  }
  async play(surah, from, to, repeats, pause, speed, mode) {
    this.stop(); const token = this.token;
    this.element.playbackRate = speed; this.element.preservesPitch = true;
    try {
      for (let round = 0; round < repeats; round++) {
        for (let ayah = from; ayah <= to; ayah++) {
          if (token !== this.token) return;
          this.onStatus(`Аль-Хусари · ${surah}:${ayah} · круг ${round + 1}/${repeats}`);
          await this.track(audioURL(surah, ayah, mode), token);
          if (token !== this.token) return;
          this.onListen(`${surah}:${ayah}`);
          await new Promise(resolve => {
            this.cancelTrack = resolve;
            this.timer = setTimeout(resolve, pause * 1000);
          });
        }
      }
      if (token === this.token) this.onStatus('Прослушивание завершено. Теперь повторите самостоятельно.');
    } catch (error) {
      if (token === this.token) { this.element.pause(); this.onStatus(error.message); }
    }
  }
  track(url, token) {
    return new Promise((resolve, reject) => {
      const el = this.element;
      const clean = () => { el.onended = null; el.onerror = null; this.cancelTrack = null; };
      this.cancelTrack = () => { clean(); resolve(); };
      el.onended = () => { clean(); resolve(); };
      el.onerror = () => { clean(); reject(Error('Запись недоступна. Проверьте интернет или выберите Murattal.')); };
      el.src = url; el.load();
      el.play().catch(() => {
        if (token !== this.token) return;
        clean(); reject(Error('Не удалось начать аудио. Нажмите «Слушать» или выберите другую запись.'));
      });
    });
  }
}
