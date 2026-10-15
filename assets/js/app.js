import { KEY, dayKey, dayNumber, freshState, load, persist, record, importBackup, countRead, verifyAyah } from './progress.js';
import { nextAyah, joinReady, addJoin, markError } from './hifz.js';
import { reviewPlan, completeReview, reschedule } from './murajaah.js';
import { Recitation } from './audio.js';
import { orderedSurahs } from './history.js';
import { createParts } from './parts.js';

const main = document.querySelector('main');
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link = (url, title) => `<a href="${esc(url)}" target="_blank" rel="noreferrer">${esc(title)} ↗</a>`;
const button = (action, title, extra = '') => `<button data-action="${action}" ${extra}>${title}</button>`;
const percent = (n, total) => Math.min(100, total ? n / total * 100 : 0);
let state, surahs, texts, chronology, history, translations, sources;
let tab = 'study', selectedYear = 1, catalogOrder = 'canonical', search = '', chartOrder = 'canonical';
let hiddenArabic = false, hiddenMeaning = false, storageBlocked = false, startupIssue = '';
let visualIndex = 0, gallery = [], toastTimer, audioMode = 'muallim', audioSpeed = 1, audioPause = 2, audioRepeats = 1;
let activeSurah = 74, activeAyah = 1;
const voice = new Recitation(document.querySelector('#recitation'), key => {
  record(state, key).listens++; save(); updateCounts();
}, message => { const el = document.querySelector('#audio-status'); if (el) el.textContent = message; });

