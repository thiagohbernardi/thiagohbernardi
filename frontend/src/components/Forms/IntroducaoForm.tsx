import React, { useState } from 'react';
import { useForm, Controller, SubmitHandler, useFieldArray } from 'react-hook-form';
import { TextField, Button, Grid, Typography, Paper, IconButton, Box } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import LocationMap from '../MapComponents/LocationMap'; // Ajuste o caminho
import { IntroducaoData, Localizacao, ProjetoInfoBase } from '../../services/api'; // Ajuste o caminho

interface IntroducaoFormProps {
  onSubmit: (data: IntroducaoData) => void;
  defaultValues?: Partial<IntroducaoData>;
}

const IntroducaoForm: React.FC<IntroducaoFormProps> = ({ onSubmit, defaultValues }) => {
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(
    defaultValues?.localizacao_exata?.latitude && defaultValues?.localizacao_exata?.longitude
      ? [defaultValues.localizacao_exata.latitude, defaultValues.localizacao_exata.longitude]
      : null
  );

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<IntroducaoData>({
    defaultValues: {
      justificativa: defaultValues?.justificativa || '',
      contexto_projeto: {
        titulo_projeto: defaultValues?.contexto_projeto?.titulo_projeto || '',
        tipo_projeto: defaultValues?.contexto_projeto?.tipo_projeto || '',
        escopo_projeto: defaultValues?.contexto_projeto?.escopo_projeto || '',
        proprietario_projeto: defaultValues?.contexto_projeto?.proprietario_projeto || '',
      },
      localizacao_exata: {
        descricao: defaultValues?.localizacao_exata?.descricao || '',
        latitude: defaultValues?.localizacao_exata?.latitude || undefined,
        longitude: defaultValues?.localizacao_exata?.longitude || undefined,
      },
      objetivo_geral_eiv: defaultValues?.objetivo_geral_eiv || '',
      objetivos_especificos_eiv: defaultValues?.objetivos_especificos_eiv || [''],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "objetivos_especificos_eiv"
  });

  const handleLocationSelect = (lat: number, lng: number) => {
    setValue('localizacao_exata.latitude', lat);
    setValue('localizacao_exata.longitude', lng);
    setSelectedCoords([lat, lng]);
  };

  const handleFormSubmit: SubmitHandler<IntroducaoData> = (data) => {
    onSubmit(data);
  };

  return (
    <Paper elevation={3} sx={{ padding: 3, marginTop: 2, marginBottom: 2 }}>
      <Typography variant="h5" gutterBottom>Dados da Introdução</Typography>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              name="justificativa"
              control={control}
              rules={{ required: 'Justificativa é obrigatória' }}
              render={({ field }) => <TextField {...field} label="Justificativa do EIV" multiline rows={3} fullWidth error={!!errors.justificativa} helperText={errors.justificativa?.message} />}
            />
          </Grid>

          <Grid item xs={12}><Typography variant="h6" sx={{mt:1}}>Contexto do Projeto</Typography></Grid>
          <Grid item xs={12}>
            <Controller
              name="contexto_projeto.titulo_projeto"
              control={control}
              rules={{ required: 'Título do projeto é obrigatório' }}
              render={({ field }) => <TextField {...field} label="Título do Projeto (Empreendimento)" fullWidth error={!!errors.contexto_projeto?.titulo_projeto} helperText={errors.contexto_projeto?.titulo_projeto?.message} />}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="contexto_projeto.tipo_projeto"
              control={control}
              render={({ field }) => <TextField {...field} label="Tipo do Projeto" fullWidth />}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="contexto_projeto.proprietario_projeto"
              control={control}
              render={({ field }) => <TextField {...field} label="Proprietário do Projeto" fullWidth />}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="contexto_projeto.escopo_projeto"
              control={control}
              render={({ field }) => <TextField {...field} label="Escopo do Projeto" multiline rows={2} fullWidth />}
            />
          </Grid>

          <Grid item xs={12}><Typography variant="h6" sx={{mt:1}}>Localização Exata</Typography></Grid>
          <Grid item xs={12}>
            <Controller
              name="localizacao_exata.descricao"
              control={control}
              render={({ field }) => <TextField {...field} label="Descrição da Localização (Endereço, etc.)" fullWidth />}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Selecione no Mapa:</Typography>
            <LocationMap onLocationSelect={handleLocationSelect} selectedPosition={selectedCoords} />
            {errors.localizacao_exata?.latitude && <Typography color="error" variant="caption">Latitude é obrigatória.</Typography>}
             {/* Você pode adicionar campos ocultos ou apenas confiar no estado do formulário */}
            <Controller name="localizacao_exata.latitude" control={control} rules={{ required: 'Selecione uma localização no mapa.'}} render={({ field }) => <input type="hidden" {...field} />} />
            <Controller name="localizacao_exata.longitude" control={control} rules={{ required: 'Selecione uma localização no mapa.'}} render={({ field }) => <input type="hidden" {...field} />} />
          </Grid>
          <Grid item xs={6}>
             <TextField label="Latitude Selecionada" value={watch('localizacao_exata.latitude') || ''} fullWidth disabled InputLabelProps={{ shrink: true }} />
          </Grid>
           <Grid item xs={6}>
             <TextField label="Longitude Selecionada" value={watch('localizacao_exata.longitude') || ''} fullWidth disabled InputLabelProps={{ shrink: true }} />
          </Grid>


          <Grid item xs={12}><Typography variant="h6" sx={{mt:1}}>Objetivos do EIV</Typography></Grid>
          <Grid item xs={12}>
            <Controller
              name="objetivo_geral_eiv"
              control={control}
              rules={{ required: 'Objetivo geral é obrigatório' }}
              render={({ field }) => <TextField {...field} label="Objetivo Geral do EIV" multiline rows={2} fullWidth error={!!errors.objetivo_geral_eiv} helperText={errors.objetivo_geral_eiv?.message} />}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1">Objetivos Específicos:</Typography>
            {fields.map((item, index) => (
              <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Controller
                  name={`objetivos_especificos_eiv.${index}`}
                  control={control}
                  rules={{ required: 'Objetivo específico não pode ser vazio se adicionado' }}
                  render={({ field }) => <TextField {...field} label={`Objetivo Específico ${index + 1}`} fullWidth sx={{ mr: 1 }} error={!!errors.objetivos_especificos_eiv?.[index]} helperText={errors.objetivos_especificos_eiv?.[index]?.message} />}
                />
                <IconButton onClick={() => remove(index)} color="error" disabled={fields.length <=1 && index === 0 /*Não remover o último se for o único e estiver vazio*/}>
                  <RemoveCircleOutlineIcon />
                </IconButton>
              </Box>
            ))}
            <Button
              type="button"
              onClick={() => append('')}
              startIcon={<AddCircleOutlineIcon />}
            >
              Adicionar Objetivo Específico
            </Button>
          </Grid>

          <Grid item xs={12} sx={{mt:2}}>
            <Button type="submit" variant="contained" color="primary">Salvar Dados da Introdução</Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default IntroducaoForm;
