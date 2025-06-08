from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles # Se necessário para servir arquivos estáticos do backend
# from fastapi.templating import Jinja2Templates # Já está no router

from app.routers import eiv_router
import uvicorn

app = FastAPI(
    title="EIV Generator API",
    description="API para gerar Estudos de Impacto de Vizinhança (EIV)",
    version="0.1.0"
)

# Configurar CORS
# Ajuste 'origins' conforme necessário para o seu ambiente de desenvolvimento frontend
origins = [
    "http://localhost:5173",  # Porta padrão do Vite
    "http://127.0.0.1:5173", # Outra forma de acessar localhost
    "http://localhost:3000",  # Porta comum para create-react-app
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Permite todos os métodos (GET, POST, etc.)
    allow_headers=["*"], # Permite todos os cabeçalhos
)

# Incluir os routers
app.include_router(eiv_router.router)

# Montar um diretório para arquivos estáticos (ex: logotipos carregados), se necessário no futuro
# app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.get("/")
async def read_root():
    return {"message": "Bem-vindo à API do Gerador de EIV"}

if __name__ == "__main__":
    # Esta parte é para rodar diretamente com 'python app/main.py', mas geralmente se usa 'uvicorn'
    uvicorn.run(app, host="0.0.0.0", port=8000)
