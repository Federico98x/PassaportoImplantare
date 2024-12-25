import axios from './axios';
import { Passport, PaginatedResponse } from '../types/models';

interface CreatePassportData {
    patient_name: string;
    date_of_birth: string;
    implant_details: {
        brand: string;
        lot_number: string;
        implant_date: string;
        position: string;
        diameter: number;
        length: number;
        notes?: string;
    };
    implant_type: string;
    status?: 'Active' | 'Archived';
}

interface ListPassportsParams {
    page?: number;
    limit?: number;
}

export const passportService = {
    /**
     * Create new passport
     */
    async createPassport(data: CreatePassportData): Promise<Passport> {
        console.log('Creating passport with data:', data); // Debug log
        const response = await axios.post<{ passport: Passport }>('/passport', data);
        return response.data.passport;
    },

    /**
     * Get passport by ID
     */
    async getPassport(id: string): Promise<Passport> {
        const response = await axios.get<Passport>(`/passport/${id}`);
        return response.data;
    },

    /**
     * List passports with pagination
     */
    async listPassports(params: ListPassportsParams = {}): Promise<PaginatedResponse<Passport>> {
        const { page = 1, limit = 10 } = params;
        const response = await axios.get<PaginatedResponse<Passport>>('/passport', {
            params: { page, limit }
        });
        return response.data;
    },

    /**
     * Update passport
     */
    async updatePassport(id: string, data: Partial<CreatePassportData>): Promise<Passport> {
        // Convert data to match backend expectations
        const requestData = data.implant_details ? {
            ...data,
            implant_details: {
                ...data.implant_details,
                lotNumber: data.implant_details.lot_number,
                implantDate: data.implant_details.implant_date
            }
        } : data;
        const response = await axios.put<{ passport: Passport }>(`/passport/${id}`, requestData);
        return response.data.passport;
    },

    /**
     * Delete passport (Admin only)
     */
    async deletePassport(id: string): Promise<void> {
        await axios.delete(`/passport/${id}`);
    },

    /**
     * Download passport PDF
     */
    async downloadPDF(id: string): Promise<Blob> {
        const response = await axios.get(`/passport/${id}/pdf`, {
            responseType: 'blob'
        });
        return response.data;
    },

    /**
     * Helper to open PDF in new tab
     */
    openPDFInNewTab(pdfBlob: Blob): void {
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
        URL.revokeObjectURL(pdfUrl);
    }
};
