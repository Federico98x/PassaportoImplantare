import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';

// Import components and context
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Import pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import PassportList from './pages/PassportList';
import PassportCreate from './pages/PassportCreate';
import PassportView from './pages/PassportView';
import Unauthorized from './pages/Unauthorized';

// Import styles
import './App.css';

// Create theme (you can customize this further)
const theme = createTheme({
    palette: {
        primary: {
            main: '#007bff'
        },
        secondary: {
            main: '#6c757d'
        }
    }
});

// Loading component
const LoadingFallback = () => (
    <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
    }}>
        Loading...
    </div>
);

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <ErrorBoundary>
                    <AuthProvider>
                        <React.Suspense fallback={<LoadingFallback />}>
                            <Routes>
                                {/* Public routes */}
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<Signup />} />
                                <Route path="/unauthorized" element={<Unauthorized />} />

                                {/* Protected routes */}
                                <Route path="/dashboard" element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                } />

                                {/* Passport routes (Dentist & Admin only) */}
                                <Route path="/passports" element={
                                    <ProtectedRoute allowedRoles={['Dentist', 'Admin']}>
                                        <PassportList />
                                    </ProtectedRoute>
                                } />
                                <Route path="/passports/create" element={
                                    <ProtectedRoute allowedRoles={['Dentist']}>
                                        <PassportCreate />
                                    </ProtectedRoute>
                                } />
                                <Route path="/passports/:id" element={
                                    <ProtectedRoute allowedRoles={['Dentist', 'Admin']}>
                                        <PassportView />
                                    </ProtectedRoute>
                                } />

                                {/* Redirect root to dashboard if authenticated, otherwise to login */}
                                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                                {/* Catch all route */}
                                <Route path="*" element={<Navigate to="/dashboard" replace />} />
                            </Routes>
                        </React.Suspense>
                    </AuthProvider>
                </ErrorBoundary>
            </Router>
        </ThemeProvider>
    );
}

export default App;
