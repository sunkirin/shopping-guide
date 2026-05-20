import { Link } from 'react-router-dom';
import SearchBar from '../ui/SearchBar';
import { categories } from '../../data/categories';

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🛒</span>
          <span className="text-xl font-bold text-primary hidden sm:block">
            超值购
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 flex justify-center">
          <SearchBar />
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-3 text-sm text-text-secondary shrink-0">
          <Link to="/" className="hover:text-primary transition-colors">
            首页
          </Link>
          <Link to="/category/digital" className="hover:text-primary transition-colors">
            全部商品
          </Link>
        </div>
      </div>

      {/* Category nav */}
      <nav className="border-t border-border overflow-x-auto scrollbar-hide">
        <div className="max-w-7xl mx-auto px-4 flex gap-0">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-text-secondary hover:text-primary hover:bg-primary-light/50 transition-colors whitespace-nowrap shrink-0"
            >
              <span className="text-base">{cat.icon}</span>
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
