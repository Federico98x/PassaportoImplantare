import React from 'react';
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Error as ErrorIcon } from '@mui/icons-material';

const Unauthorized: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center' }}>
                    <ErrorIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
                    
                    <Typography variant="h4" component="h1" gutterBottom color="error">
                        Access Denied
                    </Typography>

                    <Typography variant="body1" color="text.secondary" paragraph>
                        You don't have permission to access this page.
                        {user?.role && (
                            <>
                                <br />
                                Your current role is: <strong>{user.role}</strong>
                            </>
                        )}
                    </Typography>

                    <Box sx={{ mt: 4 }}>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/dashboard')}
                            sx={{ mr: 2 }}
                        >
                            Return to Dashboard
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => navigate(-1)}
                        >
                            Go Back
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Unauthorized;
