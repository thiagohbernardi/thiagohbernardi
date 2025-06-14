from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles # Se necessário para servir arquivos estáticos do backend
# from fastapi.templating import Jinja2Templates # Já está no router

from app.routers import eiv_router
from app.routers import abnt_router # Adicionar esta linha
import uvicorn
import os # Adicionar esta linha

app = FastAPI(
    title="EIV Generator API",
    description="API para gerar Estudos de Impacto de Vizinhança (EIV) e formatar documentos ABNT.", # Descrição atualizada
    version="0.1.0" # Poderia ser 0.2.0 com a nova funcionalidade
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
app.include_router(abnt_router.router)

# Montar um diretório para arquivos estáticos
# Construir o caminho para o diretório 'static' de forma robusta
# Assumindo que 'main.py' está em 'backend/app/main.py' e 'static' está em 'backend/app/static'
current_main_dir = os.path.dirname(os.path.realpath(__file__))
static_files_dir = os.path.join(current_main_dir, "static")

# Verificar se o diretório static existe antes de montar
if os.path.exists(static_files_dir) and os.path.isdir(static_files_dir):
    app.mount("/static", StaticFiles(directory=static_files_dir), name="static")
    print(f"Servindo arquivos estáticos de: {static_files_dir}")
else:
    print(f"ALERTA: Diretório estático não encontrado em {static_files_dir}. Arquivos estáticos não serão servidos.")


@app.get("/")
async def read_root():
    return {"message": "Bem-vindo à API do Gerador de EIV e Formatador ABNT"} # Mensagem atualizada

if __name__ == "__main__":
    # Esta parte é para rodar diretamente com 'python app/main.py', mas geralmente se usa 'uvicorn'
    uvicorn.run(app, host="0.0.0.0", port=8000)
