@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Instale o Node.js LTS em https://nodejs.org e abra este arquivo novamente.
  pause
  exit /b 1
)
node -e "const [a,b]=process.versions.node.split('.').map(Number);process.exit(a>20||(a===20&&b>=9)?0:1)"
if errorlevel 1 (
  echo Atualize o Node.js para a versao LTS atual.
  pause
  exit /b 1
)
if not exist node_modules (
  call npm ci
  if errorlevel 1 goto erro
)
call npm run db:migrate
if errorlevel 1 goto erro
node scripts/launch-local.js
if errorlevel 1 goto erro
exit /b 0
:erro
 echo Nao foi possivel iniciar. Copie o erro exibido acima para receber ajuda.
 pause
 exit /b 1
