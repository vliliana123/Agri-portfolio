import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { BreadcrumbContext } from '../context/BreadcrumbContext';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { getArendatorDetails } from '../services/api';
import { Arendator } from '../types';

export const ArendatorDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [arendator, setArendator] = useState<Arendator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
   const {setBreadcrumbLabel}=useContext(BreadcrumbContext);

  useEffect(() => {
    const loadDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setBreadcrumbLabel(''); // Reset before loading
        const data = await getArendatorDetails(parseInt(id));
        setArendator(data);
        setBreadcrumbLabel(data.nume); // Set the actual name
      } catch (err) {
        setError('Eroare la încărcarea detaliilor arendatorului');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [id, setBreadcrumbLabel]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Se încarcă detaliile...</Typography>
      </Box>
    );
  }

  if (error || !arendator) {
    return (
      <Box>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/arendatori')}
          sx={{ mb: 2 }}
        >
          Înapoi la Arendatori
        </Button>
        <Typography color="error">{error || 'Arendator nu a fost găsit'}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: 'white', minHeight: { xs: 'auto', sm: '100vh' }, p: { xs: 1.5, sm: 2, md: 3 } }}>
      {/* Header cu buton înapoi */}
      <Box sx={{ mb: { xs: 2, sm: 3 }, display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap' }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/arendatori')}
          variant="outlined"
        >
          Înapoi la Arendatori
        </Button>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ 
            fontSize: { xs: '1.5rem', sm: '2rem' },
            lineHeight: { xs: 1.3, sm: 1.2 }
          }}
        >
          Detalii Arendator: {arendator.nume}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2, md: 3 }, maxWidth: { xs: '100%', sm: '90%', md: '80%' } }}>
        
        {/* SECȚIUNEA 1: Informații Personale */}
        <Paper sx={{ p: { xs: 1, sm: 1.5, md: 2 } }}>
         
          
          {/* Layout în 3 coloane */}
          <Box sx={{ display: 'grid',
           gridTemplateColumns: {
                xs: '1fr',           // Mobile: 1 coloană
                sm: '1fr 1fr',       // Tablet: 2 coloane  
                md: '1fr 1fr 1fr'    // Desktop: 3 coloane
            }, gap: 3 }}>
            
            {/* Coloana 1: Informații Personale */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: 'text.secondary' }}>
                Informații Personale
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Nume:</strong> {arendator.nume}</Typography>
              <Typography variant="body2"><strong>CNP:</strong> {arendator.cnp}</Typography>
            </Box>

            {/* Coloana 2: Act Identitate */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: 'text.secondary' }}>
                Act Identitate
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}><strong>CI Serie:</strong> {arendator.ci_serie} <strong>CI Nr:</strong> {arendator.ci_nr}</Typography>
              <Typography variant='body2'><strong>CI Data Eliberării:</strong> {new Date(arendator.ci_data).toLocaleDateString('ro-RO')}</Typography>
            </Box>

            {/* Coloana 3: Contact */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: 'text.secondary' }}>
                Contact
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Telefon:</strong> {arendator.telefon}</Typography>
              <Typography variant="body2"><strong>Adresa:</strong> {arendator.adresa}</Typography>
            </Box>
            
          </Box>
        </Paper>

        {/* SECȚIUNEA 2: Contracte */}
        <Paper sx={{ p: { xs: 1, sm: 1.5, md: 2 } }}>
          <Typography variant="h6" sx={{ mb: 1.5, color: 'primary.main' }}>
            Contracte ({arendator.contracte?.length || 0})
          </Typography>
          {arendator.contracte && arendator.contracte.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1, sm: 1.5 } }}>
              {arendator.contracte.map((contract, index) => (
                <Paper 
                  key={contract.id_contract} 
                  variant="outlined"
                  sx={{ p: { xs: 1, sm: 1.5 }, bgcolor: 'white' }}
                >
                  {/* Header cu titlurile pe același rând */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: { xs: 1, sm: 2 }, mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ color: 'secondary.main' }}>
                      Contract #{index + 1}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: 'secondary.main' }}>
                      Terenuri ({contract.terenuri?.length || 0})
                    </Typography>
                  </Box>
                  
                  {/* Două coloane: Contract și Terenuri */}
                  <Box sx={{ display: 'grid', 
                  gridTemplateColumns: {
                      xs: '1fr',           // Mobile: stivuite vertical
                      sm: '1fr 1fr'        // Tablet+: 2 coloane
                    }, gap: 2, alignItems: 'start' }}>
                    
                    {/* Coloana 1: Detalii Contract */}
                    <Box sx={{ height: '100%' }}>
                      <Paper 
                        variant="outlined"
                        sx={{ p: 1, bgcolor: '#f0f0f0', height: '100%', minHeight: 'fit-content' }}
                      >
                        <Box>
                          <Typography variant="body2" fontSize="0.8rem">
                            <strong>Număr:</strong> {contract.nr_contract}
                          </Typography>
                          <Typography variant="body2" fontSize="0.8rem">
                            <strong>Data:</strong> {new Date(contract.data_contract).toLocaleDateString('ro-RO')}
                          </Typography>
                          <Typography variant="body2" fontSize="0.8rem">
                            <strong>Perioada:</strong> {contract.perioada_contract}
                          </Typography>
                          <Typography variant="body2" fontSize="0.8rem">
                            <strong>Nivel arendă:</strong> {contract.nivel_arenda}
                          </Typography>
                          {contract.observatii && (
                            <Typography variant="body2" fontSize="0.8rem">
                              <strong>Observații:</strong> {contract.observatii}
                            </Typography>
                          )}
                        </Box>
                      </Paper>
                    </Box>

                    {/* Coloana 2: Terenuri */}
                    <Box sx={{ height: '100%' }}>
                      {contract.terenuri && contract.terenuri.length > 0 ? (
                        <Box sx={{ display: 'grid', gap: 0.5, height: '100%' }}>
                          {contract.terenuri.map((teren, terenIndex) => (
                            <Paper 
                              key={terenIndex} 
                              variant="outlined"
                              sx={{ p: 1, bgcolor: '#f0f0f0', minHeight: 'fit-content' }}
                            >
                              <Box>
                                <Typography variant="body2" fontSize="0.8rem">
                                  <strong>Tarla:</strong> {teren.tarla}
                                </Typography>
                                <Typography variant="body2" fontSize="0.8rem">
                                  <strong>Parcela:</strong> {teren.parcela}
                                </Typography>
                                <Typography variant="body2" fontSize="0.8rem">
                                  <strong>Suprafața:</strong> {teren.suprafata} ha
                                </Typography>
                                <Typography variant="body2" fontSize="0.8rem">
                                  <strong>Act proprietate:</strong> {teren.act_proprietate}
                                </Typography>
                                <Typography variant="body2" fontSize="0.8rem">
                                  <strong>Zona:</strong> {teren.zona_nume}
                                </Typography>
                              </Box>
                            </Paper>
                          ))}
                        </Box>
                      ) : (
                        <Paper 
                          variant="outlined"
                          sx={{ p: 1, bgcolor: '#f0f0f0', height: '100%', minHeight: 'fit-content', display: 'flex', alignItems: 'center' }}
                        >
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            Nu există terenuri pentru acest contract
                          </Typography>
                        </Paper>
                      )}
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Nu există contracte înregistrate pentru acest arendator.
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
};