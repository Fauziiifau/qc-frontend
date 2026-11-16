import axios from 'axios';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    'https://qc-backend-java.onrender.com/api',

  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const path = (config.url || '').split('?')[0];

    const isPublicAuth =
      /^\/?auth\/(login|register)\/?$/.test(path);

    // Jangan kirim JWT lama saat login atau register.
    if (isPublicAuth) {
      delete config.headers.Authorization;
      return config;
    }

    const token = localStorage.getItem('jwt_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;