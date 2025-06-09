from pydantic import BaseModel
from fastapi import UploadFile
from typing import Optional, List

class ABNTDocumentRequest(BaseModel):
    # O FastAPI usará UploadFile para lidar com o upload de arquivos.
    # Este campo não será diretamente parte do JSON, mas sim como 'form data'.
    # No entanto, para o cliente que envia a requisição, ele especificará um arquivo.
    # Para o modelo Pydantic em si, podemos omiti-lo ou torná-lo opcional
    # se quisermos também suportar, por exemplo, entrada de texto HTML diretamente no futuro.
    # Por agora, vamos focar no upload de arquivo que será manuseado pelo endpoint.
    # Para fins de validação do corpo da requisição que *pode* acompanhar o arquivo (ex: opções),
    # podemos definir outros campos.

    filename: Optional[str] = None # Opcional, o nome pode ser extraído do UploadFile
    # Adicionaremos mais campos aqui no futuro, se necessário, para opções de formatação.

class ABNTFormattedDocument(BaseModel):
    original_filename: str
    formatted_content_html: Optional[str] = None # HTML formatado antes de virar PDF
    message: str
    # Poderia ter um link para download do PDF ou o PDF em si (codificado) no futuro.
