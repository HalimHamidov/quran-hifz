import { record } from './progress.js';
export function nextAyah(state, surah, count) {
  for (let n = 1; n <= count; n++) if (!state.ayahs[`${surah}:${n}`]?.learned) return n;
  return count;
}
export function joinReady(state, surah, ayah) {
  return ayah > 1 && !!state.ayahs[`${surah}:${ayah - 1}`]?.learned && !!state.ayahs[`${surah}:${ayah}`]?.learned;
}
export function addJoin(state, key) { state.joins[key] = Math.min(1000000, (state.joins[key] || 0) + 1); }
export function markError(state, key, today) {
  const r = record(state, key); r.errors++;
  if (r.learned) { r.due = today; r.interval = 0; }
}
