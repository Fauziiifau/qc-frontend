import api from '../api/axiosConfig';

export const fetchParetoData = async () => {
  try {
    const response = await api.get('/dashboard/pareto');
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data Pareto:", error);
    throw error;
  }
};
export const fetchKpiSummary = async () => {
  try {
    const response = await api.get('/dashboard/summary');
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data KPI:", error);
    throw error;
  }
};