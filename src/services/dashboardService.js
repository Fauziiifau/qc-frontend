import api from '../api/axiosConfig';

export const fetchParetoData = async (startDate, endDate) => {
    try {
        const response = await api.get('/dashboard/pareto', {
            params: {
                startDate: startDate,
                endDate: endDate
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching Pareto data:", error);
        throw error;
    }
};

export const fetchDashboardSummary = async (startDate, endDate) => {
    try {
        const response = await api.get('/dashboard/summary', {
            params: {
                startDate: startDate,
                endDate: endDate
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching Dashboard summary:", error);
        throw error;
    }
};

export const fetchDailyProduction = async (startDate, endDate) => {
    try {
        const response = await api.get('/dashboard/daily-production', {
            params: {
                startDate: startDate,
                endDate: endDate
            }
        });
        return response.data || [];
    } catch (error) {
        console.error("Error fetching Daily production data:", error);
        throw error;
    }
};

export const fetchComplaintSummary = async (startDate, endDate) => {
    try {
        const response = await api.get('/dashboard/complaints-summary', {
            params: {
                startDate: startDate,
                endDate: endDate
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error summary:", error);
        return { totalComplaints: 0 };
    }
};

export const fetchComplaintParetoData = async (startDate, endDate) => {
    try {
        const response = await api.get('/dashboard/complaints-pareto', {
            params: {
                startDate: startDate,
                endDate: endDate
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error pareto komplain:", error);
        return [];
    }
};