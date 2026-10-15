async page => {
  await page.getByRole('link',{name:'Настройки и резервная копия',exact:true}).click();
  const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('quran-hifz:v1')));
  state.ayahs['74:1'].reads=9;
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('#import').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(state))});
  await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('восстановлена'));
  await page.reload();await page.locator('#import').waitFor({state:'attached'});
  if(await page.evaluate(()=>JSON.parse(localStorage.getItem('quran-hifz:v1')).ayahs['74:1'].reads)!==9)throw Error('backup import not persisted');
  const bad=structuredClone(state);bad.version=999;
  await page.locator('#import').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(bad))});
  await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('Импорт не выполнен'));
  if(await page.evaluate(()=>JSON.parse(localStorage.getItem('quran-hifz:v1')).ayahs['74:1'].reads)!==9)throw Error('bad backup changed saved state');
  const downloaded=page.waitForEvent('download');
  await page.getByRole('button',{name:'↓ Экспорт JSON',exact:true}).click();
  const file=await downloaded;
  if(!file.suggestedFilename().startsWith('quran-hifz-'))throw Error('export filename');
  await file.saveAs('output/playwright/export-qa.json');
  console.log('PASS validated import persists; bad version rejected atomically; JSON export downloads.');
}
