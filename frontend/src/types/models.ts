export interface PaginatedResponse<T> {
    passports: T[];
    pagination: {
        current: number;
        pages: number;
        total: number;
    };
}

export interface User {
    _id: string;
    email: string;
    role: 'Admin' | 'Dentist' | 'Patient';
}

export interface ImplantDetails {
    brand: string;
    lot_number: string;
    implant_date: string; // Will be Date when parsed
    position: string;
    diameter: number;
    length: number;
    notes?: string;
}

export interface Passport {
    _id: string;
    patient_name: string;
    date_of_birth: string; // Will be Date when parsed
    implant_details: ImplantDetails;
    implant_type: string;
    status: 'Active' | 'Archived';
    dentist_id: string;
    patient_id?: string;
    pdf_url?: string;
    created_at: string;
    updated_at: string;
    patient_age?: number; // Virtual field from backend
}

export interface AuthResponse {
    user: User;
    token: string;
}
