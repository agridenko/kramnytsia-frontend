import api from './api';

// Отримати список міст (з пошуком)
export const getNpCities = (search = '') => {
  return api.get('/delivery/np/cities/', { 
    params: { search } 
  });
};

// Отримати відділення міста
export const getNpWarehouses = (cityRef) => {
  return api.get('/delivery/np/warehouses/', { 
    params: { city_ref: cityRef } 
  });
};

// Розрахувати вартість доставки
export const getNpDeliveryCost = (cityRef, warehouseRef) => {
  return api.get('/delivery/np/cost/', { 
    params: { 
      city_ref: cityRef,
      warehouse_ref: warehouseRef 
    } 
  });
};