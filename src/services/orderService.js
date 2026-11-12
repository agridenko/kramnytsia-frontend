import api from './api';

// Функція створення замовлення
export const createOrder = (orderData) => {
  return api.post('/orders/checkout/', orderData);
};