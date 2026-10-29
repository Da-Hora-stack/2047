import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./tests/e2e',timeout:90000,workers:1,fullyParallel:false,
  reporter:[['list'],['html',{open:'never'}]],
  use:{baseURL:'http://127.0.0.1:3000',viewport:{width:1280,height:720},headless:true,trace:'retain-on-failure',launchOptions:{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']}},
  webServer:{command:'npm run dev',url:'http://127.0.0.1:3000',reuseExistingServer:!process.env.CI,timeout:120000,env:{NEXT_TELEMETRY_DISABLED:'1'}},
});
