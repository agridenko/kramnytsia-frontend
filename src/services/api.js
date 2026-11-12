import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

//console.log("🔌 API URL налаштовано як:", API_URL);

// Створюємо базовий екземпляр Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Інтерсептор: автоматично додаємо токен до кожного запиту
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;