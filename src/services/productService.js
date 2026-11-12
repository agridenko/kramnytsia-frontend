import api from './api';

// Отримати список товарів з фільтрацією та сортуванням
export const getProducts = (params = {}) => {
  return api.get('/products/', { params });
};

// Отримати один товар за ID
export const getProductBySlug = (slug) => {
  return api.get(`/products/${slug}/`);
};

// Отримати список категорій (для фільтрів)
export const getCategories = () => {
  return api.get('/categories/');
};