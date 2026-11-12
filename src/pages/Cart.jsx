import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, totalAmount, clearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Ваш кошик порожній</h2>
          <p className="text-gray-600 mb-6">Додайте товари з каталогу, щоб оформити замовлення</p>
          <Link 
            to="/catalog" 
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Перейти до каталогу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🛒 Ваш Кошик</h1>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Список товарів */}
          <div className="divide-y divide-gray-200">
            {cartItems.map(item => (
              <div key={item.id} className="p-6 flex items-center gap-4">
                {/* Зображення */}
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">
                  {item.image ? (
                    <img 
                      src={`http://127.0.0.1:8000${item.product.image}`} 
                      alt={item.product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    '📦'
                  )}
                </div>
                
                {/* Інформація */}
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                  <p className="text-sm text-gray-600">{item.product.category_name || 'Без категорії'}</p>
                  <p className="text-lg font-bold text-indigo-600 mt-1">{item.product.price} ₴</p>
                </div>
                
                {/* Кількість */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold transition"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
                
                {/* Сума */}
                <div className="text-right min-w-[100px]">
                  <p className="font-bold text-gray-900">{item.product.price * item.quantity} ₴</p>
                </div>
                
                {/* Видалити */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700 transition"
                  title="Видалити"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
          
          {/* Підсумок */}
          <div className="bg-gray-50 p-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-700">Загальна сума:</span>
              <span className="text-2xl font-bold text-indigo-600">{totalAmount} ₴</span>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={clearCart}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                Очистити кошик
              </button>
              <Link
                to="/checkout"
                className="flex-grow bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition text-center"
              >
                Оформити замовлення →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;