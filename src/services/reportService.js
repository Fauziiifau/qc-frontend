import api from '../api/axiosConfig';

export const fetchReportData = async (startDate, endDate, reportType) => {
    try {
        const response = await api.get('/reports/generate', {
            params: {
                startDate: startDate,
                endDate: endDate,
                type: reportType
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching report data:", error);
        throw error;
    }
};