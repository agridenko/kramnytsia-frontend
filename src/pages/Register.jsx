import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Реєструємо
      await api.post('/users/register/', formData);
      
      // 2. Логінимось, щоб отримати токени
      const loginResponse = await api.post('/users/token/', {
        email: formData.email,
        password: formData.password
      });

      const accessToken = loginResponse.data.access || loginResponse.data.token;
      const refreshToken = loginResponse.data.refresh;

      // 3. Зберігаємо
      if (accessToken) {
        localStorage.setItem('access_token', accessToken);
        if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      }

      // 4. 🔥 ЖОРСТКЕ ПЕРЕЗАВАНТАЖЕННЯ НА ГОЛОВНУ
      // Це змусить React повністю перемалювати додаток, 
      // AuthContext і CartContext зчитають нові токени і все запрацює миттєво.
      window.location.href = '/'; 
      
    } catch (err) {
      console.error('Помилка:', err);
      const errorData = err.response?.data;
      
      if (errorData) {
        if (typeof errorData === 'object') {
          const messages = Object.values(errorData).flat().join(' ');
          setError(messages);
        } else {
          setError(errorData);
        }
      } else {
        setError('Сталася невідома помилка. Спробуйте пізніше.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Створити акаунт</h2>
          <p className="mt-2 text-sm text-gray-600">
            Вже маєте акаунт?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Увійти
            </Link>
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ім'я</label>
              <input
                type="text"
                name="first_name"
                required
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="Іван"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="Франко"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="ivan@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
            <input
              type="password"
              name="password"
              required
              minLength="8"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="Мінімум 8 символів"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Реєстрація...' : 'Зареєструватися'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;