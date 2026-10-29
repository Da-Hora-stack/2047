import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
  const page=await browser.newPage({viewport:{width:960,height:540}});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('http://127.0.0.1:3100');const button=page.getByRole('button',{name:'01 Novo jogo'});await button.waitFor({state:'visible',timeout:60000});await page.waitForFunction(()=>!document.querySelector('.primary')?.disabled);await button.click();await page.getByTestId('speed').waitFor();await page.keyboard.down('KeyW');await page.waitForTimeout(8000);await page.keyboard.up('KeyW');
  const speed=Number(await page.getByTestId('speed').textContent());const debugAbsent=await page.evaluate(()=>!('__GAME_DEBUG__' in window));const response=await page.request.get('http://127.0.0.1:3100/api/game/config');
  const result={speedKmh:speed,debugAbsent,configStatus:response.status(),consoleErrors:errors,viewport:'960×540',rendering:'software / SwiftShader'};await page.screenshot({path:'evidence/production.png'});await writeFile('evidence/production.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(speed<=40||!debugAbsent||!response.ok()||errors.length)throw new Error('Smoke de produção falhou');
}finally{await browser.close();}
