import { Link } from 'react-router-dom';
import type { Category } from '../../types';

interface CategorySidebarProps {
  activeSlug?: string;
  categories: Category[];
}

export default function CategorySidebar({ activeSlug, categories }: CategorySidebarProps) {
  return (
    <aside className="dopamine-card p-4">
      <h4 className="font-black text-sm mb-3 gradient-text">商品分类</h4>
      <nav className="space-y-0.5">
        <Link
          to="/"
          className={`block px-3 py-2 rounded-xl text-sm font-medium transition-all ${
            !activeSlug
              ? 'bg-gradient-to-r from-[#FF4081] to-[#FF6D3A] text-white shadow-md'
              : 'text-text-secondary hover:bg-pink-50 hover:text-[#FF4081]'
          }`}
        >
          全部商品
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/category/${cat.slug}`}
            className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              activeSlug === cat.slug
                ? 'bg-gradient-to-r from-[#FF4081] to-[#FF6D3A] text-white shadow-md'
                : 'text-text-secondary hover:bg-pink-50 hover:text-[#FF4081]'
            }`}
          >
            <span>
              {cat.icon} {cat.name}
            </span>
            <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full font-bold">
              {cat.productCount}
            </span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
