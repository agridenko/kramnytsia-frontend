import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // <-- Додали імпорт

const ProductCard = ({ product }) => {
  const { addToCart } = useCart(); // <-- Отримуємо функцію з контексту

  const imageUrl = product.image 
    ? `http://127.0.0.1:8000${product.image}` 
    : 'https://via.placeholder.com/300x200?text=No+Image';

  const handleAddToCart = async (e) => {
    e.preventDefault(); // Запобігаємо переходу за посиланням при кліку на кнопку
    addToCart(product, 1);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <Link to={`/catalog/${product.slug}`}>
        <img 
          src={imageUrl} 
          alt={product.name} 
          className="w-full h-48 object-cover"
        />
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
          {product.category_name || 'Без категорії'}
        </span>
        <Link to={`/catalog/${product.slug}`}>
          <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2 line-clamp-2 hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
          {product.description || 'Опис відсутній'}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-2xl font-bold text-gray-900">
            {product.price} ₴
          </span>
          
          {/* 🔥 КНОПКА ДОДАВАННЯ В КОШИК */}
          {product.stock > 0 ? (
            <button
              onClick={handleAddToCart}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-1"
            >
              🛒 Додати
            </button>
          ) : (
            <span className="text-xs text-red-600 font-semibold">Немає в наявності</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;