import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Profile = () => {
  const navigate = useNavigate();
  
  // Стан для даних користувача
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', password: '' });
  const [isEditing, setIsEditing] = useState(false);
  
  // Стан для замовлень та пагінації
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  
  // Загальні стани
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Завантаження даних при відкритті сторінки
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // 1. Отримуємо дані користувача
        const userRes = await api.get('/users/me/');
        setUser(userRes.data);
        setFormData({
          first_name: userRes.data.first_name || '',
          last_name: userRes.data.last_name || '',
          email: userRes.data.email || '',
          password: ''
        });

        // 2. Отримуємо першу сторінку замовлень
        await fetchOrders(1);
      } catch (err) {
        console.error('Помилка завантаження даних:', err);
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          setError('Не вдалося завантажити дані. Спробуйте пізніше.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Функція для завантаження конкретної сторінки замовлень
  const fetchOrders = async (page) => {
    setOrdersLoading(true);
    try {
      const ordersRes = await api.get(`/orders/?page=${page}`);
      setOrders(ordersRes.data.results || []);
      setHasNextPage(!!ordersRes.data.next); // Перетворюємо URL або null на boolean
      setHasPrevPage(!!ordersRes.data.previous);
      setCurrentPage(page);
    } catch (err) {
      console.error('Помилка завантаження замовлень:', err);
      setError('Не вдалося завантажити замовлення.');
    } finally {
      setOrdersLoading(false);
    }
  };

  // Обробка зміни полів форми
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Збереження змін профілю
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = { ...formData };
      if (!payload.password.trim()) {
        delete payload.password;
      }

      await api.patch('/users/me/', payload);
      setUser({ ...user, first_name: payload.first_name, last_name: payload.last_name, email: payload.email });
      setIsEditing(false);
      setSuccess('✅ Дані профілю успішно оновлено!');
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData && typeof errorData === 'object') {
        setError(Object.values(errorData).flat().join(' '));
      } else {
        setError('Помилка при оновленні даних.');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      NEW: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      PAID: 'bg-green-100 text-green-800 border-green-200',
      SHIPPED: 'bg-blue-100 text-blue-800 border-blue-200',
      DELIVERED: 'bg-gray-100 text-gray-800 border-gray-200',
      CANCELED: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      NEW: 'Нове',
      PAID: 'Оплачено',
      SHIPPED: 'Відправлено',
      DELIVERED: 'Доставлено',
      CANCELED: 'Скасовано',
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">👤 Особистий кабінет</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ЛІВА КОЛОНКА: Профіль користувача */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Мої дані</h2>
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Редагувати
                  </button>
                )}
              </div>

              {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}
              {success && <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded">{success}</div>}

              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ім'я</label>
                    <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Прізвище</label>
                    <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Новий пароль <span className="text-gray-400 text-xs">(залиште порожнім, щоб не змінювати)</span></label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="••••••••" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">Зберегти</button>
                    <button type="button" onClick={() => { setIsEditing(false); setFormData({ ...user, password: '' }); setError(''); }} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition">Скасувати</button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-gray-700">
                  <div>
                    <p className="text-sm text-gray-500">Ім'я та Прізвище</p>
                    <p className="font-medium text-lg">{user.first_name} {user.last_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium break-all">{user.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ПРАВА КОЛОНКА: Історія замовлень */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">📦 Мої замовлення</h2>

              {orders.length === 0 && !ordersLoading ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-4xl mb-3">🛒</p>
                  <p>У вас поки що немає замовлень.</p>
                  <button onClick={() => navigate('/catalog')} className="mt-4 text-indigo-600 hover:underline font-medium">Перейти до каталогу</button>
                </div>
              ) : (
                <>
                  {ordersLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition bg-gray-50/50">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
                            <div>
                              <span className="text-sm text-gray-500">Замовлення #{order.id}</span>
                              <p className="text-sm text-gray-400">{formatDate(order.created_at)}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </div>

                          <div className="space-y-2 mb-4">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-gray-700">
                                  {item.product.name} <span className="text-gray-500">x {item.quantity}</span>
                                </span>
                                <span className="font-medium text-gray-900">{item.subtotal} ₴</span>
                              </div>
                            ))}
                          </div>

                          <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                              <span>Товари: {order.total_price} ₴</span>
                              {order.delivery_cost > 0 && <span className="ml-3">Доставка: {order.delivery_cost} ₴</span>}
                            </div>
                            <div className="text-lg font-bold text-indigo-700">
                              Разом: {order.total_with_delivery} ₴
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 🔥 ПАГІНАЦІЯ 🔥 */}
                  {(hasPrevPage || hasNextPage) && (
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                      <button
                        onClick={() => fetchOrders(currentPage - 1)}
                        disabled={!hasPrevPage || ordersLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        ← Попередня
                      </button>
                      
                      <span className="text-sm text-gray-600">
                        Сторінка {currentPage}
                      </span>

                      <button
                        onClick={() => fetchOrders(currentPage + 1)}
                        disabled={!hasNextPage || ordersLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        Наступна →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;