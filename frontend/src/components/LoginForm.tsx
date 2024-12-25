import React, { useState } from 'react';
import {
    TextField,
    Button,
    Box,
    Alert,
    CircularProgress,
    Paper,
    Typography,
    Link
} from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LocationState {
    from?: string;
}

const LoginForm: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, error: authError, clearError } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [formErrors, setFormErrors] = useState({
        email: '',
        password: ''
    });

    const validateForm = () => {
        let isValid = true;
        const errors = {
            email: '',
            password: ''
        };

        // Email validation
        if (!formData.email) {
            errors.email = 'Email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
            isValid = false;
        }

        // Password validation
        if (!formData.password) {
            errors.password = 'Password is required';
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear errors when user starts typing
        if (formErrors[name as keyof typeof formErrors]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        if (authError) {
            clearError();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await login(formData.email, formData.password);
            const locationState = location.state as LocationState;
            navigate(locationState?.from || '/dashboard');
        } catch (error) {
            // Error is handled by auth context
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
            <Typography variant="h5" component="h1" align="center" gutterBottom>
                Login
            </Typography>

            {authError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {authError}
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                    margin="normal"
                    autoComplete="email"
                    disabled={loading}
                />

                <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    error={!!formErrors.password}
                    helperText={formErrors.password}
                    margin="normal"
                    autoComplete="current-password"
                    disabled={loading}
                />

                <Box sx={{ mt: 3 }}>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        sx={{ mb: 2 }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Login'}
                    </Button>

                    <Typography align="center" variant="body2">
                        Don't have an account?{' '}
                        <Link component={RouterLink} to="/signup">
                            Sign up
                        </Link>
                    </Typography>
                </Box>
            </form>
        </Paper>
    );
};

export default LoginForm;
