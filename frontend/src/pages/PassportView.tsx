import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Button,
    Grid,
    Divider,
    CircularProgress,
    AppBar,
    Toolbar,
    IconButton,
    Chip
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    ArrowBack as ArrowBackIcon, 
    PictureAsPdf as PdfIcon,
    Home as HomeIcon 
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { Passport } from '../types/models';
import { passportService } from '../services/passportService';

const PassportView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [passport, setPassport] = useState<Passport | null>(null);
    const [downloadingPdf, setDownloadingPdf] = useState(false);

    useEffect(() => {
        const fetchPassport = async () => {
            try {
                if (!id) return;
                const data = await passportService.getPassport(id);
                setPassport(data);
                setError(null);
            } catch (err: any) {
                console.error('Error fetching passport:', err);
                setError('Errore durante il recupero del passaporto');
            } finally {
                setLoading(false);
            }
        };

        fetchPassport();
    }, [id]);

    const handleDownloadPdf = async () => {
        if (!id) return;
        setDownloadingPdf(true);
        try {
            const pdfBlob = await passportService.downloadPDF(id);
            const url = window.URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `passaporto-implantare-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error('Error downloading PDF:', err);
            setError('Errore durante il download del PDF');
        } finally {
            setDownloadingPdf(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

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
                {error ? (
                    <Box sx={{ mt: 4, mb: 4 }}>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate('/passports')}
                            sx={{ mb: 3 }}
                        >
                            Torna alla Lista
                        </Button>

                        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'error.light', color: 'error.contrastText' }}>
                            <Typography variant="h6">
                                {error}
                            </Typography>
                        </Paper>
                    </Box>
                ) : passport && (
                    <Box sx={{ mt: 2, mb: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                            <Button
                                startIcon={<ArrowBackIcon />}
                                onClick={() => navigate('/passports')}
                                variant="outlined"
                                sx={{ 
                                    borderRadius: 2,
                                    textTransform: 'none'
                                }}
                            >
                                Torna alla Lista
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<PdfIcon />}
                                onClick={handleDownloadPdf}
                                disabled={downloadingPdf}
                                sx={{ 
                                    borderRadius: 2,
                                    textTransform: 'none'
                                }}
                            >
                                {downloadingPdf ? 'Download in corso...' : 'Scarica PDF'}
                            </Button>
                        </Box>

                        <Paper sx={{ p: 4, borderRadius: 2 }}>
                            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 500, mb: 3 }}>
                                Passaporto Implantare
                            </Typography>

                            <Divider sx={{ mb: 4 }} />

                            <Grid container spacing={4}>
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, color: 'primary.main' }}>
                                        Informazioni Paziente
                                    </Typography>
                                    <Box sx={{ pl: 2 }}>
                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            <strong>Nome:</strong> {passport.patient_name}
                                        </Typography>
                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            <strong>Data di Nascita:</strong> {new Date(passport.date_of_birth).toLocaleDateString('it-IT')}
                                        </Typography>
                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            <strong>Età:</strong> {passport.patient_age} anni
                                        </Typography>
                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            <strong>Data Creazione:</strong> {new Date(passport.created_at).toLocaleDateString('it-IT')}
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, color: 'primary.main' }}>
                                        Dettagli Impianto
                                    </Typography>
                                    <Box sx={{ pl: 2 }}>
                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            <strong>Tipo:</strong> {passport.implant_type}
                                        </Typography>
                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            <strong>Marca:</strong> {passport.implant_details.brand}
                                        </Typography>
                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            <strong>Numero Lotto:</strong> {passport.implant_details.lot_number}
                                        </Typography>
                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            <strong>Data Impianto:</strong> {new Date(passport.implant_details.implant_date).toLocaleDateString('it-IT')}
                                        </Typography>
                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            <strong>Posizione:</strong> {passport.implant_details.position}
                                        </Typography>
                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            <strong>Diametro:</strong> {passport.implant_details.diameter} mm
                                        </Typography>
                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            <strong>Lunghezza:</strong> {passport.implant_details.length} mm
                                        </Typography>
                                        {passport.implant_details.notes && (
                                            <Typography variant="body1" sx={{ mb: 1 }}>
                                                <strong>Note:</strong> {passport.implant_details.notes}
                                            </Typography>
                                        )}
                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            <strong>Stato:</strong>{' '}
                                            <Chip
                                                label={passport.status === 'Active' ? 'Attivo' : 'Archiviato'}
                                                color={passport.status === 'Active' ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </Typography>
                                    </Box>
                                </Grid>

                                {user?.role === 'Admin' && (
                                    <Grid item xs={12}>
                                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, color: 'primary.main' }}>
                                            Informazioni Amministrative
                                        </Typography>
                                        <Box sx={{ pl: 2 }}>
                                            <Typography variant="body1" sx={{ mb: 1 }}>
                                                <strong>ID Dentista:</strong> {passport.dentist_id}
                                                {passport.patient_id && (
                                                    <>
                                                        <br />
                                                        <strong>ID Paziente:</strong> {passport.patient_id}
                                                    </>
                                                )}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>
                    </Box>
                )}
            </Container>
        </>
    );
};

export default PassportView;
