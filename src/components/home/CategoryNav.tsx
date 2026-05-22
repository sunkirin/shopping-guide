import { Link } from 'react-router-dom';
import type { Category } from '../../types';

const CAT_COLORS: Record<string, string> = {
  digital: '#FF4081',
  fashion: '#A855F7',
  food: '#FF6D3A',
  beauty: '#EC4899',
  home: '#4ECDC4',
  baby: '#FFB300',
};

interface CategoryNavProps {
  categories: Category[];
}

export default function CategoryNav({ categories }: CategoryNavProps) {
  return (
    <section className="mb-8">
      <h3 className="text-lg font-black mb-4 flex items-center gap-2">
        <span className="text-2xl">📂</span>
        <span className="gradient-text">全部分类</span>
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/category/${cat.slug}`}
            className="dopamine-card p-4 text-center group"
            style={{ '--hover-color': CAT_COLORS[cat.slug] || '#FF4081' } as React.CSSProperties}
          >
            <div className="text-4xl mb-2 transition-transform group-hover:scale-125 group-hover:animate-pop">
              {cat.icon}
            </div>
            <div className="text-sm font-bold text-text group-hover:text-[#FF4081] transition-colors">
              {cat.name}
            </div>
            <div className="text-xs text-text-secondary mt-0.5">{cat.productCount}件商品</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
