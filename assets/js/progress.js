import { validateParts } from './parts.js';
export const KEY = 'quran-hifz:v1';
export const DAY = 86400000;
export function dayKey(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
export function dayNumber(date = dayKey()) {
  const [y, m, d] = date.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / DAY);
}
export function dateAfter(date, days) {
  return new Date((dayNumber(date) + days) * DAY).toISOString().slice(0, 10);
}
export function freshState() {
  return { version: 1, settings: { target: 100, joinTarget: 20, cycle: 7, paused: false,
    startDate: dayKey(), reviewAnchor: dayKey(), currentSurah: 74, currentAyah: 1, minutes: 15 },
    ayahs: {}, joins: {}, reviewLog: {}, reviewAssignments: {}, reviewTotals: {}, activity: {}, partPlans: {} };
}
export function record(state, key) {
  return state.ayahs[key] ||= { reads: 0, listens: 0, errors: 0, learned: false, verifiedAt: null,
    due: null, interval: 0, reviews: 0 };
}
const integer = (n, min, max) => Number.isSafeInteger(n) && n >= min && n <= max;
const isDate = d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) &&
  Number.isFinite(dayNumber(d)) && new Date(dayNumber(d) * DAY).toISOString().slice(0, 10) === d;
export function validateState(value, surahs, texts) {
  const object = v => !!v && typeof v === 'object' && !Array.isArray(v);
  if (!object(value) || value.version !== 1 ||
      !['settings','ayahs','joins','reviewLog','activity'].every(k=>object(value[k])) ||
      (value.partPlans !== undefined && !object(value.partPlans)) ||
      (value.reviewAssignments !== undefined && !object(value.reviewAssignments)) ||
      (value.reviewTotals !== undefined && !object(value.reviewTotals))) throw Error('Неподдерживаемый формат резервной копии.');
  const s = value.settings;
  if (!integer(s.target, 1, 10000) || !integer(s.joinTarget, 1, 10000) || !integer(s.cycle, 1, 365) ||
      !integer(s.minutes, 1, 240) || typeof s.paused !== 'boolean' || !isDate(s.startDate) ||
      !isDate(s.reviewAnchor) || !integer(s.currentSurah, 1, 114) ||
      !integer(s.currentAyah, 1, surahs[s.currentSurah - 1].count)) throw Error('Неверные настройки.');
  const validKey = key => {
    const match = /^(\d{1,3}):(\d{1,3})$/.exec(key);
    return !!match && integer(+match[1], 1, 114) && integer(+match[2], 1, surahs[+match[1] - 1].count);
  };
  const clean = freshState();
  clean.settings = Object.fromEntries(Object.keys(clean.settings).map(k => [k, s[k]]));
  for (const [key, r] of Object.entries(value.ayahs)) {
    if (!validKey(key) || !r || !['reads', 'listens', 'errors', 'reviews', 'interval'].every(k => integer(r[k], 0, 1000000)) ||
        r.interval > 5 || typeof r.learned !== 'boolean' ||
        (r.verifiedAt !== null && !isDate(r.verifiedAt)) || (r.due !== null && !isDate(r.due)) ||
        (r.learned && (!r.verifiedAt || !r.due))) throw Error('Неверный прогресс аятов.');
    clean.ayahs[key] = Object.fromEntries(['reads', 'listens', 'errors', 'learned', 'verifiedAt', 'due', 'interval', 'reviews'].map(k => [k, r[k]]));
  }
  for (const [key, n] of Object.entries(value.joins)) {
    if (!validKey(key) || !integer(n, 0, 1000000) || key.endsWith(':1')) throw Error('Неверные соединения.');
    clean.joins[key] = n;
  }
  for (const [date, keys] of Object.entries(value.reviewLog)) {
    if (!isDate(date) || !Array.isArray(keys) || !keys.every(validKey)) throw Error('Неверный журнал повторений.');
    clean.reviewLog[date] = [...new Set(keys)];
  }
  for(const [date,keys] of Object.entries(value.reviewAssignments || {})) {
    if(!isDate(date)||!Array.isArray(keys)||!keys.every(validKey))throw Error('Неверные дневные задания.');
    clean.reviewAssignments[date]=[...new Set(keys)];
  }
  for(const [date,count] of Object.entries(value.reviewTotals || {})) {
    if(!isDate(date)||!integer(count,0,6236))throw Error('Неверная статистика повторений.');
    clean.reviewTotals[date]=count;
  }
  for(const [date,keys] of Object.entries(clean.reviewLog))clean.reviewTotals[date]=keys.length;
  for (const [date, n] of Object.entries(value.activity)) {
    if (!isDate(date) || !integer(n, 0, 1000000)) throw Error('Неверный журнал занятий.');
    clean.activity[date] = n;
  }
  for(const [key,plan] of Object.entries(value.partPlans || {})) {
    const [s,a]=key.split(':').map(Number);
    if(!validKey(key)||!texts||!validateParts(plan,texts[s][a-1].text)||!isDate(plan.approvedAt))throw Error('Неверные проверенные части аята.');
    clean.partPlans[key]={parts:plan.parts.map(p=>({start:p.start,end:p.end,reads:p.reads})),joined:plan.joined,approvedAt:plan.approvedAt};
  }
  return clean;
}
export function load(storage, surahs, texts) {
  const raw = storage.getItem(KEY);
  return raw ? validateState(JSON.parse(raw), surahs, texts) : freshState();
}
export function compactHistory(state, today = dayKey()) {
  state.reviewTotals ||= {};
  for(const [date,keys] of Object.entries(state.reviewLog)) {
    state.reviewTotals[date]=keys.length;
    if(dayNumber(date)<dayNumber(today)-1)delete state.reviewLog[date];
  }
  for(const date of Object.keys(state.reviewAssignments || {})) {
    if(dayNumber(date)<dayNumber(today)-1)delete state.reviewAssignments[date];
  }
}
export function persist(storage, state) {
  compactHistory(state);
  storage.setItem(KEY, JSON.stringify(state));
}
export function importBackup(raw, surahs, texts) {
  if (raw.length > 5_000_000) throw Error('Файл больше 5 МБ.');
  return validateState(JSON.parse(raw), surahs, texts);
}
export function countRead(state, key, amount = 1, today = dayKey()) {
  const r = record(state, key);
  r.reads = Math.max(0, Math.min(1000000, r.reads + amount));
  if (amount > 0) state.activity[today] = (state.activity[today] || 0) + amount;
}
export function verifyAyah(state, key, today = dayKey()) {
  const r = record(state, key);
  if (!r.learned) {
    r.learned = true; r.verifiedAt = today; r.interval = 0; r.due = dateAfter(today, 1);
  }
}
