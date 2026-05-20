import { Link } from 'react-router-dom';
import { categories } from '../../data/categories';

interface CategorySidebarProps {
  activeSlug?: string;
}

export default function CategorySidebar({ activeSlug }: CategorySidebarProps) {
  return (
    <aside className="bg-card rounded-xl p-4">
      <h4 className="font-bold text-sm mb-3">商品分类</h4>
      <nav className="space-y-0.5">
        <Link
          to="/"
          className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
            !activeSlug
              ? 'bg-primary-light text-primary font-medium'
              : 'text-text-secondary hover:bg-gray-50'
          }`}
        >
          全部商品
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/category/${cat.slug}`}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
              activeSlug === cat.slug
                ? 'bg-primary-light text-primary font-medium'
                : 'text-text-secondary hover:bg-gray-50'
            }`}
          >
            <span>
              {cat.icon} {cat.name}
            </span>
            <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
              {cat.productCount}
            </span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
