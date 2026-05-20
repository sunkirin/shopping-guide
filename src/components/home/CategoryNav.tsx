import { Link } from 'react-router-dom';
import { categories } from '../../data/categories';

export default function CategoryNav() {
  return (
    <section className="mb-8">
      <h3 className="text-lg font-bold mb-4">📂 全部分类</h3>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/category/${cat.slug}`}
            className="bg-card rounded-xl p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="text-3xl mb-2">{cat.icon}</div>
            <div className="text-sm font-medium text-text">{cat.name}</div>
            <div className="text-xs text-text-secondary mt-1">{cat.productCount}件商品</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
