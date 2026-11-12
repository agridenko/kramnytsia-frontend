import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductBySlug } from '../services/productService';
import { useCart } from '../context/CartContext'; // <-- Додали імпорт

const ProductDetail = () => {
  const { slug } = useParams();
  const { addToCart } = useCart(); // <-- Отримуємо функцію з контексту
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1); // <-- Додали стан для кількості
  const [addedToCart, setAddedToCart] = useState(false); // <-- Для анімації

  useEffect(() => {
    getProductBySlug(slug)
      .then(res => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Помилка завантаження товару:", err);
        setLoading(false);
      });
  }, [slug]);

  const handleAddToCart = async () => {
    addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000); // Скидаємо через 2 секунди
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Завантаження...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Товар не знайдено</div>;

  const imageUrl = product.image 
    ? `http://127.0.0.1:8000${product.image}` 
    : 'https://via.placeholder.com/600x400?text=No+Image';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Зображення */}
          <div className="md:w-1/2">
            <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
          </div>
          
          {/* Інформація */}
          <div className="p-8 md:w-1/2 flex flex-col">
            <Link to="/catalog" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mb-4">
              ← Назад до каталогу
            </Link>
            
            <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">
              {product.category_name}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-4">{product.name}</h1>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              {product.description || 'Опис відсутній'}
            </p>
            
            <div className="mt-auto">
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl font-bold text-gray-900">{product.price} ₴</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {product.stock > 0 ? `В наявності: ${product.stock} шт.` : 'Немає в наявності'}
                </span>
              </div>
              
              {/* 🔥 ВИБІР КІЛЬКОСТІ ТА ДОДАВАННЯ В КОШИК */}
              {product.stock > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">Кількість:</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold transition"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-semibold">{quantity}</span>
                      <button
                        onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold transition"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleAddToCart}
                    className={`w-full py-3 px-4 rounded-lg text-white font-bold text-lg transition ${
                      addedToCart 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {addedToCart ? '✅ Додано до кошика!' : '🛒 Додати до кошика'}
                  </button>
                </div>
              ) : (
                <button 
                  disabled
                  className="w-full py-3 px-4 rounded-lg bg-gray-400 text-white font-bold text-lg cursor-not-allowed"
                >
                  Недоступно
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;