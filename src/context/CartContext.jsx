import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Завантажуємо кошик з бекенду
  const fetchCart = async () => {
  try {
    const response = await api.get('/cart/me/');
    console.log('🛒 Відповідь від GET /cart/me/:', response.data);
    
    let items = [];
    if (response.data.items) {
      items = response.data.items;
    } else if (Array.isArray(response.data)) {
      items = response.data;
    }
    
    setCartItems(items);
    } catch (error) {
      console.warn('⚠️ Помилка завантаження кошика:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // useEffect тепер реагує на зміну user
  useEffect(() => {
    if (authLoading) return; // Чекаємо, поки AuthContext зрозуміє, чи ми залогінені

    if (user) {
      fetchCart(); // Якщо увійшли (або сторінка оновилася і токен є) — тягнемо кошик
    } else {
      setCartItems([]); // Якщо вийшли з системи — очищаємо кошик
      setLoading(false);
    }
  }, [user, authLoading]); // Перезапускається, коли змінюється user або закінчується завантаження auth


  // Додати товар (POST /cart/add_item/)
  const addToCart = async (product, quantity = 1) => {
    try {
      const response = await api.post('/cart/add_item/', { 
        product_id: product.id, 
        quantity 
      });
      console.log('✅ Додано в кошик:', response.data);
      await fetchCart(); // Перезавантажуємо кошик
    } catch (error) {
      console.error('Помилка додавання:', error);
      alert('Не вдалося додати товар. Перевірте, чи ви увійшли в систему.');
    }
  };

  // Змінити кількість (POST /cart/update_item/{item_id}/)
  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }
    try {
      await api.post(`/cart/update_item/${cartItemId}/`, { 
        quantity: newQuantity 
      });
      await fetchCart();
    } catch (error) {
      console.error('Помилка оновлення кількості:', error);
    }
  };

  // Видалити товар (POST /cart/remove_item/{item_id}/)
  const removeFromCart = async (cartItemId) => {
    try {
      await api.post(`/cart/remove_item/${cartItemId}/`);
      await fetchCart();
    } catch (error) {
      console.error('Помилка видалення:', error);
    }
  };

  // Очистити кошик (POST /cart/clear/)
  const clearCart = async () => {
    try {
      await api.post('/cart/clear/');
      setCartItems([]);
    } catch (error) {
      console.error('Помилка очищення:', error);
      setCartItems([]);
    }
  };

  // Підрахунки
  const totalAmount = cartItems.reduce((total, item) => {
    const price = item.product?.price || item.price || 0;
    return total + (price * item.quantity);
  }, 0);

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      loading,
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      totalAmount,
      totalItems 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);