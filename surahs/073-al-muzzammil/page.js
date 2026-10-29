import { arabicHTML } from '../../assets/js/arabic.js?v=1.0.0.10';
import { languagePoster, sections } from './language.js?v=1.0.0.24';

const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const grid = document.querySelector('#card-grid');
const modal = document.querySelector('#poster-modal');
let content, verses, language, activeCard = 0, modalMode = 'poster', lessonTab = 'words';

function poster(card, index, full = false) {
  const image = `<img class="poster-photo" src="../../assets/images/${esc(card.image)}" alt="${esc(card.imageAlt)}" loading="${full || index < 3 ? 'eager' : 'lazy'}" width="1536" height="1024">`;
  return `<div class="poster-heading"><span>Аль-Муззаммиль</span><strong>73:${card.from}</strong></div>
    ${full ? image : `<button class="poster-open" data-card="${index}" aria-label="Открыть карточку ${card.from}: ${esc(card.title)}">${image}</button>`}
    <div class="card-body"><h3>${esc(card.title)}</h3><p class="arabic" lang="ar" dir="rtl">${arabicHTML(verses[card.from - 1].text, 73, card.from, esc)}</p>
    <small>Краткое пояснение по тафсиру ас-Саади · не перевод</small><p>${esc(card.note)}</p>
    <p class="memory-hook"><small>Опора памяти</small>${esc(card.hook)}</p>
    <div class="card-actions">${full ? '' : `<button data-card="${index}" data-mode="language">Арабский язык →</button>`}<a class="button" href="../../#surah/73/${card.from}">Слушать и учить →</a><a href="${esc(content.source)}" target="_blank" rel="noreferrer">Тафсир ↗</a></div></div>`;
}

function openCard(index, mode = modalMode) {
  activeCard = (index + content.cards.length) % content.cards.length;
  modalMode = mode;
  const card = content.cards[activeCard];
  document.querySelector('#modal-title').textContent = `73:${card.from} · ${card.title}`;
  modal.classList.toggle('language-mode', mode === 'language');
  document.querySelector('#show-poster').setAttribute('aria-pressed', String(mode === 'poster'));
  document.querySelector('#show-language').setAttribute('aria-pressed', String(mode === 'language'));
  document.querySelector('#modal-card').innerHTML = mode === 'language' ? languagePoster(language, verses[card.from - 1], lessonTab) : poster(card, activeCard, true);
  document.querySelector('#modal-position').textContent = `${activeCard + 1} / ${content.cards.length}`;
  if (!modal.open) modal.showModal();
  modal.scrollTop = 0;
  document.querySelector('#modal-card').scrollTop = 0;
}

grid.addEventListener('click', event => {
  const button = event.target.closest('button[data-card]');
  if (button) {
    lessonTab = 'words';
    openCard(Number(button.dataset.card), button.dataset.mode || 'poster');
  }
});
document.querySelector('#show-poster').onclick = () => openCard(activeCard, 'poster');
document.querySelector('#show-language').onclick = () => openCard(activeCard, 'language');
modal.addEventListener('click', event => {
  const button = event.target.closest('[data-lesson-tab]');
  if (!button || !sections.some(([key]) => key === button.dataset.lessonTab)) return;
  lessonTab = button.dataset.lessonTab;
  openCard(activeCard, 'language');
  modal.querySelector(`[data-lesson-tab="${lessonTab}"]`).focus({preventScroll:true});
});
document.querySelector('#close-modal').onclick = () => modal.close();
document.querySelector('#prev-card').onclick = () => openCard(activeCard - 1);
document.querySelector('#next-card').onclick = () => openCard(activeCard + 1);
modal.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    openCard(activeCard + (event.key === 'ArrowLeft' ? -1 : 1));
  }
});

try {
  const [data, quran, lessons, tajik] = await Promise.all(['al-muzzammil', 'ayahs', 'al-muzzammil-language', 'al-muzzammil-tajik'].map(async name => {
    const response = await fetch(`../../data/${name}.json`);
    if (!response.ok) throw Error(`Не удалось загрузить ${name}`);
    return response.json();
  }));
  content = data;
  language = lessons;
  language.tajik = tajik;
  verses = quran.surahs['73'];
  document.querySelector('#content-notice').textContent = content.notice;
  grid.innerHTML = content.cards.map((card, index) => `<article class="image-card" id="ayah-${card.from}">${poster(card, index)}</article>`).join('');
  if (/^#ayah-[1-5]$/.test(location.hash)) document.querySelector(location.hash)?.scrollIntoView();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('../../service-worker.js').catch(() => {});
} catch (error) {
  grid.innerHTML = `<p role="alert">${esc(error.message)}. Обновите страницу при доступном интернете.</p>`;
}
