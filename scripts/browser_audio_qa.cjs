async page => {
  await page.reload();await page.locator('#verse-text').waitFor();
  await page.getByRole('spinbutton',{name:'Пауза, с',exact:true}).fill('0');
  const before=Number(await page.locator('#listen-count').textContent());
  await page.getByRole('button',{name:'▶ Слушать аят',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('audio').readyState>=2,{timeout:30000});
  const actual=await page.locator('audio').evaluate(el=>({url:el.currentSrc,duration:el.duration,paused:el.paused,preservesPitch:el.preservesPitch}));
  if(actual.paused||!actual.preservesPitch||!Number.isFinite(actual.duration))throw Error(JSON.stringify(actual));
  await page.waitForFunction(count=>Number(document.querySelector('#listen-count').textContent)>count,before,{timeout:60000});
  await page.getByRole('button',{name:'■ Стоп',exact:true}).click();
  await page.getByRole('link',{name:'Настройки и резервная копия',exact:true}).click();
  await page.getByRole('checkbox',{name:'Приостановить только новое заучивание'}).uncheck();
  await page.goto('http://127.0.0.1:4175/quran-hifz/#surah/74/2');
  await page.locator('#parts-workspace').waitFor();
  await page.getByText('Добавить проверенную разметку',{exact:true}).click();
  const original=await page.locator('#parts-input').inputValue();
  const split=original.indexOf(' ');
  await page.getByRole('textbox',{name:'Проверенные части аята',exact:true}).fill(original.slice(0,split)+'\n'+original.slice(split+1));
  await page.getByRole('checkbox',{name:'Учитель проверил допустимость этих остановок и начала чтения',exact:true}).check();
  await page.getByRole('button',{name:'Сохранить разметку',exact:true}).click();
  if(await page.getByRole('button',{name:'+1 часть',exact:true}).count()!==2)throw Error('two parts expected');
  await page.getByRole('button',{name:'+1 часть',exact:true}).first().click();
  await page.reload();await page.locator('#parts-workspace').waitFor();
  if(!(await page.locator('#parts-workspace').textContent()).includes('1 / 100'))throw Error('part count not persisted');
  console.log('PASS actual MP3 decode/play/ended count and teacher-attested part counters after reload',actual);
}
