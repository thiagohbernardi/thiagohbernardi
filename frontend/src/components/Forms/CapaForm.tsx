import React from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { TextField, Button, Grid, Typography, Paper } from '@mui/material';
import { CapaData, ResponsavelEIV } from '../../services/api'; // Ajuste o caminho se necessário

interface CapaFormProps {
  onSubmit: (data: CapaData) => void;
  defaultValues?: Partial<CapaData>;
}

const CapaForm: React.FC<CapaFormProps> = ({ onSubmit, defaultValues }) => {
  const { control, handleSubmit, formState: { errors } } = useForm<CapaData>({
    defaultValues: {
      titulo_projeto: defaultValues?.titulo_projeto || '',
      responsavel_eiv: {
        nome: defaultValues?.responsavel_eiv?.nome || '',
        titulo: defaultValues?.responsavel_eiv?.titulo || '',
      },
      empresa_organizacao: defaultValues?.empresa_organizacao || '',
      data_elaboracao: defaultValues?.data_elaboracao || new Date().toISOString().split('T')[0], // YYYY-MM-DD
    }
  });

  const handleFormSubmit: SubmitHandler<CapaData> = (data) => {
    onSubmit(data);
  };

  return (
    <Paper elevation={3} sx={{ padding: 3, marginTop: 2 }}>
      <Typography variant="h5" gutterBottom>Dados da Capa</Typography>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              name="titulo_projeto"
              control={control}
              rules={{ required: 'Título do projeto EIV é obrigatório' }}
              render={({ field }) => <TextField {...field} label="Título do Projeto EIV" fullWidth error={!!errors.titulo_projeto} helperText={errors.titulo_projeto?.message} />}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <Controller
              name="responsavel_eiv.nome"
              control={control}
              rules={{ required: 'Nome do responsável é obrigatório' }}
              render={({ field }) => <TextField {...field} label="Nome do Responsável pelo EIV" fullWidth error={!!errors.responsavel_eiv?.nome} helperText={errors.responsavel_eiv?.nome?.message} />}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller
              name="responsavel_eiv.titulo"
              control={control}
              render={({ field }) => <TextField {...field} label="Título do Responsável (Ex: Arquiteto)" fullWidth />}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="empresa_organizacao"
              control={control}
              render={({ field }) => <TextField {...field} label="Empresa/Organização" fullWidth />}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="data_elaboracao"
              control={control}
              rules={{ required: 'Data de elaboração é obrigatória' }}
              render={({ field }) => <TextField {...field} label="Data de Elaboração" type="date" InputLabelProps={{ shrink: true }} fullWidth error={!!errors.data_elaboracao} helperText={errors.data_elaboracao?.message} />}
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">Salvar Dados da Capa</Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default CapaForm;
