import React, { useState, ChangeEvent, FormEvent } from 'react';
import { formatABNTDocument } from '../../services/api';
import Button from '@mui/material/Button'; // ADICIONAR
import Typography from '@mui/material/Typography'; // ADICIONAR
import Box from '@mui/material/Box'; // ADICIONAR para espaçamento

const ABNTForm: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.name.endsWith('.docx')) {
        setSelectedFile(file);
        setErrorMessage(''); // Limpa erro anterior ao selecionar arquivo válido
        setSuccessMessage(''); // Limpa mensagem de sucesso anterior
      } else {
        setSelectedFile(null);
        setErrorMessage('Por favor, selecione um arquivo .docx.');
      }
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Nenhum arquivo selecionado ou o arquivo não é .docx.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await formatABNTDocument(selectedFile);
      setSuccessMessage(`Arquivo "${selectedFile.name}" formatado e download iniciado!`);
      setSelectedFile(null); // Limpa o arquivo selecionado após sucesso
      // Limpa o input de arquivo (opcional, mas bom para UX)
      const fileInput = document.getElementById('abnt-file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error: any) {
      // A função formatABNTDocument já trata erros do axios e lança uma nova Error
      // com a mensagem apropriada.
      setErrorMessage(error.message || 'Ocorreu um erro desconhecido ao formatar o arquivo.');
      console.error("Falha no handleSubmit ABNTForm:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // O FullWidthPaper já está sendo aplicado em App.tsx, então o Box aqui é para estrutura interna.
    // Os estilos do div container original podem ser migrados para o Box ou mantidos se o FullWidthPaper não for suficiente.
    // Por agora, vamos manter a estrutura interna e adicionar componentes MUI.
    <Box sx={{ my: 2 }}> {/* my: 2 para margem vertical */}
      <Typography variant="h5" component="h2" gutterBottom>
        Formatar Documento Word para Normas ABNT
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 2 }}> {/* mb: 2 para margem inferior */}
          <Typography variant="body1" component="label" htmlFor="abnt-file-input" sx={{ display: 'block', mb: 1 }}>
            Selecione um arquivo .docx:
          </Typography>
          <input
            type="file"
            id="abnt-file-input"
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            style={{ display: 'block', marginBottom: '10px' }} // Estilo básico para o input
          />
        </Box>
        {selectedFile && (
          <Typography variant="body2" sx={{ mb: 2 }}>
            Arquivo selecionado: {selectedFile.name}
          </Typography>
        )}

        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={isLoading || !selectedFile}
        >
          {isLoading ? 'Formatando...' : 'Formatar e Baixar PDF'}
        </Button>
      </form>
      {errorMessage && (
        <Typography color="error" sx={{ mt: 2 }}>
          Erro: {errorMessage}
        </Typography>
      )}
      {successMessage && (
        <Typography color="success.main" sx={{ mt: 2 }}> {/* Cor de sucesso do tema MUI */}
          {successMessage}
        </Typography>
      )}
    </Box>
  );
};

export default ABNTForm;
