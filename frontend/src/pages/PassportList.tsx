import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    AppBar,
    Toolbar,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
    Add as AddIcon, 
    Home as HomeIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { Passport } from '../types/models';
import { passportService } from '../services/passportService';

const PassportList: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const canCreatePassport = user?.role === 'Dentist';
    const canDeletePassport = user?.role === 'Admin';

    const [passports, setPassports] = useState<Passport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [passportToDelete, setPassportToDelete] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        const fetchPassports = async () => {
            try {
                const response = await passportService.listPassports();
                setPassports(response.passports);
                setError(null);
            } catch (err: any) {
                console.error('Error fetching passports:', err);
                setError('Errore durante il recupero dei passaporti');
            } finally {
                setLoading(false);
            }
        };

        fetchPassports();
    }, []);

    const handleDeleteClick = (passportId: string) => {
        setPassportToDelete(passportId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!passportToDelete) return;
        setDeleteLoading(true);
        try {
            await passportService.deletePassport(passportToDelete);
            setPassports(passports.filter(p => p._id !== passportToDelete));
            setDeleteDialogOpen(false);
            setPassportToDelete(null);
        } catch (err: any) {
            console.error('Error deleting passport:', err);
            setError('Errore durante l\'eliminazione del passaporto');
        } finally {
            setDeleteLoading(false);
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
                        Gestione Passaporti Implantari
                    </Typography>
                    {user && (
                        <Chip
                            label={user.role === 'Admin' ? 'Amministratore' : user.role === 'Dentist' ? 'Dentista' : 'Paziente'}
                            color="secondary"
                            variant="outlined"
                            sx={{ color: 'white', borderColor: 'white' }}
                        />
                    )}
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Box>
                            <Typography variant="h4" component="h1" sx={{ fontWeight: 500 }}>
                                Passaporti Implantari
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
                                Gestisci i passaporti implantari dei tuoi pazienti
                            </Typography>
                        </Box>
                        {canCreatePassport && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => navigate('/passports/create')}
                                sx={{ 
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    px: 3,
                                    py: 1
                                }}
                            >
                                Nuovo Passaporto
                            </Button>
                        )}
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Nome Paziente</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Data Creazione</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Tipo Impianto</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Stato</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Azioni</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {passports.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                                <Typography variant="body1" color="text.secondary">
                                                    {canCreatePassport 
                                                        ? 'Non hai ancora creato nessun passaporto. Clicca su "Nuovo Passaporto" per iniziare.'
                                                        : 'Nessun passaporto trovato'}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        passports.map((passport) => (
                                            <TableRow 
                                                key={passport._id}
                                                hover
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell>{passport.patient_name}</TableCell>
                                                <TableCell>
                                                    {new Date(passport.created_at).toLocaleDateString('it-IT', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric'
                                                    })}
                                                </TableCell>
                                                <TableCell>{passport.implant_type}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={passport.status === 'Active' ? 'Attivo' : 'Archiviato'}
                                                        color={passport.status === 'Active' ? 'success' : 'default'}
                                                        size="small"
                                                        sx={{ minWidth: 80 }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() => navigate(`/passports/${passport._id}`)}
                                                            startIcon={<VisibilityIcon />}
                                                            sx={{ 
                                                                borderRadius: 2,
                                                                textTransform: 'none'
                                                            }}
                                                        >
                                                            Visualizza
                                                        </Button>
                                                        {canDeletePassport && (
                                                            <Button
                                                                variant="outlined"
                                                                color="error"
                                                                size="small"
                                                                onClick={() => handleDeleteClick(passport._id)}
                                                                startIcon={<DeleteIcon />}
                                                                sx={{ 
                                                                    borderRadius: 2,
                                                                    textTransform: 'none'
                                                                }}
                                                            >
                                                                Elimina
                                                            </Button>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Box>
            </Container>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => !deleteLoading && setDeleteDialogOpen(false)}
                aria-labelledby="delete-dialog-title"
                sx={{ '& .MuiDialog-paper': { borderRadius: 2 } }}
            >
                <DialogTitle id="delete-dialog-title">
                    Conferma Eliminazione
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Sei sicuro di voler eliminare questo passaporto? Questa azione non può essere annullata.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
                    <Button 
                        onClick={() => setDeleteDialogOpen(false)}
                        disabled={deleteLoading}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                        Annulla
                    </Button>
                    <Button 
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        disabled={deleteLoading}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                        {deleteLoading ? 'Eliminazione...' : 'Elimina'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PassportList;
