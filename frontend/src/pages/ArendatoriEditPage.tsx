import React, { useState, useEffect } from 'react';
import { getArendatorDetails, updateArendator,formatDate} from '../services/api';
import { Box, Paper, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useContext } from 'react';
import { BreadcrumbContext } from '../context/BreadcrumbContext';

export const ArendatoriEditPage: React.FC = () => {
    const navigate = useNavigate();
    const {setBreadcrumbLabel}=useContext(BreadcrumbContext);
    const { id } = useParams<{ id: string }>();
   
    const [formData, setFormData] = useState({
        nume: '',
        adresa: '',
        cnp: '',
        ci_serie: '',
        ci_nr: '',
        ci_el: '', // CI eliberare
        ci_data: '', // CI data
        telefon: '',
    });

    // loadingData = “iau datele existente din API înainte de afișare”
    // loading = “trimit modificările la API în formularul deja afișat”
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

// Încarcă datele arendatorului la montarea componentei
    useEffect(() => {
        const loadArendator = async () => {
            try {
                setLoadingData(true);
                setBreadcrumbLabel(''); // Reset label before loading new data
                if (!id) {
                    setError('ID arendator invalid');
                    return;
                }
                const data = await getArendatorDetails(Number(id));
                setFormData({
                    nume: data.nume,
                    adresa: data.adresa,
                    cnp: data.cnp,
                    ci_serie: data.ci_serie,
                    ci_nr: data.ci_nr,
                    ci_el: data.ci_el,
                    ci_data: formatDate(data.ci_data),
                    telefon: data.telefon,
                });
                setBreadcrumbLabel(data.nume);
            } catch (err) {
                setError('Eroare la încărcarea arendatorului: ' + err);
                console.error('Eroare:', err);
            } finally {
                setLoadingData(false);
            }
        };

        loadArendator();
    }, [id,setBreadcrumbLabel]);

    const validateForm = () => {
        const errors: string[] = [];

        if (!formData.nume.trim()) errors.push('Numele este obligatoriu');
        if (!formData.cnp.trim()) errors.push('CNP-ul este obligatoriu');
        if (isNaN(Number(formData.cnp))) errors.push('CNP-ul trebuie să fie numeric');
        if (!formData.ci_serie.trim()) errors.push('Seria CI este obligatorie');
        if (!formData.ci_nr.trim()) errors.push('Numărul CI este obligatoriu');
        if (!formData.adresa.trim()) errors.push('Adresa este obligatorie');

        return errors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setError(validationErrors.join(', '));
            return;
        }
        try {
            setLoading(true);
            setError(null);
            if (!id) {
                setError('ID arendator invalid');
                return;
            }
            await updateArendator(Number(id), formData);
            setSuccess(true);
            setTimeout(() => {
                navigate(`/arendatori/${id}`);
            }, 2000);
        } catch (err) {
            setError('Eroare la actualizarea arendatorului: ' + err);
            console.error('Eroare:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [field]: e.target.value,
        });
    };

    if (loadingData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ backgroundColor: 'white', minHeight: { xs: 'auto', sm: '100vh' }, p: { xs: 1.5, sm: 2, md: 3 } }}>
            {/* Header cu buton înapoi */}
            <Box sx={{ mb: { xs: 2, sm: 3 }, display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap' }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(`/arendatori/${id}`)}
                    variant="outlined"
                    disabled={loading}
                >
                    Înapoi la Detalii
                </Button>
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                        fontSize: { xs: '1.5rem', sm: '2rem' },
                        lineHeight: { xs: 1.3, sm: 1.2 }
                    }}
                >
                    Editare Arendator
                </Typography>
            </Box>

            {/* Success Message */}
            {success && (
                <Alert severity="success" sx={{ mb: 3, maxWidth: { xs: '100%', sm: '90%', md: '80%' } }}>
                    Arendator actualizat cu succes! Redirectare în curs...
                </Alert>
            )}

            {/* Error Message */}
            {error && (
                <Alert severity="error" sx={{ mb: 3, maxWidth: { xs: '100%', sm: '90%', md: '80%' } }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ maxWidth: { xs: '100%', sm: '90%', md: '80%' } }}>
                <Paper sx={{ p: { xs: 1, sm: 1.5, md: 2 } }}>
                    <form onSubmit={handleSubmit}>
                        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main',fontSize: { xs: "1.5rem", sm: "2rem" }, }}>
                            Informații Arendator
                        </Typography>

                        {/* Layout în 3 coloane */}
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                            gap: { xs: 2, md: 3 }
                        }}>
                            {/* Nume */}
                            <TextField
                                label="Nume Arendator"
                                value={formData.nume}
                                onChange={handleInputChange('nume')}
                                fullWidth
                                required
                                size="small"
                                variant="outlined"
                                disabled={loading || loadingData}
                            />

                            {/* Adresa */}
                            <TextField
                                label="Adresa"
                                value={formData.adresa}
                                onChange={handleInputChange('adresa')}
                                fullWidth
                                required
                                size="small"
                                variant="outlined"
                                disabled={loading || loadingData}
                            />

                            {/* CNP */}
                            <TextField
                                label="CNP"
                                value={formData.cnp}
                                onChange={handleInputChange('cnp')}
                                fullWidth
                                required
                                size="small"
                                variant="outlined"
                                disabled={loading || loadingData}
                                inputProps={{ maxLength: 13 }}
                                helperText="13 cifre"
                            />

                            {/* CI Seria */}
                            <TextField
                                label="CI - Seria"
                                value={formData.ci_serie}
                                onChange={handleInputChange('ci_serie')}
                                fullWidth
                                required
                                size="small"
                                variant="outlined"
                                disabled={loading || loadingData}
                            />

                            {/* CI Număr */}
                            <TextField
                                label="CI - Număr"
                                value={formData.ci_nr}
                                onChange={handleInputChange('ci_nr')}
                                fullWidth
                                required
                                size="small"
                                variant="outlined"
                                disabled={loading || loadingData}
                            />

                            {/* CI Eliberare */}
                            <TextField
                                label="CI - Eliberată de"
                                value={formData.ci_el}
                                onChange={handleInputChange('ci_el')}
                                fullWidth
                                required
                                size="small"
                                variant="outlined"
                                disabled={loading || loadingData}
                            />

                            {/* CI Data */}
                            <TextField
                                label="CI - Data Eliberării"
                                name="ci_data"
                          
                                value={formData.ci_data}
                                onChange={handleInputChange('ci_data')}
                                fullWidth
                                size="small"
                                variant="outlined"
                                disabled={loading || loadingData}
                                placeholder="YYYY-MM-DD"
                            />

                            {/* Telefon */}
                            <TextField
                                label="Telefon"
                                value={formData.telefon}
                                onChange={handleInputChange('telefon')}
                                fullWidth
                                size="small"
                                variant="outlined"
                                disabled={loading || loadingData}
                            />
                        </Box>

                        {/* Butoane de acțiune */}
                        <Box sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                startIcon={<Save />}
                                disabled={loading || loadingData}
                                sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
                            >
                                {loading ? 'Se salvează...' : 'Salvare Modificări'}
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => navigate(`/arendatori/${id}`)}
                                disabled={loading}
                                sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
                            >
                                Anulare
                            </Button>
                        </Box>
                    </form>
                </Paper>
            </Box>
        </Box>
    );
};