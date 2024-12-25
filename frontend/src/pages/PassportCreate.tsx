import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Button,
    TextField,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    AppBar,
    Toolbar,
    IconButton,
    Chip,
    CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon, Home as HomeIcon } from '@mui/icons-material';
import { passportService } from '../services/passportService';
import { useAuth } from '../context/AuthContext';

const PassportCreate: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const formData = new FormData(e.currentTarget);
            const data = {
                patient_name: formData.get('patient_name') as string,
                date_of_birth: formData.get('date_of_birth') as string,
                implant_type: formData.get('implant_type') as string,
                implant_details: {
                    brand: formData.get('brand') as string,
                    lot_number: formData.get('lot_number') as string,
                    implant_date: formData.get('implant_date') as string,
                    position: formData.get('position') as string,
                    diameter: Number(formData.get('diameter')),
                    length: Number(formData.get('length')),
                    notes: formData.get('notes') as string || undefined
                },
                status: 'Active' as const
            };

            await passportService.createPassport(data);
            navigate('/passports');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 
                               err.response?.data?.error || 
                               'Si è verificato un errore durante la creazione del passaporto. Riprova.';
            setError(errorMessage);
            console.error('Error creating passport:', {
                error: err,
                response: err.response?.data,
                requestData: err.config?.data
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AppBar position="static" color="primary" elevation={0}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={() => navigate('/')}
                        size="large"
                    >
                        <HomeIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 2 }}>
                        Passaporto Implantare
                    </Typography>
                    {user && (
                        <Chip
                            label={`${user.role}`}
                            color="secondary"
                            variant="outlined"
                            sx={{ color: 'white', borderColor: 'white' }}
                        />
                    )}
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/passports')}
                        variant="outlined"
                        sx={{ 
                            mb: 3,
                            borderRadius: 2,
                            textTransform: 'none'
                        }}
                    >
                        Torna alla Lista
                    </Button>

                    <Paper sx={{ p: 4, borderRadius: 2 }}>
                        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 500, mb: 4 }}>
                            Nuovo Passaporto Implantare
                        </Typography>

                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, color: 'primary.main' }}>
                                        Informazioni Paziente
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Nome Paziente"
                                        name="patient_name"
                                        required
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Data di Nascita"
                                        type="date"
                                        name="date_of_birth"
                                        InputLabelProps={{ shrink: true }}
                                        required
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, color: 'primary.main', mt: 2 }}>
                                        Informazioni Impianto
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth required>
                                        <InputLabel>Tipo Impianto</InputLabel>
                                        <Select
                                            label="Tipo Impianto"
                                            name="implant_type"
                                            defaultValue=""
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        >
                                            <MenuItem value="Titanio Standard">Titanio Standard</MenuItem>
                                            <MenuItem value="Titanio Premium">Titanio Premium</MenuItem>
                                            <MenuItem value="Ceramica">Ceramica</MenuItem>
                                            <MenuItem value="Zirconia">Zirconia</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Marca"
                                        name="brand"
                                        required
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Numero Lotto"
                                        name="lot_number"
                                        required
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Data Impianto"
                                        type="date"
                                        name="implant_date"
                                        InputLabelProps={{ shrink: true }}
                                        required
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Posizione"
                                        name="position"
                                        required
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        fullWidth
                                        label="Diametro (mm)"
                                        name="diameter"
                                        type="number"
                                        inputProps={{ step: 0.1 }}
                                        required
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        fullWidth
                                        label="Lunghezza (mm)"
                                        name="length"
                                        type="number"
                                        inputProps={{ step: 0.5 }}
                                        required
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Note Aggiuntive"
                                        name="notes"
                                        multiline
                                        rows={4}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Grid>

                                {error && (
                                    <Grid item xs={12}>
                                        <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText', borderRadius: 2 }}>
                                            <Typography variant="body2">
                                                {error}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                )}

                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                                        <Button
                                            variant="outlined"
                                            onClick={() => navigate('/passports')}
                                            sx={{ 
                                                borderRadius: 2,
                                                textTransform: 'none'
                                            }}
                                        >
                                            Annulla
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={loading}
                                            sx={{ 
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                minWidth: 150
                                            }}
                                        >
                                            {loading ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <CircularProgress size={20} color="inherit" />
                                                    <span>Creazione...</span>
                                                </Box>
                                            ) : 'Crea Passaporto'}
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </Box>
            </Container>
        </>
    );
};

export default PassportCreate;
