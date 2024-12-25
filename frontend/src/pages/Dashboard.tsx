import React from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    Button,
    AppBar,
    Toolbar,
    IconButton,
    Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
    Home as HomeIcon,
    Assignment as AssignmentIcon,
    Add as AddIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const canCreatePassport = user?.role === 'Dentist';

    const menuItems = [
        {
            title: 'Passaporti Implantari',
            description: 'Visualizza e gestisci tutti i passaporti implantari',
            icon: AssignmentIcon,
            action: () => navigate('/passports'),
            primary: true
        },
        ...(canCreatePassport ? [{
            title: 'Nuovo Passaporto',
            description: 'Crea un nuovo passaporto implantare',
            icon: AddIcon,
            action: () => navigate('/passports/create'),
            primary: false
        }] : [])
    ];

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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PersonIcon />
                                <Typography variant="body2">
                                    {user.email}
                                </Typography>
                            </Box>
                            <Chip
                                label={user.role === 'Admin' ? 'Amministratore' : user.role === 'Dentist' ? 'Dentista' : 'Paziente'}
                                color="secondary"
                                variant="outlined"
                                sx={{ color: 'white', borderColor: 'white' }}
                            />
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 500, mb: 1 }}>
                        Benvenuto nel Sistema di Gestione
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Seleziona un'opzione per iniziare
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {menuItems.map((item, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                            <Paper
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    borderRadius: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 3
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                                    <item.icon 
                                        sx={{ 
                                            fontSize: 40, 
                                            color: item.primary ? 'primary.main' : 'secondary.main',
                                            mr: 2 
                                        }} 
                                    />
                                    <Box>
                                        <Typography variant="h6" gutterBottom>
                                            {item.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            {item.description}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ mt: 'auto' }}>
                                    <Button
                                        variant={item.primary ? "contained" : "outlined"}
                                        onClick={item.action}
                                        fullWidth
                                        sx={{ 
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            py: 1
                                        }}
                                    >
                                        {item.primary ? 'Visualizza' : 'Crea Nuovo'}
                                    </Button>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </>
    );
};

export default Dashboard;
