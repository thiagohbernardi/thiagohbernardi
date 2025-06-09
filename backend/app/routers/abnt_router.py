from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import StreamingResponse
from fastapi.templating import Jinja2Templates
import io
import os # Para construir caminhos de arquivo de forma segura

from app.abnt_formatter import convert_docx_to_html, apply_abnt_formatting
# O modelo ABNTDocumentRequest não é estritamente necessário para um endpoint de upload de arquivo simples,
# mas pode ser útil se adicionarmos mais metadados ou opções no futuro.
# from app.models.abnt_models import ABNTDocumentRequest

# WeasyPrint
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration


router = APIRouter(
    prefix="/abnt",
    tags=["ABNT - Formatação de Documentos"],
)

# Configurar templates Jinja2, assumindo que 'templates' está em 'backend/app/templates'
# e 'static' está em 'backend/app/static'
# O path para o diretório de templates precisa ser relativo ao local de execução do uvicorn,
# ou absoluto. Para ser mais robusto:
current_dir = os.path.dirname(os.path.realpath(__file__))
templates_dir = os.path.join(current_dir, "..", "templates")
static_dir = os.path.join(current_dir, "..", "static") # Diretório base para estáticos

templates = Jinja2Templates(directory=templates_dir)

# Configuração de fonte para WeasyPrint (opcional, mas bom para garantir)
font_config = FontConfiguration()


@router.post("/formatar-docx-para-pdf")
async def formatar_docx_para_pdf(file: UploadFile = File(...)):
    """
    Recebe um arquivo .docx, converte para HTML, aplica formatação ABNT (esboço),
    renderiza com um template e CSS ABNT, e retorna como PDF.
    """
    if not file.filename.endswith(".docx"):
        raise HTTPException(status_code=400, detail="Formato de arquivo inválido. Por favor, envie um arquivo .docx.")

    try:
        # Ler o conteúdo do arquivo em memória
        docx_content_bytes = await file.read()
        docx_file_like_object = io.BytesIO(docx_content_bytes)

        # 1. Converter DOCX para HTML
        raw_html_content = convert_docx_to_html(docx_file_like_object)

        # 2. Aplicar formatação ABNT (atualmente um esboço)
        formatted_html_content = apply_abnt_formatting(raw_html_content, original_filename=file.filename)

        # 3. Renderizar o template HTML com o conteúdo formatado
        # (O template HTML linka o CSS, mas para WeasyPrint é melhor passar explicitamente)
        html_for_pdf = templates.get_template("abnt_template.html").render({
            "request": {}, # Necessário para url_for, mas pode não ser usado se o CSS for explícito
            "content_html": formatted_html_content,
            # Passar o caminho do CSS para o template, caso ele precise (embora vamos usar stylesheets no WeasyPrint)
            "css_path": "css/abnt_styles.css" # Relativo ao diretório static
        })

        # 4. Converter HTML para PDF usando WeasyPrint
        css_file_path = os.path.join(static_dir, "css", "abnt_styles.css")

        if not os.path.exists(css_file_path):
            # Log importante para o desenvolvedor
            print(f"ALERTA: Arquivo CSS não encontrado em: {css_file_path}")
            # Poderia lançar uma exceção ou tentar continuar sem CSS
            # raise HTTPException(status_code=500, detail="Erro interno: Arquivo CSS de formatação não encontrado.")
            # Por agora, vamos permitir que continue e o PDF seja gerado sem o CSS externo.
            # O CSS inline no template (para margens @page) ainda será aplicado.
            weasy_css = []
        else:
            weasy_css = [CSS(filename=css_file_path, font_config=font_config)]

        # O base_url ajuda WeasyPrint a encontrar recursos relativos (imagens, etc.)
        # se eles estiverem referenciados no HTML e armazenados junto aos templates/estáticos.
        # Como estamos passando o CSS explicitamente, o base_url para o CSS não é crítico,
        # mas é bom para outras coisas.
        # Se o HTML convertido pelo Mammoth contiver caminhos para imagens, este base_url precisa ser ajustado.
        # Por ex, se as imagens são extraídas para um diretório temporário.
        # Para simplicidade, vamos assumir que o HTML é auto-contido ou as imagens são URLs absolutas.
        # Um base_url apontando para o diretório de templates pode ser um bom começo.
        base_url_for_pdf = templates_dir

        pdf_bytes = HTML(string=html_for_pdf, base_url=base_url_for_pdf).write_pdf(
            stylesheets=weasy_css,
            font_config=font_config
        )

        pdf_stream = io.BytesIO(pdf_bytes)

        output_filename = file.filename.replace(".docx", "_abnt.pdf") if file.filename else "documento_abnt.pdf"

        return StreamingResponse(
            pdf_stream,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={output_filename}"}
        )

    except ValueError as ve: # Erro vindo do abnt_formatter (ex: falha na conversão)
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        # Logar o erro em uma aplicação real (e.g., usando logging module)
        print(f"Erro inesperado durante a formatação para PDF: {type(e).__name__} - {e}")
        # Considerar traceback para depuração: import traceback; traceback.print_exc();
        raise HTTPException(status_code=500, detail=f"Erro interno ao processar o arquivo: {e}")
