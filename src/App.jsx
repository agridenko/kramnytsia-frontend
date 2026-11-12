import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useContext } from 'react'; // <-- useContext ТОЛЬКО отсюда!
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext'; // <-- useCart отсюда
import Login from './pages/Login';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import ProtectedRoute from './components/ProtectedRoute';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import PaymentSuccess from './pages/PaymentSuccess';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { totalItems } = useCart();

  return (
    <nav className="bg-white shadow-sm p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-indigo-600">Kramnytsia</Link>
        <div className="flex items-center gap-6">
          <Link to="/catalog" className="text-gray-700 hover:text-indigo-600 font-medium">Каталог</Link>
          
          {user ? (
            <>
              <Link to="/cart" className="relative text-gray-700 hover:text-indigo-600 font-medium flex items-center gap-1">
                🛒 Кошик
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 hidden sm:block">
                  Привіт, {user.first_name || user.email}!
                </span>
                <button 
                  onClick={logout} 
                  className="text-sm text-red-500 hover:text-red-700 font-medium border border-red-200 px-3 py-1 rounded hover:bg-red-50 transition"
                >
                  Вийти
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
              Увійти
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Header />
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/catalog/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/success" element={<Success />} />
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } 
            />
            <Route path="/payment/success" element={<PaymentSuccess />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;