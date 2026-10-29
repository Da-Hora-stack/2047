import { spawn } from 'node:child_process';
const url='http://localhost:3000';
console.log('Iniciando 2047: Rede Aurora. Mantenha esta janela aberta enquanto joga.');
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','3000'],{stdio:'inherit'});
let stopped=false;server.on('exit',code=>{stopped=true;process.exitCode=code||0;});
for(let attempt=0;attempt<90&&!stopped;attempt++){
 try{const response=await fetch(url);if(response.ok()){console.log(`Abra ${url}`);if(process.platform==='win32')spawn('cmd.exe',['/c','start','',url],{stdio:'ignore'}).unref();break;}}catch{}
 await new Promise(resolve=>setTimeout(resolve,500));
}
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{server.kill(signal);});
