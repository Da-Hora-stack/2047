import { test,expect } from '@playwright/test';
import { mkdir,writeFile } from 'node:fs/promises';
const evidence=new URL('../../evidence/',import.meta.url);
test('aceite: mundo real, W por 8 s, diesel, console e orçamento',async({page},info)=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('/');const start=page.getByRole('button',{name:'01 Novo jogo'});await expect(start).toBeEnabled({timeout:60000});
  await mkdir(evidence,{recursive:true});await page.screenshot({path:new URL('menu.png',evidence).pathname});
  await start.click();await page.waitForFunction(()=>window.__GAME_DEBUG__?.getState().mode==='driving');await page.keyboard.press('KeyE');
  await page.evaluate(()=>window.__GAME_DEBUG__.resetMetrics());const before=await page.evaluate(()=>window.__GAME_DEBUG__.getState());
  await page.keyboard.down('KeyW');await page.waitForTimeout(8000);await page.keyboard.up('KeyW');
  const after=await page.evaluate(()=>window.__GAME_DEBUG__.getState());
  await page.screenshot({path:new URL('driving.png',evidence).pathname});
  const result={before,after,consoleErrors:errors,renderer:'Chromium / ANGLE SwiftShader (software)',viewport:'1280×720',durationSeconds:8};
  await writeFile(new URL('acceptance.json',evidence),JSON.stringify(result,null,2));console.log('ACEITE',JSON.stringify({speedKmh:after.speedKmh,fuelBefore:before.fuel,fuelAfter:after.fuel,averageFps:after.averageFps,drawCalls:after.drawCalls,triangles:after.triangles,consoleErrors:errors}));
  await info.attach('metrics',{body:JSON.stringify(result,null,2),contentType:'application/json'});
  expect(after.speedKmh).toBeGreaterThan(40);expect(after.fuel).toBeLessThan(before.fuel);expect(after.position[2]).toBeLessThan(before.position[2]-25);expect(after.averageFps).toBeGreaterThan(0);expect(after.sectors).toBe(9);expect(after.drawCalls).toBeLessThanOrEqual(300);expect(after.triangles).toBeLessThanOrEqual(500000);expect(errors).toEqual([]);
});
test('câmeras, motor, pausa, configurações e API',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled({timeout:60000});await page.getByRole('button',{name:'01 Novo jogo'}).click();await page.waitForFunction(()=>window.__GAME_DEBUG__?.getState().mode==='driving');await page.keyboard.press('KeyE');
  for(const camera of [1,2,0]){await page.keyboard.press('KeyC');await expect.poll(()=>page.evaluate(()=>window.__GAME_DEBUG__.getState().camera)).toBe(camera);if(camera===1){await page.waitForTimeout(600);await page.screenshot({path:new URL('cabin.png',evidence).pathname});}}
  await page.keyboard.press('KeyE');await expect.poll(()=>page.evaluate(()=>window.__GAME_DEBUG__.getState().engineOn)).toBe(false);const fuel=await page.evaluate(()=>window.__GAME_DEBUG__.fuel);await page.waitForTimeout(600);expect(await page.evaluate(()=>window.__GAME_DEBUG__.fuel)).toBe(fuel);
  await page.keyboard.press('KeyE');await page.keyboard.press('KeyL');await expect.poll(()=>page.evaluate(()=>window.__GAME_DEBUG__.getState().headlights)).toBe(true);
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toBeVisible();const p=await page.evaluate(()=>window.__GAME_DEBUG__.position);await page.keyboard.down('KeyW');await page.waitForTimeout(700);await page.keyboard.up('KeyW');expect(await page.evaluate(()=>window.__GAME_DEBUG__.position)).toEqual(p);
  await page.getByRole('button',{name:'Configurações',exact:true}).click();await page.getByRole('button',{name:'Baixo',exact:true}).click();expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('aurora-settings')).quality)).toBe('baixo');await page.getByRole('button',{name:'Voltar',exact:true}).last().click();await page.getByRole('button',{name:'Voltar à viagem'}).click();
  await expect.poll(()=>page.evaluate(()=>window.__GAME_DEBUG__.getState().mode)).toBe('driving');
  const res=await page.request.get('/api/game/config');expect(res.ok()).toBeTruthy();const config=await res.json();expect(config.phase).toBe(4);expect(config.seed).toBe(2047);
  await page.keyboard.press('Escape');await page.getByRole('button',{name:'Voltar ao menu'}).click();await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled();expect(errors).toEqual([]);
  await page.reload();await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled({timeout:60000});await page.getByRole('button',{name:'Configurações',exact:true}).click();await expect(page.getByRole('button',{name:'Baixo',exact:true})).toHaveAttribute('aria-pressed','true');
});
test('setores se renovam até as cidades e o objetivo mantém a primeira Semente',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await expect(page.getByRole('button',{name:'01 Novo jogo'})).toBeEnabled({timeout:60000});await page.getByRole('button',{name:'01 Novo jogo'}).click();
  await page.waitForFunction(()=>window.__GAME_DEBUG__?.getState().mode==='driving');await page.keyboard.press('KeyE');await page.evaluate(()=>window.__GAME_DEBUG__.teleport({x:0,z:-1800}));await expect.poll(()=>page.evaluate(()=>window.__GAME_DEBUG__.getState().sectorKeys.includes('0,-2'))).toBe(true);await expect.poll(()=>page.evaluate(()=>window.__GAME_DEBUG__.getState().sectors)).toBe(9);
  await page.evaluate(()=>window.__GAME_DEBUG__.teleport({x:15,z:-2970}));await expect(page.getByRole('heading',{name:'Fale com a sobrevivente no abrigo'})).toBeVisible();await page.evaluate(()=>window.__GAME_DEBUG__.teleport({x:0,z:-7000}));await expect.poll(()=>page.evaluate(()=>window.__GAME_DEBUG__.getState().region)).toBe('cities');await expect.poll(()=>page.evaluate(()=>window.__GAME_DEBUG__.getState().sectorKeys.includes('0,-7'))).toBe(true);await expect.poll(()=>page.evaluate(()=>window.__GAME_DEBUG__.getState().sectors)).toBe(9);await page.screenshot({path:new URL('road-end.png',evidence).pathname});expect(errors).toEqual([]);
});
