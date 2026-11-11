import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Функція для отримання повних даних користувача з бекенду
  const fetchUserData = async () => {
    try {
      const response = await api.get('users/me/'); 
      setUser(response.data);
    } catch (error) {
      console.error("Не вдалося отримати дані користувача:", error);
      // Якщо токен протух або недійсний, автоматично розлогінюємо
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Перевіряємо наявність токена при завантаженні сайту
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUserData(); // Завантажуємо дані, якщо токен вже є
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      // ендпоінт отримання JWT
      const response = await api.post('users/token/', { email, password });
      
      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      setUser({ email });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Помилка входу' };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};