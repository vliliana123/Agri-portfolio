import React from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { getRaport } from '../services/api';

const RaportPlatiArenda: React.FC = () => {
  const [dataInceput, setDataInceput] = React.useState('');
  const [dataSfarsit, setDataSfarsit] = React.useState('');
  const [totalValoare, setTotalValoare] = React.useState<number | null>(null);
  const [count, setCount] = React.useState<number | null>(null);
  const handleGetRaport = async () => {
    setTotalValoare(null); // Resetează valoarea totală înainte de a obține un nou raport
    setCount(null); // Resetează numărul de înregistrări înainte de a obține un nou raport
    if (!dataInceput || !dataSfarsit) return;
    try {
      const response = await getRaport(dataInceput, dataSfarsit);
      setTotalValoare(response.total_valoare);
      setCount(response.count);
    } catch (error) {
      console.error('Eroare la obținerea raportului:', error);
    }
  };
  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Raport Plăți Arendă
      </Typography>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Data început"
          type="date"
          value={dataInceput}
          onChange={(e) => setDataInceput(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Data sfârșit"
          type="date"
          value={dataSfarsit}
          onChange={(e) => setDataSfarsit(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" onClick={handleGetRaport}>
          Obține raport
        </Button>
      </Box>
      {totalValoare !== null && (
        <Typography variant="h6">
          Total valoare: {totalValoare} lei
        </Typography>
      )}
      {count !== null && (
        <Typography variant="h6">
          Număr înregistrări: {count}
        </Typography>
      )}
    </Box>
  );
};

export default RaportPlatiArenda;
