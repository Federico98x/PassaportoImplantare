import React, { createContext, useContext, useState, useCallback } from 'react';
import { authService } from '../services/authService';

interface User {
    _id: string;
    email: string;
    role: 'Admin' | 'Dentist' | 'Patient';
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, role: string) => Promise<void>;
    logout: () => void;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = useCallback(async (email: string, password: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authService.login(email, password);
            setUser(response.user);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during login');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const signup = useCallback(async (email: string, password: string, role: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authService.signup(email, password, role);
            setUser(response.user);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during signup');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        authService.logout();
        setUser(null);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                login,
                signup,
                logout,
                clearError
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
