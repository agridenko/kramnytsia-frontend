import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const status = searchParams.get('status'); // LiqPay додає цей параметр
  const [orderStatus, setOrderStatus] = useState('loading');

  useEffect(() => {
    if (orderId) {
      // Перевіряємо реальний статус замовлення на бекенді
      api.get(`/orders/${orderId}/`)
        .then(response => {
          setOrderStatus(response.data.status);
        })
        .catch(() => {
          setOrderStatus('unknown');
        });
    }
  }, [orderId]);

  if (orderStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Перевіряємо статус оплати...</p>
        </div>
      </div>
    );
  }

  const isSuccess = orderStatus === 'PAID' || status === 'success' || status === 'sandbox';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-2xl shadow-lg text-center max-w-md w-full">
        <div className="text-6xl mb-4">{isSuccess ? '🎉' : '⚠️'}</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isSuccess ? 'Оплату успішно проведено!' : 'Очікуємо підтвердження'}
        </h1>
        <p className="text-gray-600 mb-8">
          {isSuccess 
            ? 'Дякуємо за покупку! Ми вже отримали сповіщення і почнемо збирати ваше замовлення.' 
            : 'Ми перевіряємо інформацію від банку. Це може зайняти кілька хвилин.'}
        </p>
        
        {orderId && (
          <p className="text-sm text-gray-500 mb-6 bg-gray-100 p-2 rounded">
            Номер замовлення: <span className="font-mono font-bold">#{orderId}</span>
          </p>
        )}

        <Link 
          to="/" 
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition w-full"
        >
          Повернутися на головну
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;