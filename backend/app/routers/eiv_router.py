from fastapi import APIRouter, Body, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from typing import Dict

from app.models.eiv_models import EIVDocumentData, CapaData, IntroducaoData # Adicionando CapaData e IntroducaoData
from fastapi.responses import StreamingResponse
from weasyprint import HTML
import io
import httpx
import logging # Import logging

router = APIRouter(
    prefix="/eiv",
    tags=["EIV - Estudo de Impacto de Vizinhança"],
)

# Configurar templates Jinja2
# Supondo que o diretório 'templates' está em 'backend/app/templates'
templates = Jinja2Templates(directory="app/templates")

# Get a logger instance
logger = logging.getLogger(__name__)

# "Banco de dados" em memória para este exemplo inicial
# No futuro, isso será substituído por um banco de dados real.
eiv_data_storage: Dict[str, EIVDocumentData] = {}

@router.post("/gerar", response_model=EIVDocumentData)
async def criar_ou_atualizar_eiv(eiv_document: EIVDocumentData = Body(...)):
    project_id = eiv_document.capa.titulo_projeto.replace(" ", "_").lower()

    if eiv_document.introducao.localizacao_exata.latitude is not None and \
       eiv_document.introducao.localizacao_exata.longitude is not None:
        lat = eiv_document.introducao.localizacao_exata.latitude
        lng = eiv_document.introducao.localizacao_exata.longitude
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                meteo_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&current_weather=true"
                logger.info(f"Buscando dados climáticos de: {meteo_url}")
                response = await client.get(meteo_url)
                response.raise_for_status()
                weather_data = response.json()
                logger.info(f"Resposta da API climática: {weather_data}")
                if weather_data.get("current_weather") and \
                   isinstance(weather_data["current_weather"], dict) and \
                   weather_data["current_weather"].get("temperature") is not None:
                    eiv_document.introducao.localizacao_exata.temperatura_atual_celsius = weather_data["current_weather"]["temperature"]
                    eiv_document.introducao.localizacao_exata.weather_data_message = "Temperature successfully retrieved."
                else:
                    logger.warning("Temperatura não disponível na resposta da API climática ou estrutura inesperada.")
                    eiv_document.introducao.localizacao_exata.temperatura_atual_celsius = None
                    eiv_document.introducao.localizacao_exata.weather_data_message = "Could not retrieve weather data: Temperature not available in response."
        except httpx.HTTPStatusError as e:
            logger.error(f"Erro HTTP ao buscar dados climáticos: {e.response.text if e.response else 'Sem resposta'}")
            eiv_document.introducao.localizacao_exata.temperatura_atual_celsius = None
            eiv_document.introducao.localizacao_exata.weather_data_message = "Could not retrieve weather data: API error."
        except httpx.RequestError as e:
            logger.error(f"Erro de requisição ao buscar dados climáticos: {e}")
            eiv_document.introducao.localizacao_exata.temperatura_atual_celsius = None
            eiv_document.introducao.localizacao_exata.weather_data_message = "Weather data service unavailable."
        except Exception as e:
            logger.error(f"Erro inesperado ({type(e).__name__}) ao buscar dados climáticos: {e}")
            eiv_document.introducao.localizacao_exata.temperatura_atual_celsius = None
            eiv_document.introducao.localizacao_exata.weather_data_message = f"An unexpected error occurred: {type(e).__name__}."

    eiv_data_storage[project_id] = eiv_document
    return eiv_document

@router.post("/capa", response_model=CapaData)
async def submeter_dados_capa(capa_data: CapaData = Body(...)):
    # Lógica para processar/salvar apenas dados da capa, se necessário
    # Por enquanto, apenas retorna os dados recebidos
    print(f"Dados da capa recebidos: {capa_data.model_dump_json(indent=2)}")
    # Aqui você poderia adicionar a lógica para armazenar/atualizar
    # uma parte específica de um documento EIV existente.
    return capa_data

@router.post("/introducao", response_model=IntroducaoData)
async def submeter_dados_introducao(introducao_data: IntroducaoData = Body(...)):
    # Lógica para processar/salvar apenas dados da introdução
    print(f"Dados da introdução recebidos: {introducao_data.model_dump_json(indent=2)}")
    return introducao_data


@router.get("/{project_id}/visualizar", response_class=HTMLResponse)
async def visualizar_eiv_html(project_id: str):
    eiv_document = eiv_data_storage.get(project_id)
    if not eiv_document:
        raise HTTPException(status_code=404, detail="Documento EIV não encontrado")

    # Simplesmente passando o objeto de dados para o template.
    # O template precisará saber como acessar os campos.
    return templates.TemplateResponse("eiv_template_basico.html", {
        "request": {}, # request é necessário pelo Jinja2Templates
        "eiv": eiv_document.model_dump() # Passa o dicionário do modelo Pydantic
    })

@router.get("/{project_id}/download-pdf", response_class=StreamingResponse)
async def download_eiv_pdf(project_id: str):
    eiv_document = eiv_data_storage.get(project_id)
    if not eiv_document:
        raise HTTPException(status_code=404, detail="Documento EIV não encontrado para PDF")

    # Renderizar o template HTML com os dados do EIV
    html_content = templates.get_template("eiv_template_basico.html").render({
        "request": {},
        "eiv": eiv_document.model_dump()
    })

    # Converter HTML para PDF usando WeasyPrint
    # Adicionando uma URL base fictícia para resolver caminhos relativos se houver (ex: imagens, CSS no futuro)
    base_url_for_pdf = "file://app/templates/" # Ou o diretório de onde o HTML é "servido"
    pdf_bytes = HTML(string=html_content, base_url=base_url_for_pdf).write_pdf()

    pdf_stream = io.BytesIO(pdf_bytes)

    filename = f"eiv_{project_id}.pdf"

    return StreamingResponse(
        pdf_stream,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
