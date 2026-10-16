async page => {
  const assert=(ok,msg)=>{if(!ok)throw Error(msg);};
  await page.reload();await page.locator('.image-card').first().waitFor();
  await page.evaluate(()=>document.fonts.ready);
  const results=[];
  for(const size of [{width:1920,height:1080},{width:1280,height:720},{width:390,height:844}]){
    await page.setViewportSize(size);
    await page.locator('[data-action="open"]').first().click();
    for(let i=1;i<=10;i++){
      await page.locator('#modal-poster .poster-photo').evaluate(im=>im.decode());
      await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      const check=await page.evaluate(()=>{
        const modal=document.querySelector('#poster-modal'),stage=document.querySelector('#modal-poster'),sheet=stage.querySelector('.poster-sheet');
        const a=sheet.getBoundingClientRect(),b=stage.getBoundingClientRect();
        return {scroll:modal.scrollHeight-modal.clientHeight,fit:a.top>=b.top-2&&a.bottom<=b.bottom+2&&a.left>=b.left-2&&a.right<=b.right+2,width:a.width,height:a.height};
      });
      assert(check.scroll<=2&&check.fit,`${size.width}x${size.height} ayah ${i}: ${JSON.stringify(check)}`);
      assert(await page.locator('#modal-poster .source-translation').isVisible(),'translation visible');
      if(i===6)await page.screenshot({path:`output/playwright/muddassir-fit-${size.width}.png`});
      await page.getByRole('button',{name:'Следующая →',exact:true}).click();
    }
    await page.keyboard.press('Escape');results.push(`${size.width}x${size.height}: all10 fit`);
  }
  return results.join('; ');
}
