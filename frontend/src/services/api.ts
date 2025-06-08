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

export default apiClient;
