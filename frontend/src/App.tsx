import React, { useState } from 'react';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';

import CapaForm from './components/Forms/CapaForm';
import IntroducaoForm from './components/Forms/IntroducaoForm';
import { CapaData, IntroducaoData, EIVDocumentData, submitCapaData, submitIntroducaoData, submitEIVCompleto } from './services/api';

const theme = createTheme({
  palette: {
    mode: 'light', // Alterado para light para melhor visualização de formulários
    primary: {
      main: '#004d40', // Um tom de verde escuro
    },
    secondary: {
      main: '#ffc107', // Âmbar
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h5: {
        fontWeight: 500,
    }
  }
});

const steps = ['Dados da Capa', 'Dados da Introdução', 'Revisar e Gerar'];

const FullWidthPaper = styled(Paper)(({ theme }) => ({
    width: '100%',
    padding: theme.spacing(3),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
}));


function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [capaData, setCapaData] = useState<CapaData | null>(null);
  const [introducaoData, setIntroducaoData] = useState<IntroducaoData | null>(null);
  const [eivPreviewUrl, setEivPreviewUrl] = useState<string | null>(null);
  const [eivPdfUrl, setEivPdfUrl] = useState<string | null>(null);


  const handleCapaSubmit = async (data: CapaData) => {
    console.log('Capa Data:', data);
    // Idealmente, aqui você chamaria submitCapaData(data) se quisesse salvar separadamente
    setCapaData(data);
    handleNext();
  };

  const handleIntroducaoSubmit = async (data: IntroducaoData) => {
    console.log('Introdução Data:', data);
     // Idealmente, aqui você chamaria submitIntroducaoData(data) se quisesse salvar separadamente
    setIntroducaoData(data);
    handleNext();
  };

  const handleFullSubmit = async () => {
    if (capaData && introducaoData) {
      const fullEIVData: EIVDocumentData = {
        capa: capaData,
        introducao: introducaoData,
      };
      try {
        const response = await submitEIVCompleto(fullEIVData);
        console.log('EIV Completo Submetido:', response);
        // Gera um ID de projeto simples para visualização (deve ser melhorado)
        const projectId = response.capa.titulo_projeto.replace(/\s+/g, '_').toLowerCase();
        setEivPreviewUrl(`http://localhost:8000/eiv/${projectId}/visualizar`); // URL para o endpoint GET do backend
        setEivPdfUrl(`http://localhost:8000/eiv/${projectId}/download-pdf`);
        handleNext(); // Avança para a etapa de visualização
      } catch (error) {
        console.error("Erro ao submeter EIV completo:", error);
        alert("Erro ao submeter EIV. Verifique o console.");
      }
    } else {
      alert("Dados da capa ou introdução estão faltando!");
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setEivPreviewUrl(null);
    setEivPdfUrl(null); // Limpa a URL de preview ao voltar
  };

  const handleReset = () => {
    setActiveStep(0);
    setCapaData(null);
    setIntroducaoData(null);
    setEivPreviewUrl(null);
    setEivPdfUrl(null);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <CapaForm onSubmit={handleCapaSubmit} defaultValues={capaData || undefined} />;
      case 1:
        return <IntroducaoForm onSubmit={handleIntroducaoSubmit} defaultValues={introducaoData || undefined} />;
      case 2:
        return (
          <FullWidthPaper>
            <Typography variant="h5" gutterBottom>Revisar e Gerar EIV</Typography>
            {capaData && introducaoData ? (
              <>
                <Typography paragraph>Todos os dados foram preenchidos. Clique em "Gerar EIV Completo" para processar.</Typography>
                <Button onClick={handleFullSubmit} variant="contained" color="primary">
                  Gerar EIV Completo
                </Button>
              </>
            ) : (
              <Typography paragraph>Por favor, preencha os dados da Capa e Introdução nas etapas anteriores.</Typography>
            )}
          </FullWidthPaper>
        );
      default:
        return 'Passo Desconhecido';
    }
  };


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md"> {/* Ajustado para md para melhor leitura dos formulários */}
        <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ paddingTop: 3, color: theme.palette.primary.main }}>
          Gerador de Estudo de Impacto de Vizinhança (EIV)
        </Typography>

        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label} completed={ (index === 0 && !!capaData) || (index === 1 && !!introducaoData) || (index < activeStep) }>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                {getStepContent(index)}
                <Box sx={{ mb: 2, mt: 2 }}>
                  <div>
                    <Button
                      variant="contained"
                      onClick={index === steps.length -1 ? handleFullSubmit : handleNext} // Não é ideal, o handleNext é chamado dentro dos submits
                      sx={{ mt: 1, mr: 1 }}
                      disabled={ (index === 0 && !capaData) || (index === 1 && !introducaoData && activeStep === index) || (index === 2 && (!capaData || !introducaoData)) }
                    >
                      {index === steps.length - 1 ? 'Gerar EIV' : (index === 0 && capaData ? 'Próximo (Introdução)' : (index === 1 && introducaoData ? 'Próximo (Revisar)' : 'Preencha para Continuar'))}
                    </Button>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Voltar
                    </Button>
                  </div>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {activeStep === steps.length && (
          <FullWidthPaper sx={{ p: 3, mt: 2, mb: 2 }}>
            <Typography variant="h5" gutterBottom>EIV Gerado!</Typography>
            {(eivPreviewUrl || eivPdfUrl) && (
                <>
                    <Typography paragraph>
                        O EIV foi processado. Você pode visualizá-lo ou baixá-lo usando os links abaixo.
                    </Typography>
                    {eivPreviewUrl &&
                        <Button
                            variant="contained"
                            color="secondary"
                            href={eivPreviewUrl}
                            target="_blank"
                            sx={{mb: 2, mr: eivPdfUrl ? 1 : 0}}
                        >
                            Visualizar EIV em HTML
                        </Button>
                    }
                    {eivPdfUrl &&
                        <Button
                            variant="contained"
                            color="primary"
                            href={eivPdfUrl}
                            target="_blank"
                            // download Atributo 'download' pode ser útil, mas o backend já define Content-Disposition
                            sx={{mb: 2, ml: eivPreviewUrl ? 1 : 0}}
                        >
                            Baixar EIV em PDF
                        </Button>
                    }
                </>
            )}
            <Typography paragraph>Você pode reiniciar o processo ou refinar os dados.</Typography>
            <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
              Gerar Novo EIV (Reiniciar)
            </Button>
             <Button
                disabled={activeStep !== steps.length} // Só pode voltar da última etapa
                onClick={handleBack}
                sx={{ mt: 1, mr: 1 }}
            >
                Voltar para Edição
            </Button>
          </FullWidthPaper>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
