import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCategories } from '../services/productService';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Завантажуємо останні 4 товари для блоку "Новинки"
    getProducts({ ordering: '-created_at', page_size: 4 }) 
      .then(res => {
        const data = res.data;
        const products = Array.isArray(data) ? data : (data.results || []);
        setFeaturedProducts(products.slice(0, 4)); // Беремо максимум 4
      })
      .catch(console.error);

    // 2. Завантажуємо категорії
    getCategories()
      .then(res => {
        const data = res.data;
        const cats = Array.isArray(data) ? data : (data.results || []);
        setCategories(cats.slice(0, 4)); // Показуємо перші 4 категорії
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* 🌟 1. HERO БАНЕР */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">
            🎲 Світ настільних ігор
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-indigo-100 max-w-2xl mx-auto">
            Відкривай для себе найкращі ігри для родини та друзів. Швидка доставка Новою Поштою!
          </p>
          <Link 
            to="/catalog" 
            className="inline-block bg-white text-indigo-600 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            🛍️ Перейти до каталогу
          </Link>
        </div>
      </section>

      {/* 🗂️ 2. ПОПУЛЯРНІ КАТЕГОРІЇ */}
      <section className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Обирай за категорією
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map(cat => (
            <Link 
              key={cat.slug} 
              to={`/catalog?category=${cat.slug}`}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center border border-gray-100 group"
            >
              <div className="text-4xl mb-3">🎯</div> {/* Тут можна додати іконки для категорій */}
              <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* 🆕 3. НОВИНКИ / ВИБІР ТИЖНЯ */}
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              🔥 Новинки тижня
            </h2>
            <Link to="/catalog" className="text-indigo-600 font-medium hover:text-indigo-800">
              Дивитись всі →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-500">Завантаження...</div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-10 text-gray-500">Товарів поки що немає</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.slug || product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 🦶 ФУТЕР (Міні) */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <p>© 2026 Kramnytsia. Всі права захищено. Розроблено з ❤️ на Django + React.</p>
      </footer>
    </div>
  );
};

export default Home;