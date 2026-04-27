import api from '../api/axiosConfig';

export const saveBatchProduction = async (payload) => {
    try {
        const response = await api.post('/production/batch', payload);
        return response.data;
    } catch (error) {
        console.error("Gagal menyimpan data batch produksi:", error);
        throw error;
    }
};