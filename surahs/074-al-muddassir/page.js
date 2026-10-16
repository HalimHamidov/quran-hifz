import { arabicHTML } from '../../assets/js/arabic.js';
import {load, persist, record, countRead, verifyAyah, freshState} from '../../assets/js/progress.js';
import {Recitation} from '../../assets/js/audio.js';

const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let content, translation, verses, allTexts, surahs, state, activeCard=0, blocked=false, toastTimer;
const grid=document.querySelector('#card-grid'), modal=document.querySelector('#poster-modal');
const voice=new Recitation(document.querySelector('#voice'),key=>{record(state,key).listens++;save();updateProgress();},message=>notice(message));
function notice(message){document.querySelector('#notice').textContent=message;clearTimeout(toastTimer);toastTimer=setTimeout(()=>document.querySelector('#notice').textContent='',6000);}
function save(){
  if(blocked){notice('Сохранение недоступно. Восстановите резервную копию в настройках основного тренажёра.');return false;}
  try{persist(localStorage,state);return true;}catch{notice('Не удалось сохранить прогресс. Сделайте экспорт в настройках тренажёра.');return false;}
}
function cardVerses(card){return verses.slice(card.from-1,card.to);}
function translationHTML(ayah){
  const entry=translation.entries.find(item=>ayah>=item.from&&ayah<=item.to);
  const range=entry.from===entry.to?`74:${entry.from}`:`74:${entry.from}–${entry.to}`;
  return `<div class="translation"><small>Перевод смыслов · ${range}</small><p class="source-translation">${esc(entry.text)}</p>${entry.footnoteNumber?`<sup><a href="${esc(entry.footnoteURL)}" target="_blank" rel="noreferrer">[${entry.footnoteNumber}]</a></sup>`:''}<a href="${esc(translation.source)}" target="_blank" rel="noreferrer">Шамиль Аляутдинов · Umma.ru ↗</a>${entry.from!==entry.to?'<small>В источнике аяты 8–9 переведены совместно; перевод сохранён целиком.</small>':''}${entry.footnote?`<details class="source-commentary"><summary>Комментарий Umma.ru [${entry.footnoteNumber}]</summary>${entry.footnote.split('\n\n').map(p=>`<p>${esc(p)}</p>`).join('')}${entry.bookURL?`<a href="${esc(entry.bookURL)}" target="_blank" rel="noreferrer">«Путь к вере и совершенству» ↗</a>`:''}</details>`:''}<div class="author-note"><small>Авторское пояснение · не перевод</small><p>${esc(entry.note)}</p></div></div>`;
}
function poster(card,index,full=false){
  const image=`../../assets/images/${esc(card.image)}`;
  return `<div class="poster-sheet"><div class="poster-heading"><small>Сура Аль-Муддассир</small><strong>Аят ${card.from}</strong></div>
  ${full?'<div class="poster-open">':`<button class="poster-open" data-action="open" data-card="${index}" aria-label="Открыть карточку ${index+1}: ${esc(card.title)}">`}<img class="poster-photo" src="${image}" alt="${esc(card.imageAlt)}" loading="${index<3?'eager':'lazy'}"><span class="block-number">${card.from}</span>${full?'</div>':'</button>'}
  ${cardVerses(card).map(v=>`<div class="verse"><span class="verse-reference">74:${v.number}</span><p class="arabic ${document.querySelector('#hide-arabic').checked?'hidden-text':''}" lang="ar" dir="rtl" ${document.querySelector('#hide-arabic').checked?'aria-hidden="true"':''}>${arabicHTML(v.text,74,v.number,esc)}</p>${translationHTML(v.number)}</div>`).join('')}
  <div class="memory-hook"><img class="memory-detail" src="${image}" alt="" loading="lazy"><div><strong>Ключевой смысл</strong><h3>${esc(card.keyword)}</h3><p>${esc(card.hook)}</p><small>Авторская подсказка, не перевод</small></div></div></div>`;
}
function render(){
  document.querySelector('#history-text').textContent=content.history;
  document.querySelector('#content-notice').textContent=content.notice;
  document.querySelector('#translation-link').href=content.translationURL;
  grid.innerHTML=content.cards.map((card,i)=>`<article class="image-card" data-card="${i}">${poster(card,i)}<details class="practice"><summary>Повторение и проверка аята ${card.from}</summary><div class="card-controls"><button data-action="listen" data-card="${i}" aria-label="Слушать аят ${card.from}">▶ Слушать</button><button data-action="count" data-card="${i}" ${state.settings.paused||blocked?'disabled':''} aria-label="Повторить аят ${card.from}">+1 аят</button><a class="button" href="../../#surah/74/${card.from}">Учить →</a></div><p class="card-status" id="status-${i}"></p><label class="verify-label"><input type="checkbox" id="verify-${i}" ${state.settings.paused||blocked?'disabled':''}>Аят прочитан без подсказки, таджвид проверен</label><div class="card-controls"><button data-action="verify" data-card="${i}" ${state.settings.paused||blocked?'disabled':''}>✓ Проверено</button><button data-action="stop" aria-label="Остановить аудио аята ${card.from}">■ Стоп</button></div></details></article>`).join('');
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
function openCard(index){
  activeCard=(index+content.cards.length)%content.cards.length;
  const card=content.cards[activeCard];
  document.querySelector('#modal-title').textContent=`${card.prayer} · Аяты ${card.from===card.to?card.from:`${card.from}–${card.to}`}`;
  document.querySelector('#modal-poster').innerHTML=poster(card,activeCard,true);
  document.querySelector('#modal-position').textContent=`${activeCard+1} / ${content.cards.length}`;
  if(!modal.open)modal.showModal();
  document.querySelector('#modal-poster').scrollIntoView({block:'nearest'});
}
grid.addEventListener('click',event=>{
  const target=event.target.closest('[data-action]');if(!target)return;
  const action=target.dataset.action,index=Number(target.dataset.card),card=content.cards[index];
  if(action==='open'){openCard(index);return;}
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
    [content,translation,{surahs:allTexts},surahs]=await Promise.all(['../../data/al-muddassir.json?v=1.0.0.8','../../data/al-muddassir-tafsir.json?v=1.0.0.8','../../data/ayahs.json','../../data/surahs.json'].map(async path=>{const r=await fetch(path);if(!r.ok)throw Error('Не удалось загрузить материалы суры.');return r.json();}));
    verses=allTexts['74'].slice(0,10);
    try{state=load(localStorage,surahs,allTexts);}catch{blocked=true;state=freshState();notice('Сохранённый прогресс недоступен. Исходные данные не перезаписаны; восстановите копию в настройках тренажёра.');}
    render();
    if('serviceWorker' in navigator)navigator.serviceWorker.register('../../service-worker.js').catch(()=>notice('Офлайн-режим недоступен; онлайн-функции работают.'));
  }catch(error){grid.innerHTML=`<p class="error">${esc(error.message)} Откройте сайт через HTTP или повторите загрузку.</p>`;}
}
void init();
