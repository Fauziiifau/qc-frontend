import { data } from 'autoprefixer';
import api from '../api/axiosConfig';

export const uploadPhoto = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error("Gagal upload foto:", error);
    throw error;
  }
};
export const saveDefectData = async (formData, photoFileName) => {
  try {
    const payload = {
      partId: parseInt(formData.partId),
      defectTypeId: parseInt(formData.defectTypeId),
      proses: formData.proses,
      quantity: parseInt(formData.quantity),
      operatorName: formData.operatorName,
      remarks: formData.remarks,
      photoUrl: photoFileName,
      defectDate: formData.defectDate
    };
    const response = await api.post('/ng-data', payload);
    return response.data;
  } catch (error) {
    console.error("Gagal menyimpan data defect:", error);
    throw error;
  }
};