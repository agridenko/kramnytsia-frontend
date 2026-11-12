import { Link } from 'react-router-dom';

const Success = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-2xl shadow-lg text-center max-w-md">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Дякуємо за замовлення!</h1>
        <p className="text-gray-600 mb-8">
          Ваше замовлення успішно прийнято. Ми зв'яжемося з вами найближчим часом для підтвердження.
        </p>
        <Link 
          to="/" 
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          Повернутися на головну
        </Link>
      </div>
    </div>
  );
};

export default Success;