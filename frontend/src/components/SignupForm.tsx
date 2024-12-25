import React, { useState } from 'react';
import {
    TextField,
    Button,
    Box,
    Alert,
    CircularProgress,
    Paper,
    Typography,
    Link,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignupForm: React.FC = () => {
    const navigate = useNavigate();
    const { signup, error: authError, clearError } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Dentist'
    });
    const [formErrors, setFormErrors] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        role: ''
    });

    const validateForm = () => {
        let isValid = true;
        const errors = {
            email: '',
            password: '',
            confirmPassword: '',
            role: ''
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
        } else if (formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters long';
            isValid = false;
        } else if (!/\d/.test(formData.password)) {
            errors.password = 'Password must contain at least one number';
            isValid = false;
        } else if (!/[a-zA-Z]/.test(formData.password)) {
            errors.password = 'Password must contain at least one letter';
            isValid = false;
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
            isValid = false;
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        // Role validation
        if (!formData.role) {
            errors.role = 'Please select a role';
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

    const handleRoleChange = (e: SelectChangeEvent) => {
        setFormData(prev => ({
            ...prev,
            role: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await signup(formData.email, formData.password, formData.role);
            navigate('/dashboard');
        } catch (error) {
            // Error is handled by auth context
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
            <Typography variant="h5" component="h1" align="center" gutterBottom>
                Sign Up
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
                    disabled={loading}
                />

                <TextField
                    fullWidth
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={!!formErrors.confirmPassword}
                    helperText={formErrors.confirmPassword}
                    margin="normal"
                    disabled={loading}
                />

                <FormControl fullWidth margin="normal" error={!!formErrors.role}>
                    <InputLabel>Role</InputLabel>
                    <Select
                        value={formData.role}
                        label="Role"
                        onChange={handleRoleChange}
                        disabled={loading}
                    >
                        <MenuItem value="Dentist">Dentist</MenuItem>
                        <MenuItem value="Patient">Patient</MenuItem>
                    </Select>
                </FormControl>

                <Box sx={{ mt: 3 }}>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        sx={{ mb: 2 }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Sign Up'}
                    </Button>

                    <Typography align="center" variant="body2">
                        Already have an account?{' '}
                        <Link component={RouterLink} to="/login">
                            Login
                        </Link>
                    </Typography>
                </Box>
            </form>
        </Paper>
    );
};

export default SignupForm;
