import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock

# Adjust the import path according to your project structure
# Assuming 'app.main.app' is the FastAPI application instance
from app.main import app
from app.models.eiv_models import (
    EIVDocumentData,
    CapaData,
    IntroducaoData,
    ResponsavelEIV,
    ProjetoInfoBase,
    Localizacao,
)

client = TestClient(app)

@pytest.fixture
def valid_eiv_payload():
    return EIVDocumentData(
        capa=CapaData(
            titulo_projeto="EIV Test Project",
            responsavel_eiv=ResponsavelEIV(nome="Test Architect", titulo="Lead Architect"),
            empresa_organizacao="Test Consultoria",
            data_elaboracao="2024-01-15",
        ),
        introducao=IntroducaoData(
            justificativa="Test Justification",
            contexto_projeto=ProjetoInfoBase(
                titulo_projeto="Test Residential Complex",
                tipo_projeto="Residential",
                escopo_projeto="10-story building, 100 units",
                proprietario_projeto="Test Developer Inc.",
            ),
            localizacao_exata=Localizacao(
                descricao="Central Test District",
                latitude=10.0,
                longitude=20.0,
                # temperatura_atual_celsius will be set by API mock
            ),
            objetivo_geral_eiv="Assess impacts of Test Residential Complex",
            objetivos_especificos_eiv=["Traffic impact", "Noise pollution"],
        ),
    )

@patch('httpx.AsyncClient.get', new_callable=AsyncMock)
def test_criar_eiv_com_sucesso_e_dados_climaticos(mock_httpx_get, valid_eiv_payload: EIVDocumentData):
    # Configure o mock para simular uma resposta bem-sucedida da API do clima
    mock_httpx_get.return_value.status_code = 200
    mock_httpx_get.return_value.json.return_value = {
        "current_weather": {
            "temperature": 25.5,
            "weathercode": 0,
            # outros campos que sua aplicação possa esperar
        }
    }
    # Simular que raise_for_status() não lança exceção
    mock_httpx_get.return_value.raise_for_status = lambda: None


    response = client.post("/eiv/gerar", json=valid_eiv_payload.model_dump(mode='json'))

    assert response.status_code == 200
    response_data = response.json()

    # Verificar dados da capa
    assert response_data["capa"]["titulo_projeto"] == valid_eiv_payload.capa.titulo_projeto
    assert response_data["capa"]["responsavel_eiv"]["nome"] == valid_eiv_payload.capa.responsavel_eiv.nome

    # Verificar dados da introdução
    assert response_data["introducao"]["justificativa"] == valid_eiv_payload.introducao.justificativa
    assert response_data["introducao"]["contexto_projeto"]["titulo_projeto"] == valid_eiv_payload.introducao.contexto_projeto.titulo_projeto

    # Verificar dados de localização e clima
    assert response_data["introducao"]["localizacao_exata"]["latitude"] == valid_eiv_payload.introducao.localizacao_exata.latitude
    assert response_data["introducao"]["localizacao_exata"]["longitude"] == valid_eiv_payload.introducao.localizacao_exata.longitude
    assert response_data["introducao"]["localizacao_exata"]["temperatura_atual_celsius"] == 25.5
    assert response_data["introducao"]["localizacao_exata"]["weather_data_message"] == "Temperature successfully retrieved."

    # Verificar se o mock foi chamado com a URL correta (opcional, mas bom para robustez)
    expected_lat = valid_eiv_payload.introducao.localizacao_exata.latitude
    expected_lng = valid_eiv_payload.introducao.localizacao_exata.longitude
    mock_httpx_get.assert_called_once_with(
        f"https://api.open-meteo.com/v1/forecast?latitude={expected_lat}&longitude={expected_lng}&current_weather=true"
    )

def test_criar_eiv_sem_coordenadas(valid_eiv_payload: EIVDocumentData):
    # Modificar o payload para não ter coordenadas
    payload_sem_coordenadas = valid_eiv_payload.model_copy(deep=True)
    payload_sem_coordenadas.introducao.localizacao_exata.latitude = None
    payload_sem_coordenadas.introducao.localizacao_exata.longitude = None

    response = client.post("/eiv/gerar", json=payload_sem_coordenadas.model_dump(mode='json'))

    assert response.status_code == 200
    response_data = response.json()

    # Verificar que os campos de clima não foram preenchidos e não houve erro
    assert response_data["introducao"]["localizacao_exata"].get("temperatura_atual_celsius") is None
    assert response_data["introducao"]["localizacao_exata"].get("weather_data_message") is None


@patch('httpx.AsyncClient.get', new_callable=AsyncMock)
def test_criar_eiv_falha_api_clima(mock_httpx_get, valid_eiv_payload: EIVDocumentData):
    # Simular uma falha na API do clima
    mock_httpx_get.return_value.raise_for_status.side_effect = Exception("API Error") # Simula httpx.HTTPStatusError ou similar

    response = client.post("/eiv/gerar", json=valid_eiv_payload.model_dump(mode='json'))

    assert response.status_code == 200 # A aplicação ainda deve retornar 200, mas com mensagem de erro no payload
    response_data = response.json()

    assert response_data["introducao"]["localizacao_exata"]["temperatura_atual_celsius"] is None
    assert "Could not retrieve weather data" in response_data["introducao"]["localizacao_exata"]["weather_data_message"]

@patch('httpx.AsyncClient.get', new_callable=AsyncMock)
def test_criar_eiv_api_clima_sem_temperatura(mock_httpx_get, valid_eiv_payload: EIVDocumentData):
    # Simular resposta da API sem o campo de temperatura
    mock_httpx_get.return_value.status_code = 200
    mock_httpx_get.return_value.json.return_value = {
        "current_weather": {
            "weathercode": 0 # Temperatura ausente
        }
    }
    mock_httpx_get.return_value.raise_for_status = lambda: None

    response = client.post("/eiv/gerar", json=valid_eiv_payload.model_dump(mode='json'))

    assert response.status_code == 200
    response_data = response.json()

    assert response_data["introducao"]["localizacao_exata"]["temperatura_atual_celsius"] is None
    assert response_data["introducao"]["localizacao_exata"]["weather_data_message"] == "Could not retrieve weather data: Temperature not available in response."
