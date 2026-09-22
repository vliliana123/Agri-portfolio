import React, { useState, useEffect, useContext } from 'react';
import {
    TextField,
    Select,
    MenuItem,
    Button,
    Box,
    FormControl,
    InputLabel,
    Paper,
    Typography,
    CircularProgress,
    Alert,
} from '@mui/material';
import { useNavigate, useParams,useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { PlataDetails } from '../types';
import { BreadcrumbContext } from '../context/BreadcrumbContext';

interface PlataArenda {
    id: string;
    tipPlata: string;
    cantitate: number;
    pretKg: number | null;
    valoareLei: number;
    metoda_plata: string | null;
    status: string;
    dataGenerarii: string;
    dataPlata: string;
    observatii: string;
    updated_at?: string;
}

export const EditPlataArenda: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const { setBreadcrumbLabel } = useContext(BreadcrumbContext);
    // const searchParams = location.state || {};
    const [formData, setFormData] = useState<PlataArenda>({
        id: '',
        tipPlata: 'lei',
        cantitate: 0,
        pretKg: null,
        valoareLei: 0,
        metoda_plata: null,
        status: 'generata',
        dataGenerarii: '',
        dataPlata: '',
        observatii: '',
        updated_at: undefined,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Încarcă datele plății existente din backend
    useEffect(() => {
        const loadPlata = async () => {
            if (!id) {
                setError('ID plății nu a fost găsit');
                setLoading(false);
                return;
            }

            try {
                const plata = await api.get(`/plati-arenda/${id}/`);
                const plataData: PlataDetails = plata.data;
                
                setFormData({
                    id: plataData.id_plata?.toString() || '',
                    tipPlata: plataData.tip_plata || 'lei',
                    cantitate: parseFloat(plataData.cantitate?.toString() || '0'),
                    pretKg: plataData.pret_kg ? parseFloat(plataData.pret_kg?.toString()) : null,
                    valoareLei: parseFloat(plataData.valoare_lei?.toString() || '0'),
                    metoda_plata: plataData.metoda_plata || null,

                    status: plataData.status || 'generata',
                    dataGenerarii: plataData.data_generarii?.split('T')[0] || '',
                    dataPlata: plataData.data_plata?.split('T')[0] || '',
                    observatii: plataData.observatii || '',
                    updated_at: plataData.updated_at || '',
                });
                setBreadcrumbLabel(`Plată #${id}`);
            } catch (err: any) {
                setError('Eroare la încărcare: ' + (err.response?.data?.error || err.message || 'Unknown error'));
            } finally {
                setLoading(false);
            }
        };

        loadPlata();
    }, [id, setBreadcrumbLabel]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'suma' ? parseFloat(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!formData.valoareLei || formData.valoareLei <= 0) {
                setError('Valoare lei trebuie să fie mai mare de 0');
                setLoading(false);
                return;
            }

            if (!id) {
                setError('ID plății nu a fost găsit');
                setLoading(false);
                return;
            }

            // PUT request să actualizeze plata
            const updateData = {
                tip_plata: formData.tipPlata,
                cantitate: formData.cantitate,
                pret_kg: formData.pretKg,
                valoare_lei: formData.valoareLei,
                metoda_plata: formData.metoda_plata,

                status: formData.status,
                data_plata: formData.dataPlata || null,
                observatii: formData.observatii,
                updated_at: formData.updated_at,
            };

            const response = await api.patch(`/plati-arenda/${id}/`, updateData);
            console.log('Update response:', response.data);
            
            // Update form data cu timestamp-ul din backend
            setFormData(prev => ({
                ...prev,
                updated_at: response.data.updated_at || new Date().toISOString(),
            }));
            
            // Actualizează plata din lista de rezultate
            const updatedPlati = (location.state?.plati || []).map((plata: any) => 
                plata.id_plata === parseInt(id || '0') ?  { ...plata, ...response.data } : plata
            );
            
            setSuccess(true);
            setTimeout(() => {
                navigate('/plati-arenda', { 
                    state: {
                        searchNumarContract: location.state?.searchNumarContract,
                        searchDataContract: location.state?.searchDataContract,
                        plati: updatedPlati
                    }
                });
            }, 1500);
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.response?.data?.detail || err.message || 'Eroare la salvare';
            setError(errorMsg);
            console.error('Update error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 600, margin: 'auto', padding: { xs: 1.5, sm: 3 } }}>
            <Paper elevation={3} sx={{ padding: { xs: 2, sm: 3 } }}>

                <Typography variant="h4" sx={{ marginBottom: 3, fontWeight: 'bold', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    Editare Plată Arendă
                </Typography>

                {loading && <CircularProgress />}

                {!loading && (
                    <>
                        {error && <Alert severity="error" sx={{ marginBottom: 2 }}>{error}</Alert>}
                        {success && <Alert severity="success" sx={{ marginBottom: 2 }}>Plată salvată cu succes!</Alert>}

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Tip Plată */}
                    <FormControl fullWidth required>
                        <InputLabel>Tip Plată</InputLabel>
                        <Select
                            name="tipPlata"
                            value={formData.tipPlata}
                            onChange={handleChange}
                            label="Tip Plată"
                        >
                            <MenuItem value="lei">Lei</MenuItem>
                            <MenuItem value="grau">Grâu</MenuItem>
                            <MenuItem value="porumb">Porumb</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Cantitate */}
                    <TextField
                        label="Cantitate"
                        type="number"
                        name="cantitate"
                        value={formData.cantitate}
                        onChange={handleChange}
                        inputProps={{ step: '0.01', min: 0 }}
                        fullWidth
                        required
                        variant="outlined"
                    />

                    {/* Preț/kg (optional) */}
                    <TextField
                        label="Preț/kg (opțional)"
                        type="number"
                        name="pretKg"
                        value={formData.pretKg || ''}
                        onChange={handleChange}
                        inputProps={{ step: '0.01', min: 0 }}
                        fullWidth
                        variant="outlined"
                    />

                    {/* Valoare Lei */}
                    <TextField
                        label="Valoare Lei *"
                        type="number"
                        name="valoareLei"
                        value={formData.valoareLei}
                        onChange={handleChange}
                        inputProps={{ step: '0.01', min: 0 }}
                        fullWidth
                        required
                        variant="outlined"
                    />

                    {/* Metodă Plată */}
                    <FormControl fullWidth>
                        <InputLabel>Metodă Plată</InputLabel>
                        <Select
                            name="metoda_plata"
                            value={formData.metoda_plata || ''}
                            onChange={handleChange}
                            label="Metodă Plată"
                        >
                            <MenuItem value="">--- Selectează ---</MenuItem>
                            <MenuItem value="cash">Cash</MenuItem>
                            <MenuItem value="transfer">Transfer Bancar</MenuItem>
                            <MenuItem value="card">Card</MenuItem>
                            <MenuItem value="cec">Cec</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Status */}
                    <FormControl fullWidth required>
                        <InputLabel>Status</InputLabel>
                        <Select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            label="Status"
                        >
                            <MenuItem value="generata">Generată</MenuItem>
                            <MenuItem value="platita">Plătită</MenuItem>
                            <MenuItem value="anulata">Anulată</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Data Generării (read-only) */}
                    <TextField
                        label="Data Generării"
                        type="date"
                        value={formData.dataGenerarii}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ readOnly: true }}
                        variant="outlined"
                    />

                    {/* Data Plătii */}
                    <TextField
                        label="Data Plații"
                        type="date"
                        name="dataPlata"
                        value={formData.dataPlata}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                    />

                    {/* Observații */}
                    <TextField
                        label="Observații"
                        name="observatii"
                        value={formData.observatii}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={3}
                        placeholder="Notă opțională..."
                    />

                    {/* Ultima actualizare (read-only) */}
                    <TextField
                        label="Ultima Actualizare"
                        type="datetime-local"
                        value={formData.updated_at ? formData.updated_at.split('.')[0].replace('Z', '') : ''}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ readOnly: true }}
                        variant="outlined"
                    />

                    <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column-reverse', sm: 'row' },
                    gap: 2,
                    justifyContent: 'flex-end',
                    marginTop: 2,
                }}>
                        <Button
                            variant="outlined"
                            color="inherit"
                            onClick={() => navigate('/plati-arenda')}
                            disabled={loading}
                        >
                            Anulează
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loading}
                            sx={{ minWidth: 120 }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Salvează'}
                        </Button>
                    </Box>
                </Box>
                    </>
                )}
            </Paper>
        </Box>
    );
};