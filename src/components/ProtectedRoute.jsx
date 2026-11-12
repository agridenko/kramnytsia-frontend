import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="text-center mt-10">Завантаження...</div>;
  }

  if (!user) {
    // Якщо користувач не увійшов, кидаємо його на сторінку логіну
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;