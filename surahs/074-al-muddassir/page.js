import { arabicHTML } from '../../assets/js/arabic.js?v=1.0.0.10';
import {load, persist, record, countRead, verifyAyah, freshState} from '../../assets/js/progress.js';
import {Recitation} from '../../assets/js/audio.js';

const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let content, translation, verses, allTexts, surahs, state, activeCard=0, blocked=false, toastTimer;
let language, modalMode='poster', lessonTab='words', tajweedReference=false, tajweedRule=0;
const grid=document.querySelector('#card-grid'), modal=document.querySelector('#poster-modal');
const voice=new Recitation(document.querySelector('#voice'),key=>{record(state,key).listens++;save();updateProgress();},message=>notice(message));
function notice(message){document.querySelector('#notice').textContent=message;clearTimeout(toastTimer);toastTimer=setTimeout(()=>document.querySelector('#notice').textContent='',6000);}
function save(){
  if(blocked){notice('Сохранение недоступно. Восстановите резервную копию в настройках основного тренажёра.');return false;}
  try{persist(localStorage,state);return true;}catch{notice('Не удалось сохранить прогресс. Сделайте экспорт в настройках тренажёра.');return false;}
}
function cardVerses(card){return verses.slice(card.from-1,card.to);}
function translationHTML(ayah,full=false){
  const entry=translation.entries.find(item=>ayah>=item.from&&ayah<=item.to);
  const range=entry.from===entry.to?`74:${entry.from}`:`74:${entry.from}–${entry.to}`;
  return `<div class="translation"><small>Перевод смыслов · ${range}</small><p class="source-translation">${esc(entry.text)}</p>${entry.footnoteNumber?`<sup><a href="${esc(entry.footnoteURL)}" target="_blank" rel="noreferrer">[${entry.footnoteNumber}]</a></sup>`:''}<a href="${esc(translation.source)}" target="_blank" rel="noreferrer">Шамиль Аляутдинов · Umma.ru ↗</a>${entry.from!==entry.to?'<small>В источнике аяты 8–9 переведены совместно; перевод сохранён целиком.</small>':''}${entry.footnote&&!full?`<details class="source-commentary"><summary>Комментарий Umma.ru [${entry.footnoteNumber}]</summary>${entry.footnote.split('\n\n').map(p=>`<p>${esc(p)}</p>`).join('')}${entry.bookURL?`<a href="${esc(entry.bookURL)}" target="_blank" rel="noreferrer">«Путь к вере и совершенству» ↗</a>`:''}</details>`:''}<div class="author-note"><small>Авторское пояснение · не перевод</small><p>${esc(entry.note)}</p></div></div>`;
}
function poster(card,index,full=false){
  const image=`../../assets/images/${esc(card.image)}`;
  return `<div class="poster-sheet"><div class="poster-heading"><small>Сура Аль-Муддассир</small><strong>Аят ${card.from}</strong></div>
  ${full?'<div class="poster-open">':`<button class="poster-open" data-action="open" data-card="${index}" aria-label="Открыть карточку ${index+1}: ${esc(card.title)}">`}<img class="poster-photo" src="${image}" alt="${esc(card.imageAlt)}" loading="${index<3?'eager':'lazy'}"><span class="block-number">${card.from}</span>${full?'</div>':'</button>'}
  ${cardVerses(card).map(v=>`<div class="verse"><span class="verse-reference">74:${v.number}</span><p class="arabic ${document.querySelector('#hide-arabic').checked?'hidden-text':''}" lang="ar" dir="rtl" ${document.querySelector('#hide-arabic').checked?'aria-hidden="true"':''}>${arabicHTML(v.text,74,v.number,esc)}</p>${translationHTML(v.number,full)}</div>`).join('')}
  <div class="memory-hook"><img class="memory-detail" src="${image}" alt="" loading="lazy"><div><strong>Ключевой смысл</strong><h3>${esc(card.keyword)}</h3><p>${esc(card.hook)}</p><small>Авторская подсказка, не перевод</small></div></div></div>`;
}
function mnemonicPanel(lesson){
  const memory=language.memory,item=lesson.mnemonic;
  return `<div class="mnemonic-route" role="group" aria-label="Связная цепочка аятов 1–10">${memory.route.map(step=>`<button data-mnemonic-ayah="${step.ayah}" aria-pressed="${step.ayah===lesson.ayah}" title="${esc(step.meaning)}">${step.ayah}. ${esc(step.place)}</button>`).join('')}</div><div class="mnemonic-content"><section><h3>${esc(item.place)} → ${esc(item.meaning)}</h3><p><span class="memory-long">${esc(item.scene)}</span><span class="memory-short">${esc(item.sceneShort)}</span></p><p class="tajik-bridge"><span lang="tg">${esc(item.tajik)}</span> — ${esc(item.tajikMeaning)}<small>${esc(item.bridgeLabel)} · ${esc(item.bridgeNote)}${item.bridgeSource?` <a href="${esc(item.bridgeSource)}" target="_blank" rel="noreferrer">Словарь / источник ↗</a>`:''}</small></p></section><section class="mnemonic-anchors">${item.anchors.map(anchor=>`<div><span class="lesson-arabic" lang="ar" dir="rtl">${esc(lesson.words[anchor.wordIndex].arabic)}</span><p>${esc(anchor.cue)}</p></div>`).join('')}</section></div><p class="mnemonic-connection"><strong>${esc(memory.title)} · ${esc(memory.scope)}.</strong> <span class="memory-long">${esc(memory.connection)}</span><span class="memory-short">${esc(memory.shortConnection)}</span></p><p class="mnemonic-notice"><span class="memory-long">${esc(memory.notice)}</span><span class="memory-short">${esc(memory.shortNotice)}</span></p>`;
}
function tajweedPanel(lesson){
  const info=language.tajweed;
  const marked=rule=>{const word=lesson.words[rule.wordIndex].arabic,index=word.indexOf(rule.highlight);return esc(word.slice(0,index))+`<mark>${esc(rule.highlight)}</mark>`+esc(word.slice(index+rule.highlight.length));};
  return `<div class="tajweed-panel"><div class="tajweed-toolbar"><strong>${esc(info.reading)}</strong><button data-tajweed-reference aria-pressed="${tajweedReference}">${tajweedReference?'← В этом аяте':'Памятка: ихфа, идгам, изхар, икляб'}</button></div>${tajweedReference?`<div class="tajweed-choices" role="group" aria-label="Правила нун сакина и танвина">${info.reference.map((rule,i)=>`<button data-tajweed-rule="${i}" aria-pressed="${tajweedRule===i}">${esc(rule.name)}</button>`).join('')}</div><div class="tajweed-reference">${info.reference.filter((_,i)=>i===tajweedRule).map(rule=>`<article><h3>${esc(rule.name)}</h3><bdi class="lesson-arabic" lang="ar" dir="rtl">${esc(rule.letters)}</bdi><p>${esc(rule.text)}</p></article>`).join('')}</div>`:`<div class="tajweed-rules">${lesson.tajweed.rules.map(rule=>`<article><div><h3>${esc(rule.name)}</h3><bdi class="lesson-arabic" lang="ar" dir="rtl">${marked(rule)}</bdi></div><p>${esc(rule.text)}</p></article>`).join('')}</div><p class="tajweed-stop"><strong>Остановка в конце аята.</strong> ${esc(lesson.tajweed.stop)}</p>`}<p class="tajweed-notice">${esc(info.notice)} <a href="${esc(info.source)}" target="_blank" rel="noreferrer">Учебник таджвида ↗</a></p></div>`;
}
function languagePanel(lesson){
  if(lessonTab==='tajweed')return tajweedPanel(lesson);
  if(lessonTab==='memory')return mnemonicPanel(lesson);
  if(lessonTab==='words')return `<div class="lesson-words">${lesson.words.map(word=>`<article class="lesson-word"><div class="word-top"><span class="lesson-arabic" lang="ar" dir="rtl">${esc(word.arabic)}</span><strong>${esc(word.meaning)}</strong></div><p><bdi class="lesson-parts" lang="ar" dir="rtl">${esc(word.parts)}</bdi>${word.root?` · корень <bdi lang="ar" dir="rtl">${esc(word.root)}</bdi>`:''}</p><p>${esc(word.grammar)}</p><a href="${esc(word.source)}" target="_blank" rel="noreferrer">Морфология слова ↗</a></article>`).join('')}</div>`;
  if(lessonTab==='grammar')return `<div class="lesson-rules"><h3>Как устроен язык</h3>${lesson.grammar.map((rule,i)=>`<p><strong>${i+1}.</strong> ${esc(rule)}</p>`).join('')}</div>`;
  if(lessonTab==='forms')return `<div class="lesson-forms"><h3>Простое словообразование</h3>${lesson.family.map(item=>`<div class="lesson-family"><span class="lesson-arabic" lang="ar" dir="rtl">${esc(item.arabic)}</span><p>${esc(item.meaning)}</p></div>`).join('')}<p class="lesson-context">Корень объединяет семейство слов; модель и контекст определяют значение конкретной формы.</p></div>`;
  return `<div class="lesson-examples">${lesson.examples.map(example=>`<article><p class="lesson-arabic" lang="ar" dir="rtl">${esc(example.arabic)}</p><strong>${esc(example.meaning)}</strong><p>${esc(example.connection)}</p><small>Новые слова: ${esc(example.extra)}</small></article>`).join('')}<p class="lesson-context">${esc(lesson.nuance)}</p></div>`;
}
function languagePoster(ayah){
  const lesson=language.lessons.find(item=>item.ayah===ayah);
  return `<section class="poster-sheet language-sheet"><header class="lesson-heading"><div><small>Арабский язык · 74:${ayah}</small><h2>${esc(lesson.title)}</h2><p>${esc(lesson.focus)}</p></div><div class="lesson-tabs" role="group" aria-label="Раздел языкового разбора">${[['words','Слова'],['grammar','Грамматика'],['forms','Формы слов'],['phrases','Фразы'],['memory','Мнемоника'],['tajweed','Таджвид']].map(([key,label])=>`<button data-lesson-tab="${key}" aria-pressed="${lessonTab===key}">${label}</button>`).join('')}</div></header><div class="lesson-panel">${languagePanel(lesson)}</div><footer class="lesson-footer"><span>Авторский учебный разбор · фусха · примеры не являются аятами или тафсиром</span><a href="${esc(lessonTab==='tajweed'?language.tajweed.source:lesson.source)}" target="_blank" rel="noreferrer">${lessonTab==='tajweed'?'Учебник таджвида':'Quranic Arabic Corpus'} ↗</a></footer></section>`;
}
function render(){
  document.querySelector('#history-text').textContent=content.history;
  document.querySelector('#content-notice').textContent=content.notice;
  document.querySelector('#translation-link').href=content.translationURL;
  grid.innerHTML=content.cards.map((card,i)=>`<article class="image-card" data-card="${i}">${poster(card,i)}<button class="language-open" data-action="language" data-card="${i}">Арабский язык: слова и фразы →</button><details class="practice"><summary>Повторение и проверка аята ${card.from}</summary><div class="card-controls"><button data-action="listen" data-card="${i}" aria-label="Слушать аят ${card.from}">▶ Слушать</button><button data-action="count" data-card="${i}" ${state.settings.paused||blocked?'disabled':''} aria-label="Повторить аят ${card.from}">+1 аят</button><a class="button" href="../../#surah/74/${card.from}">Учить →</a></div><p class="card-status" id="status-${i}"></p><label class="verify-label"><input type="checkbox" id="verify-${i}" ${state.settings.paused||blocked?'disabled':''}>Аят прочитан без подсказки, таджвид проверен</label><div class="card-controls"><button data-action="verify" data-card="${i}" ${state.settings.paused||blocked?'disabled':''}>✓ Проверено</button><button data-action="stop" aria-label="Остановить аудио аята ${card.from}">■ Стоп</button></div></details></article>`).join('');
  if(state.settings.paused)grid.insertAdjacentHTML('afterbegin','<p class="error">Новое заучивание приостановлено. Чтение и аудио доступны; возобновить занятия можно в настройках тренажёра.</p>');
  updateProgress();
}
function updateProgress(){
  if(!state||!content)return;
  const known=verses.filter(v=>state.ayahs[`74:${v.number}`]?.learned).length;
  document.querySelector('#memory-total').textContent=`${known} / 10 аятов в памяти`;
  content.cards.forEach((card,index)=>{
    const records=cardVerses(card).map(v=>state.ayahs[`74:${v.number}`]||{reads:0,listens:0,learned:false});
    document.querySelector(`#status-${index}`).textContent=`Каждый аят: минимум ${Math.min(...records.map(r=>r.reads))} / ${state.settings.target} повторений · прослушиваний ${records.reduce((sum,r)=>sum+r.listens,0)} · проверено ${records.filter(r=>r.learned).length}/${records.length}`;
  });
}
function fitPoster(){
  if(!modal.open)return;
  const stage=document.querySelector('#modal-poster'),sheet=stage.querySelector('.poster-sheet');
  if(!sheet)return;
  sheet.style.width=`${Math.max(1,stage.clientWidth-12)}px`;
  const scale=Math.min(1,(stage.clientHeight-12)/sheet.offsetHeight);
  sheet.style.transform=`translate(-50%,-50%) scale(${Math.max(0.01,scale)})`;
}
window.addEventListener('resize',()=>requestAnimationFrame(fitPoster));
document.fonts.ready.then(()=>requestAnimationFrame(fitPoster));
function openCard(index,mode=modalMode){
  modalMode=mode;
  activeCard=(index+content.cards.length)%content.cards.length;
  const card=content.cards[activeCard];
  document.querySelector('#modal-title').textContent=`Аль-Муддассир · Аят ${card.from}`;
  document.querySelector('#modal-poster').innerHTML=modalMode==='language'?languagePoster(card.from):poster(card,activeCard,true);
  document.querySelector('#show-poster').setAttribute('aria-pressed',String(modalMode==='poster'));
  document.querySelector('#show-language').setAttribute('aria-pressed',String(modalMode==='language'));
  document.querySelector('#modal-position').textContent=`${activeCard+1} / ${content.cards.length}`;
  if(!modal.open)modal.showModal();
  requestAnimationFrame(fitPoster);
  document.querySelector('#modal-poster .poster-photo')?.addEventListener('load',fitPoster,{once:true});
}
grid.addEventListener('click',event=>{
  const target=event.target.closest('[data-action]');if(!target)return;
  const action=target.dataset.action,index=Number(target.dataset.card),card=content.cards[index];
  if(action==='open'){openCard(index,'poster');return;}
  if(action==='language'){openCard(index,'language');return;}
  if(action==='stop'){voice.stop();return;}
  if(action==='listen'){
    if(blocked){notice('Аудио доступно в тренажёре; сначала восстановите повреждённый прогресс, чтобы сохранить счётчики.');return;}
    void voice.play(74,card.from,card.to,1,2,1,'muallim');return;
  }
  if(blocked||state.settings.paused)return;
  state.settings.currentSurah=74;state.settings.currentAyah=card.from;
  if(action==='count'){cardVerses(card).forEach(v=>countRead(state,`74:${v.number}`));save();updateProgress();}
  if(action==='verify'){
    if(!document.querySelector(`#verify-${index}`).checked){notice('Подтвердите, что весь блок прочитан без подсказки и таджвид проверен.');return;}
    cardVerses(card).forEach(v=>verifyAyah(state,`74:${v.number}`));
    if(save())notice('Проверенные аяты добавлены в общий фонд муроджаа.');
    updateProgress();
  }
});
document.querySelector('#hide-arabic').addEventListener('change',event=>{
  document.querySelectorAll('.arabic').forEach(el=>{el.classList.toggle('hidden-text',event.target.checked);if(event.target.checked)el.setAttribute('aria-hidden','true');else el.removeAttribute('aria-hidden');});
});
document.querySelector('#show-poster').onclick=()=>openCard(activeCard,'poster');
document.querySelector('#show-language').onclick=()=>openCard(activeCard,'language');
modal.addEventListener('click',event=>{const ruleButton=event.target.closest('[data-tajweed-rule]');if(ruleButton){tajweedRule=Number(ruleButton.dataset.tajweedRule);openCard(activeCard,'language');modal.querySelector(`[data-tajweed-rule="${tajweedRule}"]`).focus();return;}if(event.target.closest('[data-tajweed-reference]')){tajweedReference=!tajweedReference;openCard(activeCard,'language');modal.querySelector('[data-tajweed-reference]').focus();return;}const step=event.target.closest('[data-mnemonic-ayah]');if(step){openCard(Number(step.dataset.mnemonicAyah)-1,'language');modal.querySelector(`[data-mnemonic-ayah="${step.dataset.mnemonicAyah}"]`).focus();return;}const target=event.target.closest('[data-lesson-tab]');if(!target)return;lessonTab=target.dataset.lessonTab;openCard(activeCard,'language');modal.querySelector(`[data-lesson-tab="${lessonTab}"]`).focus();});
document.querySelector('#close-modal').onclick=()=>modal.close();
document.querySelector('#prev-card').onclick=()=>openCard(activeCard-1);
document.querySelector('#next-card').onclick=()=>openCard(activeCard+1);
modal.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();openCard(activeCard-1);}if(event.key==='ArrowRight'){event.preventDefault();openCard(activeCard+1);}});
window.addEventListener('pagehide',()=>voice.stop());
window.addEventListener('storage',event=>{
  if(event.key!=='quran-hifz:v1'||!surahs)return;
  voice.stop();
  try{state=load(localStorage,surahs,allTexts);blocked=false;render();}catch{blocked=true;notice('Прогресс в другой вкладке повреждён. Сохранение остановлено.');}
});
async function init(){
  try{
    [content,translation,{surahs:allTexts},surahs,language]=await Promise.all(['../../data/al-muddassir.json?v=1.0.0.10','../../data/al-muddassir-tafsir.json?v=1.0.0.10','../../data/ayahs.json','../../data/surahs.json','../../data/al-muddassir-language.json?v=1.0.0.18'].map(async path=>{const r=await fetch(path);if(!r.ok)throw Error('Не удалось загрузить материалы суры.');return r.json();}));
    verses=allTexts['74'].slice(0,10);
    try{state=load(localStorage,surahs,allTexts);}catch{blocked=true;state=freshState();notice('Сохранённый прогресс недоступен. Исходные данные не перезаписаны; восстановите копию в настройках тренажёра.');}
    render();
    if('serviceWorker' in navigator)navigator.serviceWorker.register('../../service-worker.js').catch(()=>notice('Офлайн-режим недоступен; онлайн-функции работают.'));
  }catch(error){grid.innerHTML=`<p class="error">${esc(error.message)} Откройте сайт через HTTP или повторите загрузку.</p>`;}
}
void init();
