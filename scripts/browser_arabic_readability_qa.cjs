async page => {
  const assert=(ok,msg)=>{if(!ok)throw Error(msg);};
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const base=new URL('../../',page.url()).href;
  await page.goto(base+'#surah/74/1');
  await page.locator('#verse-text .quran-readable').waitFor();
  await page.evaluate(()=>document.fonts.ready);
  const data=await page.evaluate(async()=> (await (await fetch('data/ayahs.json')).json()).surahs['74']);
  for(let i=1;i<=10;i++){
    await page.goto(base+`#surah/74/${i}`);
    await page.locator('#verse-text .quran-readable').waitFor();
    const result=await page.locator('#verse-text .quran-readable').evaluate(el=>({text:el.querySelector('.basmala')?[el.querySelector('.basmala').textContent,el.querySelector('.ayah-body').textContent].join(' '):el.textContent,font:getComputedStyle(el).fontFamily,loaded:document.fonts.check('48px "Scheherazade New"'),overflow:el.scrollWidth-el.clientWidth}));
    assert(result.text===data[i-1].text,`74:${i} exact Arabic including marks`);
    assert(result.font.includes('Scheherazade New')&&result.loaded&&result.overflow<=1,`74:${i} real readable font loaded without overflow`);
    if(i===1)await page.locator('.study').screenshot({path:'output/playwright/arabic-readable-trainer.png'});
  }
  await page.goto(base+'surahs/074-al-muddassir/');
  await page.locator('.quran-readable').first().waitFor();
  await page.evaluate(()=>document.fonts.ready);
  assert(await page.locator('#card-grid .quran-readable').count()===10,'all10 cards use new font');
  const contact=await page.context().newPage();
  await contact.setViewportSize({width:1280,height:1200});
  await contact.setContent(`<html><head><link rel="stylesheet" href="${base}assets/css/quran-readable.css?v=1.0.0.10"></head><body style="background:#f2e6d1;display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:20px">${data.slice(0,10).map((v,i)=>`<div class="arabic" style="border-bottom:1px solid #bfa97a;padding:16px;font-size:34px;direction:rtl;text-align:right"><small style="font:14px Arial">74:${i+1}</small><div class="quran-readable">${v.text}</div></div>`).join('')}</body></html>`);
  await contact.evaluate(()=>document.fonts.ready);
  await contact.screenshot({path:'output/playwright/arabic-readable-all10.png',fullPage:true});await contact.close();
  await page.setViewportSize({width:390,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile no overflow');
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
  await page.context().setOffline(true);await page.reload();
  await page.locator('.quran-readable').first().waitFor();await page.evaluate(()=>document.fonts.ready);
  assert(await page.evaluate(()=>document.fonts.check('48px "Scheherazade New"')),'font works offline');
  await page.context().setOffline(false);
  assert(!errors.length,errors.join('; '));
  return 'PASS: all10 exact Arabic including marks; real font loaded in trainer/cards; mobile and offline font; no JS errors.';
}
