import api from '../api/axiosConfig';
import { uploadPhoto } from './ngDataService';

export const saveComplaint = async (payload, photoFile) => {
    try {
        let uploadedFileName = null
        if (photoFile) {
            uploadedFileName = await uploadPhoto(photoFile);
            payload.photoUrl = uploadedFileName;
        }
        const response = await api.post('/complaints', payload);
        return response.data;
    } catch (error) {
        console.error("Gagal menyimpan data komplain:", error);
        throw error;
    }
};