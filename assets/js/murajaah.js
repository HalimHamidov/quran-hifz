import { dayKey, dayNumber, dateAfter, record } from './progress.js';
export const INTERVALS = [1, 3, 7, 14, 30];
export function learnedPool(state, texts) {
  return Object.entries(state.ayahs).filter(([, r]) => r.learned).map(([key]) => {
    const [surah, ayah] = key.split(':').map(Number);
    return { key, surah, ayah, weight: texts[String(surah)][ayah - 1].text.replace(/\s/g, '').length };
  }).sort((a, b) => a.surah - b.surah || a.ayah - b.ayah);
}
// Contiguous, length-weighted bins retain canonical order; a single long ayah stays whole.
export function distribute(pool, days) {
  if (!Number.isInteger(days) || days < 1 || days > 365) throw Error('Неверный период.');
  const bins = Array.from({ length: days }, () => []);
  let index = 0, remaining = pool.reduce((sum, item) => sum + item.weight, 0), used = 0;
  let target = remaining / days;
  for (const item of pool) {
    if (index < days - 1 && bins[index].length && used + item.weight / 2 > target) {
      remaining -= used; index++; used = 0; target = remaining / (days - index);
    }
    bins[index].push(item); used += item.weight;
  }
  return bins;
}
export function reviewPlan(state, texts, today = dayKey()) {
  const pool = learnedPool(state, texts);
  const days = state.settings.cycle;
  const elapsed = Math.max(0, dayNumber(today) - dayNumber(state.settings.reviewAnchor));
  const day = elapsed % days;
  const bins = distribute(pool, days);
  const done = new Set(state.reviewLog[today] || []);
  const due = pool.filter(item => state.ayahs[item.key].due <= today)
    .sort((a,b) => state.ayahs[a.key].due.localeCompare(state.ayahs[b.key].due) || a.surah-b.surah || a.ayah-b.ayah);
  let tasks = [...new Map([...bins[day], ...pool.filter(item=>done.has(item.key))].map(item=>[item.key,item])).values()];
  let selected = new Set(tasks.map(item => item.key));
  let weight = tasks.reduce((sum,item) => sum + item.weight, 0);
  const budget = state.settings.minutes * 450;
  for (const item of due) {
    if (selected.has(item.key)) continue;
    if (tasks.length && weight + item.weight > budget) continue;
    tasks.push(item); selected.add(item.key); weight += item.weight;
  }
  state.reviewAssignments ||= {};
  if(state.reviewAssignments[today]) {
    const byKey=new Map(pool.map(item=>[item.key,item]));
    tasks=state.reviewAssignments[today].map(key=>byKey.get(key)).filter(Boolean);
  } else {
    tasks.sort((a,b) => a.surah-b.surah || a.ayah-b.ayah);
    if(tasks.length)state.reviewAssignments[today]=tasks.map(item=>item.key);
  }
  selected=new Set(tasks.map(item=>item.key));
  const deferred = due.filter(item => !selected.has(item.key)).length;
  const minutes = Math.ceil(tasks.reduce((sum, item) => sum + item.weight, 0) / 450);
  return { pool, bins, day, cycle: Math.floor(elapsed / days) + 1, tasks,
    pending: tasks.filter(item => !done.has(item.key)), done: tasks.filter(item => done.has(item.key)), minutes, deferred };
}
export function completeReview(state, key, success, today = dayKey()) {
  const r = record(state, key);
  if (!r.learned) throw Error('Аят ещё не входит в фонд памяти.');
  if (success) {
    const log = state.reviewLog[today] ||= [];
    if (log.includes(key)) return;
    log.push(key); r.reviews++;
    // A full-cycle review before the interval date must not consume a spaced repetition step.
    if (r.due <= today) {
      r.interval = Math.min(r.interval + 1, INTERVALS.length - 1);
      r.due = dateAfter(today, INTERVALS[r.interval]);
    }
  } else {
    r.errors++; r.interval = 0; r.due = dateAfter(today, 1);
    state.reviewLog[today] = (state.reviewLog[today] || []).filter(k => k !== key);
  }
}
export function reschedule(state, today = dayKey()) {
  state.settings.reviewAnchor = today;
  // Today's completed work still consumes the new assignment budget.
  if(state.reviewAssignments)delete state.reviewAssignments[today];
}
