@echo off
echo Iniciando servidor Backend FastAPI/Uvicorn...
REM Navega para o diretório backend e inicia o servidor
REM O comando START abrirá uma nova janela do console para o servidor backend
cd backend
START "Backend Server" cmd /k "python -m uvicorn app.main:app --reload --port 8000"
cd ..

echo.
echo Iniciando servidor Frontend Vite...
REM Navega para o diretório frontend e inicia o servidor
REM O comando START abrirá uma nova janela do console para o servidor frontend
cd frontend
START "Frontend Server" cmd /k "npm run dev -- --port 5173"
cd ..

echo.
echo Aguardando alguns segundos para os servidores iniciarem...
REM Timeout de 10 segundos (ajuste conforme necessário)
timeout /t 10 /nobreak >nul

echo.
echo Abrindo a interface web no navegador padrão...
REM Abre o navegador na URL do frontend
start http://localhost:5173

echo.
echo Os servidores Backend e Frontend foram iniciados em janelas separadas.
echo Para parar os servidores, feche suas respectivas janelas de console (ou pressione Ctrl+C nelas).
pause
