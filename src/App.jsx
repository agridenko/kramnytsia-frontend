import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

// Проста головна сторінка
const Home = () => {
  const { user, logout } = useContext(AuthContext);
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">🛒 Kramnytsia Frontend</h1>
      {user ? (
        <div>
          <p className="text-green-600 text-xl mb-4">
            Привіт, <span className="font-bold">{user.first_name} {user.last_name}</span>! 
            <br />
            <span className="text-sm text-gray-600">(Ваш email: {user.email})</span>
          </p>
          <button 
            onClick={logout} 
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Вийти
          </button>
          <div className="mt-6">
            <Link to="/cart" className="text-blue-600 hover:underline font-medium">
              🛒 Перейти до Кошика (Захищений маршрут)
            </Link>
          </div>
        </div>
      ) : (
        <Link to="/login" className="text-blue-600 hover:underline text-xl font-medium">
          Увійти в акаунт
        </Link>
      )}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          {/* Приклад захищеного маршруту */}
          <Route 
            path="/cart" 
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                  <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">🛒 Ваш Кошик</h2>
                    <p className="text-gray-600">Ця сторінка доступна тільки авторизованим користувачам!</p>
                  </div>
                </div>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;