import axiosInstance from './axios';

interface User {
    _id: string;
    email: string;
    role: 'Admin' | 'Dentist' | 'Patient';
}

interface AuthResponse {
    user: User;
    token: string;
}

class AuthService {
    async login(email: string, password: string): Promise<AuthResponse> {
        const response = await axiosInstance.post<AuthResponse>('/auth/login', {
            email,
            password
        });
        this.setToken(response.data.token);
        return response.data;
    }

    async signup(email: string, password: string, role: string): Promise<AuthResponse> {
        const response = await axiosInstance.post<AuthResponse>('/auth/signup', {
            email,
            password,
            role
        });
        this.setToken(response.data.token);
        return response.data;
    }

    logout(): void {
        localStorage.removeItem('token');
        axiosInstance.defaults.headers.common['Authorization'] = '';
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    private setToken(token: string): void {
        localStorage.setItem('token', token);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
}

export const authService = new AuthService();
