import { Link } from 'react-router-dom';
import SearchBar from '../ui/SearchBar';
import { categories } from '../../data/categories';

export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-pink-100">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <img src="/logo.svg" alt="享折扣" className="w-9 h-9 transition-transform group-hover:scale-110 group-hover:rotate-6" />
          <span className="text-xl font-black hidden sm:block gradient-text">享折扣 · 享生活</span>
        </Link>

        <div className="flex-1 flex justify-center">
          <SearchBar />
        </div>

        <div className="hidden md:flex items-center gap-4 text-sm text-text-secondary shrink-0">
          <Link to="/" className="hover:text-pink transition-colors font-medium">首页</Link>
          <Link to="/category/digital" className="hover:text-pink transition-colors font-medium">全部商品</Link>
        </div>
      </div>

      <nav className="border-t border-pink-100 overflow-x-auto scrollbar-hide bg-white/60">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 py-1.5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-text-secondary hover:text-pink hover:bg-pink-50 rounded-full transition-all whitespace-nowrap shrink-0 font-medium"
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
