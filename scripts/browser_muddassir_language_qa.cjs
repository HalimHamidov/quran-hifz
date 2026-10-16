async page => {
  const assert=(ok,msg)=>{if(!ok)throw Error(msg);};
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.reload();await page.locator('.language-open').first().waitFor();
  const data=await page.evaluate(async()=>await(await fetch('../../data/al-muddassir-language.json?v=1.0.0.18')).json());
  const results=[];
  for(const size of [{width:1280,height:720},{width:390,height:844}]){
    await page.setViewportSize(size);
    await page.locator('.language-open').first().click();
    for(let i=0;i<10;i++){
      for(const tab of ['words','grammar','forms','phrases','memory','tajweed']){
        await page.locator(`[data-lesson-tab="${tab}"]`).click();
        await page.evaluate(()=>document.fonts.ready);
        await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
        const fit=await page.evaluate(()=>{
          const modal=document.querySelector('#poster-modal'),stage=document.querySelector('#modal-poster'),sheet=stage.querySelector('.poster-sheet');
          const a=sheet.getBoundingClientRect(),b=stage.getBoundingClientRect();
          return {scroll:modal.scrollHeight-modal.clientHeight,fit:a.top>=b.top-2&&a.bottom<=b.bottom+2&&a.left>=b.left-2&&a.right<=b.right+2,scale:sheet.getBoundingClientRect().width/sheet.offsetWidth};
        });
        assert(fit.scroll<=2&&fit.fit,`${size.width} ayah${i+1} ${tab} fit ${JSON.stringify(fit)}`);
        if(tab==='words'){
          const words=await page.locator('.lesson-word .lesson-arabic').allTextContents();
          assert(JSON.stringify(words)===JSON.stringify(data.lessons[i].words.map(w=>w.arabic)),`exact source words ayah${i+1}`);
        }
        if(tab==='memory'){assert(await page.locator('.mnemonic-route button').count()===10,'ten linked route stages');assert(await page.locator('.mnemonic-anchors>div').count()===data.lessons[i].words.length,'all word anchors');}
        if(tab==='tajweed'){
          assert(await page.locator('.tajweed-rules article').count()===2,'two annotated reading rules');
          assert(await page.locator('.tajweed-rules mark').count()===2,'highlighted exact letters');
          await page.locator('[data-tajweed-reference]').click();
          assert(await page.locator('[data-tajweed-rule]').count()===4,'four noon/tanween rules');
          for(let rule=0;rule<4;rule++){await page.locator(`[data-tajweed-rule="${rule}"]`).click();assert(await page.locator('.tajweed-reference h3').textContent()===data.tajweed.reference[rule].name,'selected reference rule');}
          await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
          const ref=await page.locator('.language-sheet').evaluate(e=>({scale:e.getBoundingClientRect().width/e.offsetWidth,top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom}));
          assert(ref.scale>=0.75&&ref.top>=0&&ref.bottom<=size.height,`readable reference fits ${size.width} ${JSON.stringify(ref)}`);
          if(i===0)await page.screenshot({path:`output/playwright/tajweed-reference-${size.width}.png`});
          await page.locator('[data-tajweed-reference]').click();
        }
        if(tab==='phrases')assert(await page.locator('.lesson-examples article').count()===data.lessons[i].examples.length,'all phrases');
        if(i===5||i===7)await page.screenshot({path:`output/playwright/language-${size.width}-${tab}.png`});
        results.push({width:size.width,ayah:i+1,tab,scale:Math.round(fit.scale*100)});
      }
      await page.getByRole('button',{name:'Следующая →',exact:true}).click();
    }
    await page.getByRole('button',{name:'Карточка',exact:true}).click();
    assert(await page.locator('#modal-poster .source-translation').isVisible(),'original card still available');
    await page.keyboard.press('Escape');
  }
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
  await page.context().setOffline(true);await page.reload();
  await page.locator('.language-open').first().waitFor();await page.locator('.language-open').first().click();
  assert(await page.locator('.language-sheet').isVisible(),'lesson offline');
  await page.locator('[data-lesson-tab="memory"]').click();
  await page.locator('[data-mnemonic-ayah="8"]').click();
  assert((await page.locator('#modal-position').textContent())==='8 / 10','route jump offline');
  assert(await page.locator('[data-lesson-tab="memory"]').getAttribute('aria-pressed')==='true','route keeps mnemonic panel');
  await page.locator('[data-lesson-tab="tajweed"]').click();
  assert(await page.locator('.tajweed-stop').isVisible(),'stopping rules offline');
  await page.locator('[data-tajweed-reference]').click();
  assert(await page.locator('[data-tajweed-rule]').count()===4,'reference offline');
  await page.locator('[data-tajweed-reference]').click();
  await page.keyboard.press('Escape');await page.context().setOffline(false);
  assert(!errors.length,errors.join('; '));
  return {pass:'all10 lessons, all6 panels, exact27 source words, phrases, card toggle, mobile fit and offline',minimumScale:Math.min(...results.map(r=>r.scale)),smallest:results.filter(r=>r.scale<80)};
}
