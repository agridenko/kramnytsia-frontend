import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { getNpCities, getNpWarehouses, getNpDeliveryCost } from '../services/novaPoshtaService';

const Checkout = () => {
  const { cartItems, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Стан для Нової Пошти
  const [allCities, setAllCities] = useState([]); // Всі міста з бекенду
  const [cities, setCities] = useState([]); // Відфільтровані міста для показу
  const [warehouses, setWarehouses] = useState([]);
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [searchCity, setSearchCity] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: ''
  });

  // Завантажуємо всі міста ОДИН РАЗ при монтуванні
  useEffect(() => {
    const loadCities = async () => {
      try {
        const response = await getNpCities();
        console.log('🏙️ Завантажено міст:', response.data?.length || 0);
        setAllCities(response.data || []);
      } catch (error) {
        console.error('Помилка завантаження міст:', error);
      }
    };
    loadCities();
  }, []);

  // Локальна фільтрація міст
  const handleCitySearch = (e) => {
    const value = e.target.value;
    setSearchCity(value);
    setSelectedCity(null);
    setSelectedWarehouse(null);
    setDeliveryCost(0);
    
    if (value.length >= 2) {
      const filtered = allCities.filter(city => {
        const name = (city.name || city.description || '').toLowerCase();
        return name.includes(value.toLowerCase());
      });
      // Обмежуємо до 20 результатів для продуктивності
      setCities(filtered.slice(0, 20));
      setShowCityDropdown(true);
    } else {
      setCities([]);
      setShowCityDropdown(false);
    }
  };

  // Обираємо місто
  const handleSelectCity = async (city) => {
    console.log('🏙️ Обране місто:', city);
    setSelectedCity(city);
    setSearchCity(city.name || city.description || '');
    setShowCityDropdown(false);
    setWarehouses([]);
    setSelectedWarehouse(null);
    setDeliveryCost(0);
    
    // Завантажуємо відділення
    try {
      const response = await getNpWarehouses(city.ref);
      console.log('🏪 Відділень знайдено:', response.data?.length || 0);
      console.log('🏪 Перше відділення:', response.data?.[0]);
      setWarehouses(response.data || []);
    } catch (error) {
      console.error('Помилка завантаження відділень:', error);
    }
  };

  // Обираємо відділення та рахуємо вартість
  const handleSelectWarehouse = async (warehouse) => {
    console.log('🏪 Обране відділення:', warehouse);
    setSelectedWarehouse(warehouse);
    
    if (selectedCity) {
      try {
        const response = await getNpDeliveryCost(selectedCity.ref, warehouse.ref);
        console.log('💰 Вартість доставки:', response.data);
        const cost = parseFloat(response.data.cost) || 0;
        setDeliveryCost(cost);
      } catch (error) {
        console.error('Помилка розрахунку вартості:', error);
        setDeliveryCost(100);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Передаємо delivery_cost на бекенд
      const response = await api.post('/orders/checkout/', {
        delivery_cost: deliveryCost
      });
      
      console.log('✅ Замовлення створено:', response.data);
      await clearCart();
      navigate('/success');
    } catch (err) {
      console.error('❌ ПОМИЛКА:', err);
      const errorData = err.response?.data;
      if (errorData) {
        const errorMsg = typeof errorData === 'string' 
          ? errorData 
          : JSON.stringify(errorData);
        setError(errorMsg);
      } else {
        setError(err.response?.status === 401 
          ? 'Сесія закінчилася. Увійдіть знову.' 
          : 'Помилка при оформленні замовлення.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ваш кошик порожній</h2>
          <Link to="/catalog" className="text-indigo-600 hover:underline">Повернутися до каталогу</Link>
        </div>
      </div>
    );
  }

  const totalWithDelivery = totalAmount + deliveryCost;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">📦 Оформлення замовлення</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Контактні дані */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ім'я</label>
                <input 
                  type="text" 
                  name="first_name" 
                  required 
                  value={formData.first_name} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Прізвище</label>
                <input 
                  type="text" 
                  name="last_name" 
                  required 
                  value={formData.last_name} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                <input 
                  type="tel" 
                  name="phone" 
                  required 
                  placeholder="+380..." 
                  value={formData.phone} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  value={formData.email} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
            </div>

            {/* Доставка Новою Поштою */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">🚚 Доставка (Нова Пошта)</h3>
              
              {/* Пошук міста */}
              <div className="mb-4 relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Місто</label>
                <input 
                  type="text" 
                  placeholder="Введіть назву міста (мін. 2 символи)..."
                  value={searchCity}
                  onChange={handleCitySearch}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  autoComplete="off"
                />
                {showCityDropdown && cities.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {cities.map((city, index) => (
                      <div
                        key={city.ref || index}
                        onClick={() => handleSelectCity(city)}
                        className="px-4 py-2 cursor-pointer hover:bg-indigo-50 border-b border-gray-100"
                      >
                        {city.name || city.description || 'Невідома назва'}
                      </div>
                    ))}
                  </div>
                )}
                {showCityDropdown && cities.length === 0 && searchCity.length >= 2 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
                    Міст не знайдено
                  </div>
                )}
              </div>

              {/* Вибір відділення */}
              {selectedCity && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Відділення</label>
                  <select
                    value={selectedWarehouse?.ref || ''}
                    onChange={(e) => {
                      const warehouse = warehouses.find(w => w.ref === e.target.value);
                      if (warehouse) handleSelectWarehouse(warehouse);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Оберіть відділення</option>
                    {warehouses.map((warehouse, index) => (
                      <option key={warehouse.ref || index} value={warehouse.ref}>
                        {warehouse.name || warehouse.description || `Відділення ${index + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {deliveryCost > 0 && (
                <p className="text-sm text-green-600 font-semibold">
                  ✅ Вартість доставки: {deliveryCost} ₴
                </p>
              )}
            </div>

            {/* Підсумок */}
            <div className="border-t pt-6 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Товари:</span>
                <span className="font-semibold">{totalAmount} ₴</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-700">Доставка:</span>
                <span className="font-semibold">{deliveryCost} ₴</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold border-t pt-4">
                <span>До сплати:</span>
                <span className="text-2xl text-indigo-600">{totalWithDelivery} ₴</span>
              </div>
            </div>

            {/* Кнопка */}
            <button
              type="submit"
              disabled={loading || !selectedWarehouse}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Обробка...' : '💳 Перейти до оплати'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;