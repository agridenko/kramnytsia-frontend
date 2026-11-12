import { useState, useEffect } from 'react';
import { getProducts, getCategories } from '../services/productService';
import ProductCard from '../components/ProductCard';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Стани для фільтрів та пагінації
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [ordering, setOrdering] = useState('-created_at');
  const [page, setPage] = useState(1);
  
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    totalPages: 1
  });

  // Завантажуємо категорії один раз
  useEffect(() => {
    getCategories().then(res => {
      const data = res.data;
      setCategories(Array.isArray(data) ? data : (data.results || []));
    }).catch(console.error);
  }, []);

  // Скидаємо сторінку на 1 при зміні будь-якого фільтра
  useEffect(() => {
    setPage(1);
  }, [search, category, ordering]);

  // Завантажуємо товари при зміні фільтрів або сторінки
  useEffect(() => {
    setLoading(true);
    const params = { page };
    if (search) params.search = search;
    if (category) params.category = category;
    if (ordering) params.ordering = ordering;

    getProducts(params)
      .then(res => {
        const data = res.data;
        // Обробка як масиву, так і пагінованого об'єкта
        if (Array.isArray(data)) {
          setProducts(data);
          setPagination({
            count: data.length,
            next: null,
            previous: null,
            totalPages: 1
          });
        } else {
          setProducts(data.results || []);
          // Обчислюємо totalPages
          const PAGE_SIZE = 12; // Має співпадати з PAGE_SIZE на бекенді
          const totalPages = data.count ? Math.ceil(data.count / PAGE_SIZE) : 1;

          setPagination({
            count: data.count || 0,
            next: data.next,
            previous: data.previous,
            totalPages: totalPages
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Помилка завантаження товарів:", err);
        setLoading(false);
      });
  }, [search, category, ordering, page]); // Додали page у залежності

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">🛍️ Каталог товарів</h1>
      
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* 🔽 БІЧНА ПАНЕЛЬ ФІЛЬТРІВ */}
        <aside className="w-full lg:w-1/4 bg-white p-6 rounded-xl shadow-sm h-fit">
          <h2 className="text-lg font-semibold mb-4">Фільтри</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Пошук</label>
            <input
              type="text"
              placeholder="Назва товару..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Категорія</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Всі категорії</option>
              {categories.map(cat => (
                <option key={cat.slug} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Сортування</label>
            <select
              value={ordering}
              onChange={(e) => setOrdering(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="-created_at">Спочатку нові</option>
              <option value="price">Від дешевих до дорогих</option>
              <option value="-price">Від дорогих до дешевих</option>
              <option value="name">За назвою (А-Я)</option>
            </select>
          </div>

          <button 
            onClick={() => { setSearch(''); setCategory(''); setOrdering('-created_at'); }}
            className="w-full text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Скинути фільтри
          </button>
        </aside>

        {/* 🔽 СІТКА ТОВАРІВ ТА ПАГІНАЦІЯ */}
        <main className="w-full lg:w-3/4">
          {loading ? (
            <div className="text-center py-20 text-gray-500">Завантаження товарів...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-500 bg-white rounded-xl">
              😕 Товарів за цими фільтрами не знайдено
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <ProductCard key={product.slug || product.id} product={product} />
                ))}
              </div>

              {/* 🔽 БЛОК ПАГІНАЦІЇ */}
              <div className="flex justify-center items-center gap-4 mt-10">
                <button
                  disabled={!pagination.previous}
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  ← Попередня
                </button>
                
                <span className="text-gray-600 font-medium">
                  Сторінка {page} з {pagination.totalPages} (Всього товарів: {pagination.count})
                </span>
                
                <button
                  disabled={!pagination.next}
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Наступна →
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Catalog;