function notice(message) {
  document.querySelector('#notice').textContent = message;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => document.querySelector('#notice').textContent = '', 6500);
}
function save() {
  if (storageBlocked) { notice('Сохранение заблокировано: сначала восстановите резервную копию в настройках.'); return false; }
  try { persist(localStorage, state); return true; }
  catch { notice('Не удалось сохранить. Экспортируйте прогресс; проверьте доступность хранилища.'); return false; }
}
function sourceLinks(ids) { return ids.map(id => sources.find(s => s.id === id)).filter(Boolean).map(s => link(s.url, s.title)).join(' · '); }
function stats() {
  const learned = Object.values(state.ayahs).filter(r => r.learned).length;
  const completed = surahs.filter(s => Array.from({ length: s.count }, (_, i) => state.ayahs[`${s.id}:${i + 1}`]?.learned).every(Boolean)).length;
  return { learned, completed, errors: Object.values(state.ayahs).reduce((sum, r) => sum + r.errors, 0) };
}
function heading(eyebrow, title, subtitle = '') {
  return `<p class="eyebrow">${eyebrow}</p><h1>${title}</h1>${subtitle ? `<p class="muted">${subtitle}</p>` : ''}`;
}
function home() {
  const st = stats(), plan = reviewPlan(state, texts), current = surahs[state.settings.currentSurah - 1];
  const next = nextAyah(state, current.id, current.count);
  const dueDates = Object.values(state.ayahs).filter(r => r.learned).map(r => r.due).sort();
  return `<section class="intro"><div><p class="eyebrow">Постепенно · Осознанно · На всю жизнь</p><h1>Мой путь к хифзу Корана — 23 года</h1><p>Сначала повторите знакомое. Затем сделайте небольшой шаг к новому — в своём темпе.</p><a class="button primary" href="${plan.pending.length ? '#review' : `#surah/${current.id}/${next}`}">${plan.pending.length ? 'Начать с муроджаа' : 'Продолжить заучивание'} <span aria-hidden="true">→</span></a><div class="principles"><span>Постоянство<br><span lang="ar" dir="rtl">الاستمرار</span></span><span>Терпение<br><span lang="ar" dir="rtl">الصبر</span></span><span>Повторение<br><span lang="ar" dir="rtl">المراجعة</span></span></div></div><img class="intro-image" src="assets/images/dawn.svg" alt="Символическая иллюстрация: свет над горным горизонтом"></section>
  ${startupIssue ? `<div class="notice-panel" role="alert">${esc(startupIssue)} <a href="#settings">Открыть настройки</a></div>` : ''}
  <section class="stats" aria-label="Прогресс"><div class="stat"><strong>${st.learned} <small>/ 6236</small></strong><span>аятов в фонде памяти</span></div><div class="stat"><strong>${st.completed} <small>/ 114</small></strong><span>сур выучено полностью</span></div><div class="stat"><strong>${percent(st.learned, 6236).toFixed(2)}%</strong><span>Корана освоено</span></div><div class="stat"><strong>${st.errors}</strong><span>отмечено ошибок</span></div></section>
  <div class="workspace"><section><p class="eyebrow">01 / Приоритет дня</p><h2>Постоянное повторение</h2><p class="arabic-name" lang="ar">المراجعة</p><p>${plan.pool.length ? `Сегодня: ${plan.pending.length} аятов · около ${plan.minutes} мин.` : 'Фонд памяти пока пуст. Проверенные аяты появятся здесь.'}</p><div class="progress"><span style="width:${percent(plan.done.length, plan.tasks.length)}%"></span></div><small>Круг ${plan.cycle} · день ${plan.day + 1} из ${state.settings.cycle} · выполнено ${plan.done.length}/${plan.tasks.length}</small><div class="actions" style="margin-top:20px"><a href="#review" class="button">Открыть муроджаа →</a></div><p class="muted divider">Ближайшая проверка: ${dueDates[0] || 'после первого заученного аята'}</p></section>
  <section><p class="eyebrow">02 / Если есть силы</p><h2>Новое заучивание</h2><p class="arabic-name" lang="ar">الحفظ الجديد</p><p>${current.russian} · аят ${next}</p><p class="muted">${state.settings.paused ? 'Новое заучивание приостановлено. Муроджаа продолжается.' : 'Ориентир: 1–2 строки, 4 дня в неделю. Размер занятия выбираете вы.'}</p><div class="actions"><a href="#surah/${current.id}/${next}" class="button ${state.settings.paused ? '' : 'primary'}">${state.settings.paused ? 'Открыть для чтения' : 'Продолжить'} →</a>${button('pause', state.settings.paused ? 'Возобновить' : 'Приостановить')}</div><p class="muted divider">${current.period === 'Meccan' ? 'Мекканский' : 'Мединский'} период · место в традиционном порядке: ${current.order}. Точная дата не установлена.</p></section></div>
  ${!Object.keys(state.ayahs).length ? `<div class="note">Личный старт: 96 → 74 → 68 → 73 → 1. Если Аль-Аляк уже выучена, ${button('import-alaq', 'добавьте её после проверки', 'class="text-link"')}. Автоматически выученной она не считается.</div>` : ''}
  <section class="divider"><div class="section-top"><h2>114 сур. Один путь.</h2><a href="#catalog">Весь каталог →</a></div>${[96,74,68,73,1].map(id => surahRow(surahs[id - 1])).join('')}</section>`;
}
function surahRow(s) {
  const learned = Array.from({ length: s.count }, (_, i) => state.ayahs[`${s.id}:${i + 1}`]?.learned).filter(Boolean).length;
  return `<a class="surah-row" href="#surah/${s.id}/1"><span class="number">${String(s.id).padStart(3,'0')}</span><div><h3>${esc(s.russian)}</h3><small>${s.count} аятов · ${s.period === 'Meccan' ? 'Мекка' : 'Медина'}</small></div><span class="arabic-name" lang="ar">${esc(s.name)}</span><span class="meta"><small>порядок ${s.order}</small><small>${learned ? `${learned}/${s.count} в памяти` : s.id === 74 ? 'Следующая в плане' : 'В плане'}</small></span></a>`;
}
function orderOptions(value, personal = true) {
  return [['canonical','По мусхафу'],['historical','По ниспосланию'],...(personal ? [['personal','Мой учебный порядок']] : [])].map(([v,t]) => `<option value="${v}" ${v === value ? 'selected' : ''}>${t}</option>`).join('');
}
function catalog() {
  return `${heading('Библиотека / 114 сур','Каталог сур','Арабский текст и общие инструменты доступны для всех сур. Подробные учебные блоки: 96, 74 и 67.')}<div class="toolbar"><input type="search" id="search" aria-label="Найти суру" placeholder="Название или номер суры" value="${esc(search)}"><label>Порядок <select id="catalog-order">${orderOptions(catalogOrder)}</select></label></div><p id="catalog-note" class="note">${catalogOrder === 'personal' ? esc(history.alternative) : 'Традиционная хронология отражает начало ниспослания сур, а не дату каждого аята. Источник: Tanzil.'}</p><div id="surah-results" class="surah-list">${catalogRows()}</div><section class="divider">${chart()}</section>`;
}
function catalogRows() {
  return orderedSurahs(surahs, catalogOrder, chronology.personalStart).filter(s => `${s.id} ${s.russian} ${s.name} ${s.latin}`.toLowerCase().includes(search.toLowerCase())).map(surahRow).join('') || '<p class="empty">Сура не найдена.</p>';
}
function chart() {
  const ordered = orderedSurahs(surahs, chartOrder, chronology.personalStart);
  return `<div class="section-top"><div><h2>Количество аятов в сурах</h2><small>Справа налево. Это размеры сур, а не число откровений за год.</small></div><label>Порядок графика <select id="chart-order">${orderOptions(chartOrder, false)}</select></label></div><div class="chart-wrap"><div class="chart" aria-label="Количество аятов, справа налево">${ordered.map(s => `<a href="#surah/${s.id}/1" style="height:${s.count/286*100}%" title="${s.id}. ${esc(s.russian)}: ${s.count} аятов" aria-label="${s.id}. ${esc(s.russian)}: ${s.count} аятов"></a>`).join('')}</div><div class="chart-label"><span>${ordered.at(-1).russian}</span><span>${ordered[0].russian}</span></div></div>`;
}
function timeline() {
  const y = history.years[selectedYear - 1];
  return `${heading('История / 610–632','23 года откровения','Исторический ориентир рядом с личным учебным планом. Это две разные шкалы.')}<div class="year-strip" aria-label="Год пророческой миссии">${history.years.map(y => button('year', `<strong>${y.year}</strong><small>≈ ${y.calendar}</small>`, `data-year="${y.year}" aria-label="Год ${y.year}, около ${y.calendar}" aria-pressed="${y.year === selectedYear}"`)).join('')}</div><div class="section-top"><div><p class="eyebrow">Год миссии ${y.year} / 23</p><h2>${y.place} · около ${y.calendar} года</h2><p class="muted">Возраст Пророка ﷺ: приблизительно ${y.age} лет</p></div><span class="grade">D · условная календарная сетка</span></div><p class="note">${esc(y.note)} Точная дата ниспослания большинства аятов не установлена.</p>
  ${y.events.length ? y.events.map(e => `<article class="event"><span class="grade">${e.grade} · событие</span><span class="grade">${e.dateGrade} · датировка</span><h2 style="margin-top:15px">${esc(e.title)}</h2><p>${esc(e.description)}</p><p class="muted">${esc(e.date)}</p><p><small>Участники: ${e.people.map(esc).join(', ')}</small></p><p>Связанные аяты: ${e.ayahs.map(ref => { const [s, a] = ref.split(':'); return `<a href="#surah/${s}/${parseInt(a)}">${ref}</a>`; }).join(' · ')}</p><p>${sourceLinks(e.sources)}</p><p>${e.surahs.map(id => `<a class="button compact" href="#surah/${id}/1">${surahs[id-1].russian} →</a>`).join(' ')}</p></article>`).join('') : '<p class="empty">Для этого года проверенные события и привязки сур пока не внесены. Точная дата не установлена. Отсутствие записи не означает отсутствия событий.</p>'}
  <section class="divider"><h2>Как читать исторические сведения</h2>${Object.entries(history.grades).map(([g,t])=>`<p><span class="grade">${g}</span>${esc(t)}</p>`).join('')}<p class="note">${esc(history.alternative)}</p><p>${sourceLinks(['order','first','resumption'])}</p><p class="muted">Альтернативный список Нёльдеке отличается, в частности, положением сур 110 и 62; см. сравнение на Tanzil. Полные суры могли ниспосылаться частями.</p></section>`;
}
function commentary(s, a) {
  const content = translations.surahs[String(s)], block = content?.blocks.find(b => a >= b.from && a <= b.to);
  return { content, block, note: content?.notes?.[a-1] ?? (s === 74 && a <= 7 ? content.first7[a - 1] : block?.explanation) };
}
function audioControls(s, a) {
  return `<section class="divider"><h3>Слушаю → повторяю → проверяю</h3><p class="muted">Махмуд Халиль аль-Хусари · Хафс от Асима · ${link('https://everyayah.com/data/','EveryAyah')}</p><div class="actions">${button('listen','▶ Слушать аят')}${button('listen-range','▶ Слушать диапазон')}${button('stop','■ Стоп')}</div><div class="audio-settings"><label>От <input id="audio-from" type="number" min="1" max="${surahs[s-1].count}" value="${a}"></label><label>До <input id="audio-to" type="number" min="1" max="${surahs[s-1].count}" value="${a}"></label><label>Кругов <input id="audio-repeats" type="number" min="1" max="100" value="${audioRepeats}"></label><label>Пауза, с <input id="audio-pause" type="number" min="0" max="60" value="${audioPause}"></label><label>Скорость <select id="audio-speed">${[.75,1,1.25].map(n=>`<option ${n === audioSpeed?'selected':''}>${n}</option>`).join('')}</select></label><label>Запись <select id="audio-mode"><option value="muallim" ${audioMode==='muallim'?'selected':''}>Mu’allim</option><option value="murattal" ${audioMode==='murattal'?'selected':''}>Murattal</option></select></label></div><p id="audio-status" role="status" class="readiness">Счётчик прослушиваний увеличивается только после окончания записи. Высота голоса сохраняется.</p></section>`;
}
function reader(s, a) {
  const surah = surahs[s - 1], verse = texts[String(s)][a - 1], r = state.ayahs[`${s}:${a}`] || record(freshState(), '0');
  const {content, block, note} = commentary(s, a);
  const learned = texts[String(s)].filter(v => state.ayahs[`${s}:${v.number}`]?.learned).length;
  const related = history.years.flatMap(y => y.events).filter(e => e.surahs.includes(s));
  const meaning = `<p class="${hiddenMeaning?'concealed':''}" ${hiddenMeaning?'aria-hidden="true"':''}>${esc(note || 'Подробное пояснение для этого аята ещё не добавлено. Сверяйте смысл с надёжным переводом.')}</p><small>Авторская учебная заметка, не перевод. ${content ? link(content.url,'Перевод и тафсир Umma.ru') : link(`https://quran.com/${s}/${a}`,'Открыть аят и переводы')}</small>`;
  gallery = content?.blocks.map(b => ({title:`${surah.russian} · ${b.from}–${b.to} · ${b.title}`,src:`assets/images/${b.visual}.svg`,note:b.explanation})) || [];
  return `<div class="reader-head"><div><p class="eyebrow">Сура ${s} / ${surah.period==='Meccan'?'Мекканская':'Мединская'} / ${surah.count} аятов</p><h1>${esc(surah.russian)}</h1><small>Традиционный порядок: ${surah.order} · в памяти ${learned}/${surah.count}</small></div><span class="arabic-name" lang="ar">${esc(surah.name)}</span></div>
  <div class="tabs" aria-label="Режим суры">${[['study','Заучивание'],['read','Все аяты'],['context','История и смыслы']].map(([v,t])=>button('tab',t,`data-tab="${v}" aria-pressed="${tab===v}"`)).join('')}${s===96?'<a class="button" href="surahs/096-al-alaq/">Визуальные карточки Аль-Аляк ↗</a>':''}${s===67?'<a class="button" href="surahs/067-al-mulk/legacy/">Все прежние версии ↗</a>':''}</div>
  ${state.settings.paused && tab==='study'?'<p class="notice-panel">Новое заучивание на паузе. Чтение, аудио и муроджаа доступны.</p>':''}
  ${tab === 'read' ? `<p class="note">Арабский оригинал — ${sourceLinks(['tanzil'])}. Суры открываются из локальных проверенных данных.</p><div class="ayah-list">${texts[String(s)].map(v=>`<article><small>${s}:${v.number} ${state.ayahs[`${s}:${v.number}`]?.learned?'· в памяти':''}</small><p class="arabic" lang="ar" dir="rtl">${esc(v.text)}</p>${s===74||s===67||s===96?`<p class="muted">${esc(commentary(s,v.number).note)}</p>`:''}<a class="button compact" href="#surah/${s}/${v.number}">Учить аят ${v.number} →</a></article>`).join('')}</div>` : tab === 'context' ? `<div class="note">${related.length ? 'Событие и начало суры связаны источником. Дата всей суры из этого не следует.' : 'Точная дата не установлена. Исторический комментарий по этой суре пока не внесён.'}</div>${related.map(e=>`<article class="event"><span class="grade">${e.grade}</span><h2>${esc(e.title)}</h2><p>${esc(e.description)}</p><p>Участники: ${e.people.map(esc).join(', ')}</p><p>${sourceLinks(e.sources)}</p><small>${esc(e.date)}</small></article>`).join('')}<h2 class="divider">Смысловые блоки</h2>${content?content.blocks.map((b,i)=>`<article class="event"><button class="visual-button" data-action="visual" data-index="${i}"><img class="visual" src="assets/images/${b.visual}.svg" alt="Символическая иллюстрация: ${esc(b.title)}" loading="lazy"></button><span class="visual-caption">Символический образ; не историческая реконструкция · открыть полностью</span><h3>${b.from}–${b.to}. ${esc(b.title)}</h3><p>${esc(b.explanation)}</p><p>${link(content.url,'Перевод и подробный тафсир')}</p><a href="#surah/${s}/${b.from}" class="button compact">Начать блок →</a></article>`).join(''):'<p class="empty">Редакционные блоки для этой суры ещё не подготовлены. Арабские аяты и инструменты заучивания доступны.</p>'}<p class="note">Длинные аяты не делятся автоматически: допустимые остановки и начало чтения частей необходимо согласовать с учителем таджвида.</p>` : `
  <div class="reader-layout"><section><div class="toolbar"><label>Аят <select id="ayah-select">${texts[String(s)].map(v=>`<option value="${v.number}" ${v.number===a?'selected':''}>${v.number}</option>`).join('')}</select> из ${surah.count}</label><small>${block?`${block.from}–${block.to} · ${esc(block.title)}`:'100 повторений + соединение аятов'}</small></div><article class="study"><div class="section-top"><span class="eyebrow">${s}:${a}</span><span id="verified-status" class="readiness">${r.learned?'✓ Проверено без подсказки':'Ещё не проверено'}</span></div><p id="verse-text" class="arabic ${hiddenArabic?'concealed':''}" lang="ar" dir="rtl" ${hiddenArabic?'aria-hidden="true"':''}>${esc(verse.text)}</p><div id="meaning">${meaning}</div><div class="counter"><strong><span id="read-count">${r.reads}</span> <small>/ ${state.settings.target}</small></strong>${button('read','+1 повторение',`class="primary" ${state.settings.paused?'disabled':''}`)}${button('correct','Исправить','class="compact"')}</div><div class="progress"><span id="read-bar" style="width:${percent(r.reads,state.settings.target)}%"></span></div><p class="readiness">Самостоятельное чтение · прослушиваний: <span id="listen-count">${r.listens}</span> · ошибок: <span id="error-count">${r.errors}</span></p><div class="actions">${button('hide-arabic',hiddenArabic?'Показать арабский':'Скрыть арабский','class="compact"')}${button('hide-meaning',hiddenMeaning?'Показать пояснение':'Скрыть пояснение','class="compact"')}${button('recall','Читать наизусть','class="compact"')}</div><div class="divider"><label class="check-label"><input type="checkbox" id="verified-check">Прочитал(а) без подсказки и проверил(а) таджвид</label><div class="actions" style="margin-top:15px">${button('verify','✓ Проверено',`class="primary" ${state.settings.paused?'disabled':''}`)}${button('error','Отметить ошибку','class="compact"')}</div><small>100 повторений сами по себе не означают надёжного запоминания.</small></div></article>
  ${a>1?`<section class="divider"><h3>Соединение ${a-1} + ${a}</h3><p class="muted">После проверки обоих аятов прочитайте их подряд. Затем повторите последовательность всего смыслового блока.</p><p class="arabic" lang="ar" dir="rtl">${hiddenArabic?'Текст скрыт':esc(texts[String(s)][a-2].text)+' ۞ '+esc(verse.text)}</p><div class="counter"><strong><span id="join-count">${state.joins[`${s}:${a}`]||0}</span> <small>/ ${state.settings.joinTarget}</small></strong>${button('join','+1 соединение',`${!joinReady(state,s,a)||state.settings.paused?'disabled':''}`)}</div><small>Цель настраивается. Ежедневно читать всю растущую суру 100 раз не требуется.</small></section>`:''}
  ${audioControls(s,a)}<div class="actions divider">${a>1?`<a class="button" href="#surah/${s}/${a-1}">← Предыдущий</a>`:''}${a<surah.count?`<a class="button primary" href="#surah/${s}/${a+1}">Следующий аят →</a>`:'<a class="button" href="#review">К муроджаа →</a>'}</div></section>
  <aside><div class="aside-block">${block?`<button class="visual-button" data-action="visual" data-index="${content.blocks.indexOf(block)}"><img class="visual" src="assets/images/${block.visual}.svg" alt="Символический образ: ${esc(block.title)}"></button><span class="visual-caption">Символический образ · открыть полностью</span><h3>${esc(block.title)}</h3><p class="muted">${esc(block.explanation)}</p>`:'<h3>Небольшие шаги</h3><p class="muted">Прослушайте. Прочитайте с мусхафа. Повторите самостоятельно. Проверьте без подсказки.</p>'}</div><div class="aside-block"><h3>Сегодня достаточно</h3><p class="muted">1–2 строки нового текста. Повторения можно распределять на несколько дней.</p><a href="#review">Сначала муроджаа →</a></div><div class="aside-block"><h3>О методике</h3><p class="muted">Короткий аят: цель 100. Проверенные части длинного: по 100, соединение 15–20. Деление — только с учителем.</p><small>По предоставленному описанию ${sourceLinks(['method'])}. Видеозапись независимо не подтверждена.</small></div></aside></div>`}`;
}
function reviews() {
  const plan = reviewPlan(state, texts), log = state.reviewLog[dayKey()] || [];
  return `${heading('Приоритет / المراجعة','Постоянное повторение','Весь фонд памяти остаётся в круге, даже когда новое заучивание на паузе.')}<div class="toolbar"><label>Полный круг, дней <input type="number" id="cycle" min="1" max="365" list="cycle-options" value="${state.settings.cycle}"></label><datalist id="cycle-options"><option value="7"><option value="14"><option value="30"></datalist>${button('reschedule','Перераспределить с сегодняшнего дня')}</div><div class="stats"><div class="stat"><strong>${plan.pool.length}</strong><span>аятов во всём фонде</span></div><div class="stat"><strong>${plan.day+1} <small>/ ${state.settings.cycle}</small></strong><span>день круга ${plan.cycle}</span></div><div class="stat"><strong>${plan.done.length} <small>/ ${plan.tasks.length}</small></strong><span>выполнено сегодня</span></div><div class="stat"><strong>≈ ${plan.minutes}</strong><span>минут сегодня, оценка</span></div></div>${plan.minutes>state.settings.minutes?'<p class="note">Задание больше вашего бюджета времени. Увеличьте период до 14 или 30 дней и перераспределите; весь фонд сохранится.</p>':''}<p class="muted">Материал распределён по длине арабского текста с сохранением порядка. Недавние и проблемные аяты дополнительно проверяются через 1, 3, 7, 14, 30 дней.</p>${plan.pending.length ? plan.pending.map(item=>`<article class="review-item"><div class="section-top"><h3>${surahs[item.surah-1].russian} · ${item.ayah}</h3><a href="#surah/${item.surah}/${item.ayah}">Открыть для работы →</a></div><details><summary>Показать текст для проверки</summary><p class="arabic" lang="ar" dir="rtl">${esc(texts[String(item.surah)][item.ayah-1].text)}</p></details><div class="actions" style="margin-top:15px">${button('review-ok','✓ Прочитано без ошибки',`data-key="${item.key}"`)}${button('review-error','Была ошибка',`data-key="${item.key}"`)}</div></article>`).join(''):`<p class="empty">${plan.pool.length?'На сегодня всё. Можно отдохнуть или продолжить новое заучивание.':'Пока нет проверенных аятов. Начните с заучивания или добавьте уже выученную Аль-Аляк.'}</p>${!plan.pool.length?button('import-alaq','Добавить проверенную Аль-Аляк'):''}`}
  <section class="divider"><h2>Круг без потери старого</h2><p class="muted">После пропуска начните новый круг кнопкой перераспределения. Пропущенные дневные части не складываются. Просроченные интервальные проверки остаются видимыми.</p><div class="surah-list">${plan.bins.map((bin,i)=>`<div class="source"><strong>День ${i+1}</strong> <small>· ${bin.length} аятов · около ${Math.ceil(bin.reduce((sum,x)=>sum+x.weight,0)/450)} мин.</small><p>${bin.length?bin.map(x=>x.key).join(' · '):'Свободный день'}</p></div>`).join('')}</div><p class="note">Сегодня отмечено ${log.length} аятов. Проверка на слух программой не выполняется: оценивайте чтение с мусхафом или учителем.</p></section>${statistics()}`;
}
function statistics() {
  const today = dayNumber(), week = Object.entries(state.reviewTotals).filter(([d])=>today-dayNumber(d)>=0&&today-dayNumber(d)<7).reduce((n,[,count])=>n+count,0);
  const month = Object.entries(state.reviewTotals).filter(([d])=>today-dayNumber(d)>=0&&today-dayNumber(d)<30).reduce((n,[,count])=>n+count,0);
  const start = dayNumber(state.settings.startDate), elapsed = Math.max(0,today-start), year = Math.min(23,Math.floor(elapsed/365.2425)+1);
  const counts = Array.from({length:23},(_,i)=>Object.values(state.ayahs).filter(r=>r.learned && Math.floor((dayNumber(r.verifiedAt)-start)/365.2425)===i).length);
  return `<section class="divider"><h2>Статистика занятий</h2><p>${week} повторённых аятов за 7 дней · ${month} за 30 дней. Повторения одного аята в разные дни считаются отдельно.</p><p class="muted">Учебный год ${year} / 23 · начало ${state.settings.startDate}. Это личный путь, не историческая хронология.</p><div class="milestones" aria-label="Проверенные аяты по учебным годам">${counts.map((n,i)=>`<div style="height:${Math.max(2,n/Math.max(1,...counts)*100)}%" title="Год ${i+1}: ${n}" role="img" aria-label="Учебный год ${i+1}: ${n} аятов"></div>`).join('')}</div><div class="chart-label"><span>1-й год</span><span>23-й год</span></div></section>`;
}
function settings() {
  return `${heading('Настройки / Ваш темп','Прогресс остаётся с вами','Сохранение на этом устройстве. Для переноса и страховки регулярно делайте резервную копию.')} ${startupIssue?`<p class="notice-panel" role="alert">${esc(startupIssue)}</p>`:''}<div class="settings-grid"><section><h2>Ритм занятий</h2><label>Самостоятельные повторения <input id="target" type="number" min="1" max="10000" list="targets" value="${state.settings.target}"></label><datalist id="targets"><option value="10"><option value="20"><option value="50"><option value="100"></datalist><label>Соединения аятов <input id="join-target" type="number" min="1" max="10000" list="join-targets" value="${state.settings.joinTarget}"></label><datalist id="join-targets"><option value="5"><option value="10"><option value="15"><option value="20"></datalist><label>Круг муроджаа, дней <input id="cycle" type="number" min="1" max="365" value="${state.settings.cycle}"></label><label>Время повторения, мин. <input id="minutes" type="number" min="1" max="240" value="${state.settings.minutes}"></label><label>Начало личного пути <input id="start-date" type="date" value="${state.settings.startDate}"></label><label class="check-label"><input id="paused" type="checkbox" ${state.settings.paused?'checked':''}>Приостановить только новое заучивание</label><p class="note">Ориентир: 1–2 строки, 4 дня в неделю. Повторения разрешено распределять на несколько дней. Штрафов за пропуски нет.</p></section><section><h2>Резервная копия</h2><div class="actions">${button('export','↓ Экспорт JSON','class="primary"')}<label class="button">↑ Импорт JSON<input id="import" type="file" accept="application/json,.json" hidden></label></div><p class="muted">Импорт проверяет версию, номера аятов, даты и счётчики. Перед заменой будет подтверждение. Сделайте экспорт текущего прогресса.</p>${button('export-recovery','Экспорт исходных сохранённых данных','class="compact"')}<p class="note">Облачной синхронизации пока нет. Резервную копию можно перенести на другое устройство. Данные старых версий Аль-Мульк не смешиваются автоматически с новым фондом.</p><h3 class="divider">Уже знаете Аль-Аляк?</h3><p class="muted">Добавьте 19 аятов только после проверки чтения без подсказки.</p>${button('import-alaq','Добавить Аль-Аляк')}<h3 class="divider">Сброс</h3>${button('reset','Сбросить локальный прогресс')}<small style="display:block;margin-top:10px">Требуется ввести слово СБРОС. Отмена ничего не изменяет.</small></section></div>`;
}
function sourcePage() {
  return `${heading('Прозрачность / Источники','Текст, история и права')}<p class="note">Текст Корана не создаётся моделью. Используется неизменённый Tanzil Uthmani 1.1, 6 236 аятов. ${link('data/TANZIL-LICENSE.txt','Полное уведомление и условия')} · ${link('data/provenance.json','Контрольные суммы')}</p>${sources.map(s=>`<article class="source"><h3>${link(s.url,s.title)}</h3><p>${esc(s.kind)}</p></article>`).join('')}<section class="divider"><h2>Ограничения первой версии</h2><p>Историческая сетка содержит 23 года, но подробные проверенные события пока внесены для начала откровений и хиджры. Даты всех аятов неизвестны. Подробные смысловые блоки созданы для сур 96, 74 и 67; для остальных доступны оригинал и общие инструменты.</p><p>Иллюстрации платформы — символические SVG и специально созданные для Аль-Аляк художественные изображения ИИ. Это не исторические фотографии; пророки не изображены, арабский текст выводится отдельно. Галерея прежнего Аль-Мульк сохранена как пользовательский материал; её права и встроенный арабский текст отдельно не переаттестованы.</p><p>Аудио передаётся напрямую с публичных адресов EveryAyah и не распространяется в репозитории, не кешируется для офлайн-доступа. Отдельная лицензия на повторное распространение записей не установлена. Для массового скачивания или переноса файлов нужно разрешение правообладателя.</p><p>Автоматическая оценка таджвида не реализована. Разметку длинных аятов вводит пользователь после проверки учителем; приложение сверяет точное совпадение с оригиналом и хранит отдельные счётчики частей и соединения. Достижение счётчика не подтверждает качество чтения.</p></section>`;
}
function render() {
  const route = location.hash.slice(1) || 'home';
  const match = /^surah\/(\d+)\/(\d+)$/.exec(route);
  if (match && surahs[+match[1]-1] && +match[2]>=1 && +match[2]<=surahs[+match[1]-1].count) {
    activeSurah=+match[1]; activeAyah=+match[2];
    if (state.settings.currentSurah!==activeSurah || state.settings.currentAyah!==activeAyah) {
      state.settings.currentSurah=activeSurah; state.settings.currentAyah=activeAyah; save();
    }
    main.innerHTML=reader(activeSurah,activeAyah);
    partWorkspace();
    document.title=`${surahs[activeSurah-1].russian} ${activeAyah} · Quran Hifz`;
  } else {
    const views={home,catalog,history:timeline,review:reviews,settings,sources:sourcePage};
    main.innerHTML=(views[route] || home)(); document.title='Quran Hifz — 23 года с Кораном';
    if (route==='review') {
      const deferred=reviewPlan(state,texts).deferred;
      if(deferred) main.querySelector('.toolbar').insertAdjacentHTML('afterend',`<p class="note">Просроченных интервальных проверок вне сегодняшнего бюджета: ${deferred}. Они сохраняются и постепенно включаются в следующие задания; весь фонд остаётся в общем круге.</p>`);
    }
  }
  document.querySelectorAll('nav a').forEach(a=>{const active=a.hash===`#${route}` || (match&&a.hash==='#catalog');a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
}
function updateCounts() {
  const r = state.ayahs[`${activeSurah}:${activeAyah}`]; if (!r) return;
  for (const [id,value] of [['read-count',r.reads],['listen-count',r.listens],['error-count',r.errors],['join-count',state.joins[`${activeSurah}:${activeAyah}`]||0]]) {
    const el=document.getElementById(id);if(el)el.textContent=value;
  }
  const bar=document.getElementById('read-bar');if(bar)bar.style.width=`${percent(r.reads,state.settings.target)}%`;
}
function partWorkspace() {
  if(tab!=='study'||!/^#surah\//.test(location.hash))return;
  const original=texts[activeSurah][activeAyah-1].text,key=`${activeSurah}:${activeAyah}`;
  const plan=state.partPlans[key];
  const root=document.createElement('section');root.className='divider';root.id='parts-workspace';
  root.innerHTML=`<h3>Длинный аят: работа по частям</h3><p class="muted">Только границы, проверенные с учителем по правилам вакфа и ибтида. Программа не определяет допустимые остановки.</p>${plan?plan.parts.map((p,i)=>`<article class="aside-block"><small>Часть ${i+1}</small><p class="arabic ${hiddenArabic?'concealed':''}" lang="ar" dir="rtl">${esc(original.slice(p.start,p.end))}</p><div class="actions"><strong>${p.reads} / ${state.settings.target}</strong>${button('part-read','+1 часть',`data-part="${i}" ${state.settings.paused?'disabled':''}`)}</div></article>`).join('')+`<p>Целый аят после соединения: <strong>${plan.joined} / ${state.settings.joinTarget}</strong></p>${button('part-join','+1 целый аят',`${state.settings.paused?'disabled':''}`)}<p><small>Разметка подтверждена пользователем ${plan.approvedAt}. Итоговая проверка без подсказки — выше.</small></p>`:''}<details><summary>${plan?'Заменить разметку частей':'Добавить проверенную разметку'}</summary><p class="muted">Скопируйте оригинал выше целиком и разделите переносами строк в согласованных с учителем местах. Текст каждой части должен точно совпадать с оригиналом.</p><textarea id="parts-input" rows="6" aria-label="Проверенные части аята" style="width:100%;font-family:Amiri,serif;font-size:26px;direction:rtl;background:var(--bg);color:var(--text);border:1px solid var(--line);padding:12px">${esc(plan?plan.parts.map(p=>original.slice(p.start,p.end)).join('\n'):original)}</textarea><label><input id="parts-approved" type="checkbox">Учитель проверил допустимость этих остановок и начала чтения</label><div class="actions" style="margin-top:15px">${button('parts-save','Сохранить разметку',`${state.settings.paused?'disabled':''}`)}</div></details>`;
  document.querySelector('.study').after(root);
}
function showVisual(index) {
  if (!gallery.length) return;
  visualIndex=(index+gallery.length)%gallery.length;
  const v=gallery[visualIndex];document.querySelector('#visual-title').textContent=v.title;
  document.querySelector('#visual-content').innerHTML=`<img src="${v.src}" alt="Символическая иллюстрация"><p>${esc(v.note)}</p><small>Символический образ, не историческая реконструкция.</small>`;
  const dialog=document.querySelector('#visual-dialog');if(!dialog.open)dialog.showModal();
}
function download(content,name) {
  const url=URL.createObjectURL(new Blob([content],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function playAudio(range) {
  const value=(id,fallback)=>Number(document.getElementById(id)?.value ?? fallback);
  const from=range?value('audio-from',activeAyah):activeAyah,to=range?value('audio-to',activeAyah):activeAyah;
  audioRepeats=value('audio-repeats',1);audioPause=value('audio-pause',2);audioSpeed=value('audio-speed',1);
  audioMode=document.getElementById('audio-mode')?.value || 'muallim';
  if (![from,to,audioRepeats].every(Number.isInteger)||from<1||to<from||to>surahs[activeSurah-1].count||audioRepeats<1||audioRepeats>100||!Number.isFinite(audioPause)||audioPause<0||audioPause>60||![.75,1,1.25].includes(audioSpeed)) {notice('Проверьте диапазон, повторы и паузу аудио.');return;}
  void voice.play(activeSurah,from,to,audioRepeats,audioPause,audioSpeed,audioMode);
}
main.addEventListener('click', event=>{
  const target=event.target.closest('[data-action]');if(!target)return;
  const action=target.dataset.action,key=`${activeSurah}:${activeAyah}`;
  if(action==='read'){if(state.settings.paused)return;countRead(state,key);save();updateCounts();}
  else if(action==='correct') {const n=prompt('Новое число самостоятельных повторений (0–1000000):',state.ayahs[key]?.reads||0);if(n!==null&&/^\d+$/.test(n)&&+n<=1000000){record(state,key).reads=+n;save();updateCounts();}else if(n!==null)notice('Введите целое число от 0 до 1000000.');}
  else if(action==='hide-arabic'||action==='hide-meaning'||action==='recall') {if(action==='hide-arabic')hiddenArabic=!hiddenArabic;else if(action==='hide-meaning')hiddenMeaning=!hiddenMeaning;else{hiddenArabic=true;hiddenMeaning=true;}voice.stop();render();}
  else if(action==='verify'){if(state.settings.paused)return;if(!document.querySelector('#verified-check').checked){notice('Сначала подтвердите чтение без подсказки и проверку таджвида.');return;}verifyAyah(state,key);save();render();notice('Аят добавлен в фонд памяти. Первая проверка — завтра.');}
  else if(action==='error'){markError(state,key,dayKey());save();updateCounts();notice('Ошибка отмечена. Для выученного аята назначена ранняя проверка.');}
  else if(action==='join'){if(state.settings.paused||!joinReady(state,activeSurah,activeAyah))return;addJoin(state,key);save();updateCounts();}
  else if(action==='listen'||action==='listen-range')playAudio(action==='listen-range');
  else if(action==='stop')voice.stop();
  else if(action==='tab'){voice.stop();tab=target.dataset.tab;render();}
  else if(action==='pause'){state.settings.paused=!state.settings.paused;save();render();}
  else if(action==='year'){selectedYear=+target.dataset.year;render();document.querySelector(`[data-year="${selectedYear}"]`).scrollIntoView({block:'nearest',inline:'center'});}
  else if(action==='visual')showVisual(+target.dataset.index);
  else if(action==='reschedule'){reschedule(state);save();render();notice('Новый круг начат. Фонд памяти сохранён.');}
  else if(action==='review-ok'||action==='review-error'){completeReview(state,target.dataset.key,action==='review-ok');save();render();if(action==='review-error')notice('Ошибка отмечена. Проверка завтра; сегодня можно повторить ещё раз.');}
  else if(action==='export')download(JSON.stringify(state,null,2),`quran-hifz-${dayKey()}.json`);
  else if(action==='export-recovery'){try{download(localStorage.getItem(KEY)||'{}',`quran-hifz-original-${dayKey()}.json`);}catch{notice('Хранилище недоступно.');}}
  else if(action==='reset'){if(prompt('Это удалит прогресс на этом устройстве. Сначала сделайте экспорт. Для сброса введите СБРОС:')==='СБРОС'){voice.stop();state=freshState();storageBlocked=false;startupIssue='';save();render();notice('Локальный прогресс сброшен.');}}
  else if(action==='import-alaq'){if(confirm('Подтверждаете, что все 19 аятов Аль-Аляк прочитаны наизусть без подсказки и проверены по мусхафу или с учителем?')){for(let a=1;a<=19;a++)verifyAyah(state,`96:${a}`);save();render();notice('19 проверенных аятов добавлены. Муроджаа активна.');}}
  else if(action==='parts-save'){
    if(state.settings.paused)return;
    if(!document.querySelector('#parts-approved').checked){notice('Нужно подтверждение проверки границ учителем.');return;}
    try{const plan=createParts(texts[activeSurah][activeAyah-1].text,document.querySelector('#parts-input').value,dayKey());if(state.partPlans[key]&&!confirm('Заменить разметку? Счётчики частей этого аята начнутся заново.'))return;state.partPlans[key]=plan;save();render();notice('Проверенная разметка сохранена.');}catch(error){notice(error.message);}
  }
  else if(action==='part-read'||action==='part-join'){
    if(state.settings.paused)return;const plan=state.partPlans[key];if(!plan)return;
    if(action==='part-read')plan.parts[+target.dataset.part].reads=Math.min(1000000,plan.parts[+target.dataset.part].reads+1);
    else plan.joined=Math.min(1000000,plan.joined+1);
    save();document.querySelector('#parts-workspace').remove();partWorkspace();
  }
});
main.addEventListener('input',event=>{
  if(event.target.id==='search'){search=event.target.value;document.querySelector('#surah-results').innerHTML=catalogRows();}
});
main.addEventListener('change',async event=>{
  const el=event.target,id=el.id;
  if(id==='ayah-select'){tab='study';location.hash=`surah/${activeSurah}/${el.value}`;return;}
  if(id==='catalog-order'){catalogOrder=el.value;render();return;}
  if(id==='chart-order'){chartOrder=el.value;render();return;}
  const numeric={target:['target',1,10000],'join-target':['joinTarget',1,10000],cycle:['cycle',1,365],minutes:['minutes',1,240]};
  if(numeric[id]){const[k,min,max]=numeric[id],n=Number(el.value);if(!Number.isInteger(n)||n<min||n>max){el.value=state.settings[k];notice(`Введите целое число от ${min} до ${max}.`);return;}state.settings[k]=n;if(k==='cycle')reschedule(state);save();render();return;}
  if(id==='paused'){state.settings.paused=el.checked;save();return;}
  if(id==='start-date'){if(!el.value||el.value>dayKey()){el.value=state.settings.startDate;notice('Выберите сегодняшнюю или прошедшую дату.');return;}state.settings.startDate=el.value;save();return;}
  if(id==='import'){
    const file=el.files?.[0];if(!file)return;
    try{if(file.size>5_000_000)throw Error('Файл больше 5 МБ.');const candidate=importBackup(await file.text(),surahs,texts);if(confirm('Заменить текущий прогресс данными этой копии? Перед заменой рекомендуется экспорт.')){voice.stop();try{persist(localStorage,candidate);}catch{throw Error('Хранилище недоступно: импорт не применён.');}state=candidate;storageBlocked=false;startupIssue='';render();notice('Резервная копия восстановлена.');}}
    catch(error){notice(`Импорт не выполнен: ${error.message}`);}finally{el.value='';}
  }
});
document.querySelector('#close-visual').onclick=()=>document.querySelector('#visual-dialog').close();
document.querySelector('#prev-visual').onclick=()=>showVisual(visualIndex-1);
document.querySelector('#next-visual').onclick=()=>showVisual(visualIndex+1);
document.querySelector('#visual-dialog').addEventListener('keydown',event=>{if(event.key==='ArrowLeft')showVisual(visualIndex-1);if(event.key==='ArrowRight')showVisual(visualIndex+1);});
window.addEventListener('hashchange',()=>{voice.stop();tab='study';hiddenArabic=false;hiddenMeaning=false;render();window.scrollTo(0,0);main.focus({preventScroll:true});});
window.addEventListener('storage',event=>{if(event.key===KEY){voice.stop();try{state=load(localStorage,surahs,texts);storageBlocked=false;startupIssue='';render();notice('Прогресс обновлён из другой вкладки.');}catch{storageBlocked=true;notice('Другая вкладка сохранила неподдерживаемые данные. Экспортируйте исходные данные в настройках.');}}});
async function init(){
  try{
    [surahs,{surahs:texts},chronology,history,translations,sources]=await Promise.all(['surahs','ayahs','revelation-order','historical-events','translations','sources'].map(async name=>{const response=await fetch(`data/${name}.json`);if(!response.ok)throw Error(`Не удалось загрузить ${name}`);return response.json();}));
    try{state=load(localStorage,surahs,texts);}catch{state=freshState();storageBlocked=true;startupIssue='Сохранённые данные повреждены или хранилище недоступно. Исходная запись не перезаписана. Экспортируйте её перед восстановлением.';}
    render();
    if('serviceWorker' in navigator)navigator.serviceWorker.register('./service-worker.js').catch(()=>notice('Офлайн-режим недоступен. Онлайн-функции работают.'));
  }catch(error){main.innerHTML=`<h1>Не удалось открыть данные</h1><p>${esc(error.message)}</p><p>Запустите через локальный HTTP-сервер или откройте опубликованный сайт. Проверьте интернет для первого открытия.</p>`;}
}
void init();
