async page => {
  await page.reload();await page.locator('.image-card').first().waitFor();
  await page.getByRole('button',{name:'Слушать блок 1',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('audio').readyState>=2,null,{timeout:30000});
  const other=await page.context().newPage();
  await other.goto(new URL('../../',page.url()).href);
  await other.getByRole('heading',{name:'Мой путь к хифзу Корана — 23 года',exact:true}).waitFor();
  await other.evaluate(()=>{
    const state=JSON.parse(localStorage.getItem('quran-hifz:v1'));
    state.ayahs={};state.joins={};state.reviewLog={};state.reviewAssignments={};state.reviewTotals={};state.partPlans={};
    localStorage.setItem('quran-hifz:v1',JSON.stringify(state));
  });
  await page.waitForFunction(()=>document.querySelector('audio').paused&&!document.querySelector('audio').getAttribute('src'));
  if((await page.locator('#memory-total').textContent())!=='0 / 19 аятов в памяти')throw Error('replacement state not rendered');
  await page.locator('audio').evaluate(el=>el.dispatchEvent(new Event('ended')));
  const ayahs=await page.evaluate(()=>JSON.parse(localStorage.getItem('quran-hifz:v1')).ayahs);
  if(Object.keys(ayahs).length)throw Error('old playback changed replacement state');
  await other.close();return 'PASS cross-tab replacement stops queued audio; old completion cannot contaminate reset state.';
}
