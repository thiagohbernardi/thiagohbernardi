import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/eiv', // URL base da sua API FastAPI
  headers: {
    'Content-Type': 'application/json',
  },
});

// Definições de tipo (podem ser mais elaboradas e compartilhadas com o backend)
// Por simplicidade, vamos definir algumas aqui, mas o ideal seria ter um local comum
// ou gerar a partir da especificação OpenAPI do backend.

export interface Localizacao {
  descricao?: string;
  latitude?: number;
  longitude?: number;
}

export interface ResponsavelEIV {
  nome: string;
  titulo?: string;
}

export interface ProjetoInfoBase {
  titulo_projeto: string;
  tipo_projeto?: string;
  escopo_projeto?: string;
  proprietario_projeto?: string;
}

export interface CapaData {
  titulo_projeto: string;
  responsavel_eiv: ResponsavelEIV;
  empresa_organizacao?: string;
  data_elaboracao: string; // Formato YYYY-MM-DD
}

export interface IntroducaoData {
  justificativa: string;
  contexto_projeto: ProjetoInfoBase;
  localizacao_exata: Localizacao;
  objetivo_geral_eiv: string;
  objetivos_especificos_eiv: string[];
}

export interface EIVDocumentData {
  capa: CapaData;
  introducao: IntroducaoData;
}

export const submitCapaData = async (data: CapaData) => {
  try {
    const response = await apiClient.post('/capa', data);
    return response.data;
  } catch (error) {
    console.error("Erro ao submeter dados da capa:", error);
    throw error;
  }
};

export const submitIntroducaoData = async (data: IntroducaoData) => {
  try {
    const response = await apiClient.post('/introducao', data);
    return response.data;
  } catch (error) {
    console.error("Erro ao submeter dados da introdução:", error);
    throw error;
  }
};

export const submitEIVCompleto = async (data: EIVDocumentData) => {
  try {
    const response = await apiClient.post('/gerar', data);
    return response.data;
  } catch (error) {
    console.error("Erro ao submeter EIV completo:", error);
    throw error;
  }
}

// Função para buscar o HTML do EIV (exemplo, pode não ser usada diretamente se o PDF for gerado)
export const getEIVHtml = async (projectId: string) => {
  try {
    const response = await apiClient.get(`/${projectId}/visualizar`);
    return response.data; // Retorna o HTML como string
  } catch (error) {
    console.error("Erro ao buscar HTML do EIV:", error);
    throw error;
  }
}

export const formatABNTDocument = async (file: File): Promise<void> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    // Ajustar a URL para o endpoint ABNT.
    // O baseURL do apiClient é 'http://localhost:8000/eiv'.
    // Precisamos de 'http://localhost:8000/abnt/formatar-docx-para-pdf'.
    // Podemos fazer isso de algumas formas:
    // 1. Usar uma URL absoluta.
    // 2. Criar um novo cliente axios para o endpoint /abnt.
    // 3. Usar o cliente existente e fornecer um caminho que "suba" do /eiv. (ex: '../abnt/formatar-docx-para-pdf') - pode ser frágil.
    // Vamos usar uma URL absoluta por clareza, ou construir a partir de uma base mais genérica.

    // Assumindo que a API base está em http://localhost:8000
    const abntApiBaseURL = 'http://localhost:8000/abnt';

    const response = await axios.post(
      `${abntApiBaseURL}/formatar-docx-para-pdf`,
      formData,
      {
        headers: {
          // Axios define 'Content-Type': 'multipart/form-data' automaticamente ao usar FormData,
          // mas podemos ser explícitos se quisermos ou se houver problemas.
          // 'Content-Type': 'multipart/form-data', (geralmente não necessário com FormData)
        },
        responseType: 'blob', // Importante para receber o arquivo PDF como Blob
      }
    );

    // Lógica para acionar o download do arquivo PDF
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);

    // Tenta obter o nome do arquivo do cabeçalho Content-Disposition, se existir
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'documento_abnt.pdf'; // Nome padrão
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
      if (filenameMatch && filenameMatch.length > 1) {
        filename = filenameMatch[1];
      }
    }

    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Limpeza
    URL.revokeObjectURL(link.href);
    document.body.removeChild(link);

  } catch (error) {
    console.error('Erro ao formatar documento ABNT:', error);
    // Tratar o erro de forma mais específica (ex: erro de rede, erro do servidor)
    if (axios.isAxiosError(error) && error.response) {
      // Tentar ler a mensagem de erro do backend se for um JSON
      if (error.response.data instanceof Blob && error.response.data.type === "application/json") {
        const errorText = await error.response.data.text();
        const errorJson = JSON.parse(errorText);
        console.error('Detalhe do erro do backend:', errorJson.detail);
        throw new Error(errorJson.detail || 'Erro do servidor ao formatar o documento.');
      } else {
        throw new Error(error.response.statusText || 'Erro do servidor ao formatar o documento.');
      }
    }
    throw error; // Re-lança o erro para o componente tratar (ex: mostrar mensagem ao usuário)
  }
};

export default apiClient;
