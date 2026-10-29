import { splitBasmala } from '../../assets/js/arabic.js?v=1.0.0.10';

const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const sections = [['words','Слова'],['grammar','Грамматика'],['forms','Формы слов'],['phrases','Фразы'],['memory','Мнемоника'],['tajweed','Таджвид']];

export function sourceWords(text, ayah) {
  return splitBasmala(text, 73, ayah).verse.split(/\s+/);
}

function dictionaryLinks(data, terms) {
  return terms.map(term => {
    const entry = data.dictionary[term];
    return `<a href="${esc(entry.source)}" target="_blank" rel="noreferrer" title="${esc(entry.meaning)}"><span lang="tg">${esc(term)}</span> · Vazhaju ↗</a>`;
  }).join(' · ');
}

function tajikMemory(data, lesson, words) {
  return `<section class="tajik-memory" aria-label="Таджикская мнемоника"><h3>Тоҷикӣ · опоры памяти</h3><p class="lesson-context" lang="tg">${esc(data.route)}</p><p class="tajik-scene" lang="tg">${esc(lesson.scene)}</p><div class="tajik-bridges">${lesson.bridges.map(bridge => `<article><small>${bridge.kind === 'cognate' ? 'Заимствование · общий арабский корень' : 'Смысловая подсказка'}</small><div class="word-top"><bdi class="lesson-arabic" lang="ar" dir="rtl">${esc(words[bridge.wordIndex])}</bdi><strong lang="tg">${bridge.terms.map(esc).join(' · ')}</strong></div>${bridge.root ? `<p>Корень <bdi lang="ar" dir="rtl">${esc(bridge.root)}</bdi></p>` : ''}<p>${esc(bridge.note)}</p><div class="dictionary-links">${dictionaryLinks(data, bridge.terms)}</div><details><summary>Словарные значения</summary>${bridge.terms.map(term => `<p><strong lang="tg">${esc(term)}</strong> — ${esc(data.dictionary[term].meaning)}</p>`).join('')}</details></article>`).join('')}</div><p class="lesson-notice">${esc(data.notice)} Проверено: ${esc(data.checkedAt)}.</p></section>`;
}

export function languagePoster(data, verse, section = 'words') {
  const lesson = data.lessons.find(item => item.ayah === verse.number);
  const words = sourceWords(verse.text, verse.number);
  if (!lesson || lesson.words.length !== words.length) throw Error('Языковой разбор не совпадает с аятом');
  const source = `https://corpus.quran.com/wordbyword.jsp?chapter=73&verse=${lesson.ayah}`;
  const tajik = data.tajik?.lessons.find(item => item.ayah === verse.number);
  if (tajik && tajik.words.length !== words.length) throw Error('Таджикские подсказки не совпадают с аятом');
  let panel;
  if (section === 'grammar') {
    panel = `<div class="lesson-rules"><h3>Как устроен язык</h3>${lesson.grammar.map((rule, i) => `<p><strong>${i + 1}.</strong> ${esc(rule)}</p>`).join('')}</div>`;
  } else if (section === 'forms') {
    panel = `<div class="lesson-forms"><h3>Формы и связи слов</h3>${lesson.family.map(item => `<div class="lesson-family"><bdi class="lesson-arabic" lang="ar" dir="rtl">${esc(item.arabic)}</bdi><p>${esc(item.meaning)}</p></div>`).join('')}<p class="lesson-context">Корень связывает семейство слов; модель и контекст определяют значение. Противоположные по смыслу слова могут иметь разные корни.</p></div>`;
  } else if (section === 'phrases') {
    panel = `<div class="lesson-examples">${lesson.examples.map(item => `<article><p class="lesson-arabic" lang="ar" dir="rtl">${esc(item.arabic)}</p><strong>${esc(item.meaning)}</strong><p>${esc(item.note)}</p></article>`).join('')}<p class="lesson-context">Учебные примеры на фусха. Они не являются аятами или толкованием Корана.</p></div>`;
  } else if (section === 'memory') {
    panel = `<div class="lesson-rules"><h3>Пять опор памяти</h3><p class="lesson-context">Покрывало → ночной коврик → песочные часы → книга на подставке → прочная опора.</p><p>${esc(lesson.memory)}</p><p class="lesson-arabic" lang="ar" dir="rtl">${esc(words.join(' '))}</p><small>Ассоциация помогает вспомнить порядок; правильное произношение проверяйте по чтению, а не по русской подсказке.</small></div>${tajik ? tajikMemory(data.tajik, tajik, words) : ''}`;
  } else if (section === 'tajweed') {
    panel = `<p class="lesson-context">${esc(data.tajweed.reading)}</p><div class="lesson-tajweed">${lesson.tajweed.rules.map(rule => `<article><h3>${esc(rule.name)}</h3><bdi class="lesson-arabic" lang="ar" dir="rtl">${esc(rule.example)}</bdi><p>${esc(rule.text)}</p></article>`).join('')}</div><p class="lesson-context"><strong>Остановка в конце аята.</strong> ${esc(lesson.tajweed.stop)}</p><p class="lesson-notice">${esc(data.tajweed.notice)}</p>`;
  } else {
    panel = `<div class="lesson-words">${lesson.words.map((word, i) => `<article class="lesson-word"><div class="word-top"><bdi class="lesson-arabic" lang="ar" dir="rtl">${esc(words[i])}</bdi><strong>${esc(word.meaning)}</strong></div>${tajik ? `<div class="tajik-gloss"><small>Тоҷикӣ</small><p lang="tg">${esc(tajik.words[i].text)}</p><div class="dictionary-links">${dictionaryLinks(data.tajik, tajik.words[i].refs)}</div></div>` : ''}<p><bdi class="lesson-parts" lang="ar" dir="rtl">${esc(word.parts)}</bdi>${word.root ? ` · корень <bdi lang="ar" dir="rtl">${esc(word.root)}</bdi>` : ''}</p><p>${esc(word.grammar)}</p><a href="https://corpus.quran.com/wordmorphology.jsp?location=(73:${lesson.ayah}:${i + 1})" target="_blank" rel="noreferrer">Морфология слова ↗</a></article>`).join('')}</div>${tajik ? `<p class="lesson-notice">${esc(data.tajik.notice)}</p>` : ''}`;
  }
  return `<section class="language-sheet" aria-label="Арабский язык, аят ${lesson.ayah}"><div class="lesson-heading"><div><small>Арабский язык · 73:${lesson.ayah}</small><h2>${esc(lesson.title)}</h2><p>${esc(lesson.focus)}</p></div><div class="lesson-tabs" role="group" aria-label="Раздел языкового разбора">${sections.map(([key, label]) => `<button data-lesson-tab="${key}" aria-pressed="${section === key}">${label}</button>`).join('')}</div></div><div class="lesson-panel">${panel}</div><div class="lesson-footer"><span>${esc(data.notice)}</span><a href="${esc(section === 'tajweed' ? data.tajweed.source : source)}" target="_blank" rel="noreferrer">${section === 'tajweed' ? 'Учебник таджвида' : 'Quranic Arabic Corpus'} ↗</a></div></section>`;
}
