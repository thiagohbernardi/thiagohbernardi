from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from datetime import date

class Localizacao(BaseModel):
    descricao: Optional[str] = "Localização a ser detalhada"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    temperatura_atual_celsius: Optional[float] = Field(None, description="Temperatura atual em Celsius obtida da API")

class ResponsavelEIV(BaseModel):
    nome: str = Field(..., example="Dr. Arquiteto Exemplo")
    titulo: Optional[str] = Field(None, example="Arquiteto e Urbanista")
    # Outros campos como registro profissional, contato podem ser adicionados aqui

class ProjetoInfoBase(BaseModel):
    titulo_projeto: str = Field(..., example="Construção Residencial Multifamiliar XYZ")
    tipo_projeto: Optional[str] = Field(None, example="Residencial Multifamiliar")
    escopo_projeto: Optional[str] = Field(None, example="Edifício de 10 andares, 40 unidades")
    proprietario_projeto: Optional[str] = Field(None, example="Construtora ABC Ltda.")
    # cronograma: Optional[str] = None # Pode ser mais complexo: datas de início/fim

class CapaData(BaseModel):
    titulo_projeto: str = Field(..., example="Estudo de Impacto de Vizinhança: Residencial XYZ")
    responsavel_eiv: ResponsavelEIV
    empresa_organizacao: Optional[str] = Field(None, example="Consultoria Urbana Legal")
    data_elaboracao: date = Field(default_factory=date.today)
    # logotipo_url: Optional[HttpUrl] = None # Será tratado no upload

class IntroducaoData(BaseModel):
    justificativa: str = Field(..., example="Necessidade de avaliar os impactos da nova construção...")
    contexto_projeto: ProjetoInfoBase
    localizacao_exata: Localizacao
    objetivo_geral_eiv: str = Field(..., example="Analisar e propor medidas mitigadoras para os impactos...")
    objetivos_especificos_eiv: List[str] = Field(default_factory=list, example=["Avaliar impacto no tráfego", "Analisar sombreamento"])
    # metodologia: Optional[str] = "Descrição da metodologia..." # Pode ser um campo grande
    # limitacoes_estudo: Optional[str] = "Limitações..."

class EIVDocumentData(BaseModel):
    capa: CapaData
    introducao: IntroducaoData
    # Outras seções virão aqui (sumario_executivo, descricao_vizinhanca, etc.)
