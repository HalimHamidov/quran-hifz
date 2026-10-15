import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { freshState, countRead, record, verifyAyah, importBackup, persist, load, dateAfter, dayNumber, compactHistory } from '../assets/js/progress.js';
import { nextAyah, joinReady, addJoin, markError } from '../assets/js/hifz.js';
import { learnedPool, distribute, reviewPlan, completeReview, reschedule } from '../assets/js/murajaah.js';
import { audioURL, Recitation } from '../assets/js/audio.js';
import { orderedSurahs } from '../assets/js/history.js';
import { createParts, validateParts } from '../assets/js/parts.js';
const surahs=JSON.parse(fs.readFileSync(new URL('../data/surahs.json',import.meta.url)));
const {surahs:texts}=JSON.parse(fs.readFileSync(new URL('../data/ayahs.json',import.meta.url)));
const make=()=>{const state=freshState();state.settings.reviewAnchor='2026-10-15';return state;};
test('114 surahs / 6236 ayahs; canonical and chronological permutations',()=>{
  assert.equal(surahs.length,114);assert.equal(surahs.reduce((n,s)=>n+s.count,0),6236);
  for(const s of surahs){assert.equal(texts[s.id].length,s.count);assert.ok(texts[s.id].every((v,i)=>v.number===i+1&&/[\u0600-\u06ff]/.test(v.text)));}
  assert.deepEqual(orderedSurahs(surahs,'historical',[]).slice(0,5).map(s=>s.id),[96,68,73,74,1]);
  assert.deepEqual(orderedSurahs(surahs,'personal',[96,74,68,73,1]).slice(0,5).map(s=>s.id),[96,74,68,73,1]);
  assert.equal(new Set(surahs.map(s=>s.order)).size,114);
});
test('100 reads never mark learned; listening and joining remain independent',()=>{
  const state=make();countRead(state,'74:1',100);record(state,'74:1').listens=3;
  assert.equal(state.ayahs['74:1'].learned,false);assert.equal(state.ayahs['74:1'].reads,100);
  verifyAyah(state,'74:1','2026-10-15');verifyAyah(state,'74:2','2026-10-15');
  assert.equal(joinReady(state,74,2),true);addJoin(state,'74:2');assert.equal(state.joins['74:2'],1);
  assert.equal(state.ayahs['74:1'].listens,3);assert.equal(nextAyah(state,74,56),3);
});
test('review includes old and recent learned material despite new-learning pause',()=>{
  const state=make();state.settings.paused=true;
  for(let a=1;a<=19;a++)verifyAyah(state,`96:${a}`,'2020-01-01');
  verifyAyah(state,'74:1','2026-10-15');
  const plan=reviewPlan(state,texts,'2026-10-16');assert.equal(plan.pool.length,20);
  assert.ok(plan.tasks.some(t=>t.key==='74:1'));assert.ok(plan.tasks.some(t=>t.key==='96:1'));
});
test('length-weighted distribution preserves every ayah exactly once and in order',()=>{
  const pool=Array.from({length:140},(_,i)=>({key:`k${i}`,weight:i%13===0?700:10+i}));
  const bins=distribute(pool,7);assert.deepEqual(bins.flat(),pool);assert.equal(bins.length,7);
  assert.notEqual(bins[0].length,bins[1].length);
  for(const days of [1,14,30,365])assert.deepEqual(distribute(pool,days).flat(),pool);
  assert.throws(()=>distribute(pool,0));assert.deepEqual(distribute([],7).flat(),[]);
});
test('new verified ayahs enter future plans; new cycles rotate automatically',()=>{
  const state=make();verifyAyah(state,'74:1','2026-10-15');
  assert.equal(reviewPlan(state,texts,'2026-10-22').cycle,2);
  verifyAyah(state,'74:2','2026-10-16');assert.equal(learnedPool(state,texts).length,2);
  const before=JSON.stringify(state.ayahs);reschedule(state,'2026-10-25');
  assert.equal(reviewPlan(state,texts,'2026-10-25').day,0);assert.equal(JSON.stringify(state.ayahs),before);
});
test('missed interval checks are paced to time budget, not piled into a giant task',()=>{
  const state=make();state.settings.cycle=30;state.settings.minutes=5;
  for(let a=1;a<=286;a++)verifyAyah(state,`2:${a}`,'2020-01-01');
  const plan=reviewPlan(state,texts,'2026-10-15');
  assert.equal(plan.pool.length,286);assert.ok(plan.deferred>0);assert.ok(plan.tasks.length<286);
  reschedule(state,'2026-11-15');assert.equal(reviewPlan(state,texts,'2026-11-15').pool.length,286);
});
test('completing the daily budget never pulls deferred backlog into today',()=>{
  const state=make();state.settings.cycle=30;state.settings.minutes=5;
  for(let a=1;a<=286;a++)verifyAyah(state,`2:${a}`,'2020-01-01');
  const initial=reviewPlan(state,texts,'2026-10-15');assert.ok(initial.deferred>0);
  for(const task of initial.tasks)completeReview(state,task.key,true,'2026-10-15');
  const after=reviewPlan(state,texts,'2026-10-15');
  assert.deepEqual(after.tasks.map(x=>x.key),initial.tasks.map(x=>x.key));
  assert.equal(after.pending.length,0);assert.equal(after.done.length,initial.tasks.length);
  assert.equal(after.minutes,initial.minutes);assert.ok(after.deferred>0);
  assert.deepEqual(importBackup(JSON.stringify(state),surahs,texts),state);
});
test('spaced checks follow 1/3/7/14/30 days; early cycle review does not advance interval',()=>{
  const state=make();verifyAyah(state,'74:1','2026-10-15');const r=state.ayahs['74:1'];
  assert.equal(r.due,'2026-10-16');completeReview(state,'74:1',true,'2026-10-15');assert.equal(r.due,'2026-10-16');
  for(const [date,next] of [['2026-10-16','2026-10-19'],['2026-10-19','2026-10-26'],['2026-10-26','2026-11-09'],['2026-11-09','2026-12-09']]){completeReview(state,'74:1',true,date);assert.equal(r.due,next);}
  const reviews=r.reviews;completeReview(state,'74:1',true,'2026-11-09');assert.equal(r.reviews,reviews);
  completeReview(state,'74:1',false,'2026-11-10');assert.equal(r.due,'2026-11-11');assert.equal(r.errors,1);
  markError(state,'74:1','2026-11-10');assert.equal(r.due,'2026-11-10');
});
test('state survives storage and backup roundtrip; corrupt imports rejected without mutation',()=>{
  const state=make();verifyAyah(state,'74:56','2026-10-15');countRead(state,'74:56',14);state.joins['74:56']=3;
  let raw=null;const storage={getItem:()=>raw,setItem:(_,v)=>{raw=v;}};persist(storage,state);
  assert.deepEqual(load(storage,surahs),state);assert.deepEqual(importBackup(raw,surahs),state);
  for(const mutate of [s=>s.version=2,s=>s.settings.cycle=0,s=>s.ayahs['74:57']=s.ayahs['74:56'],s=>s.ayahs['74:56'].reads=-1,s=>s.ayahs['74:56'].due='2026-02-31',s=>s.settings.paused='false',s=>s.reviewLog['bad']=['74:1']]){
    const bad=structuredClone(state);mutate(bad);assert.throws(()=>importBackup(JSON.stringify(bad),surahs));
  }
  assert.equal(state.ayahs['74:56'].reads,14);
});
test('calendar math ignores DST and crosses month/year boundaries',()=>{
  assert.equal(dateAfter('2026-12-31',1),'2027-01-01');assert.equal(dateAfter('2028-02-28',1),'2028-02-29');
  assert.equal(dayNumber('2026-10-26')-dayNumber('2026-10-25'),1);
});
test('long-term journal compaction retains every learned ayah and daily totals within storage budget',()=>{
  const state=make();
  for(const s of surahs)for(let a=1;a<=s.count;a++)verifyAyah(state,`${s.id}:${a}`,'2003-10-15');
  const keys=Object.keys(state.ayahs);
  for(let day=0;day<23*365;day++) {
    const date=dateAfter('2003-10-15',day);
    state.reviewLog[date]=keys;state.reviewAssignments[date]=keys;
  }
  compactHistory(state,'2026-10-15');
  assert.equal(learnedPool(state,texts).length,6236);
  assert.equal(state.reviewTotals['2003-10-15'],6236);
  assert.equal(state.reviewLog['2003-10-15'],undefined);
  assert.ok(Object.keys(state.reviewAssignments).length<=2);
  assert.ok(JSON.stringify(state).length<2_000_000);
});
test('teacher-supplied parts retain verbatim source; missing, reordered, changed text rejected',()=>{
  const original=texts['74'][1].text;
  const space=original.indexOf(' '),input=original.slice(0,space)+'\n'+original.slice(space+1);
  const plan=createParts(original,input,'2026-10-15');assert.equal(validateParts(plan,original),true);
  const state=make();state.partPlans['74:2']=plan;plan.parts[0].reads=15;
  assert.deepEqual(importBackup(JSON.stringify(state),surahs,texts),state);
  assert.throws(()=>createParts(original,'wrong\nparts','2026-10-15'));
  assert.throws(()=>createParts(original,original,'2026-10-15'));
  plan.parts[1].start++;assert.equal(validateParts(plan,original),false);
  assert.throws(()=>importBackup(JSON.stringify(state),surahs,texts));
});
test('audio uses verified provider paths, counts ended tracks only, and cancels queues',async()=>{
  assert.equal(audioURL(74,1),'https://everyayah.com/data/Husary_Muallim_128kbps/074001.mp3');
  let listens=0,status='';const el={pause(){},load(){},removeAttribute(){},play:async()=>{}};
  const voice=new Recitation(el,()=>listens++,message=>status=message);
  const promise=voice.play(74,1,2,2,0,1,'muallim');await Promise.resolve();
  assert.equal(listens,0);el.onended();await new Promise(r=>setTimeout(r,10));assert.equal(listens,1);
  voice.stop();await promise;assert.equal(listens,1);assert.equal(el.onended,null);assert.equal(status,'Аудио остановлено.');
});
test('audio rejects unavailable track and does not count it',async()=>{
  let listens=0,status='';const el={pause(){},load(){},removeAttribute(){},play:async()=>{}};
  const voice=new Recitation(el,()=>listens++,message=>status=message);
  const promise=voice.play(74,1,1,1,0,1,'muallim');el.onerror();await promise;
  assert.equal(listens,0);assert.match(status,/недоступна/);
});
