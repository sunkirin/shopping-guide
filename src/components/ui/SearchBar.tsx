import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xl">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索商品、品牌或关键词..."
        className="w-full h-10 pl-10 pr-4 rounded-full bg-gray-100 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
      />
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white text-xs px-4 py-1.5 rounded-full hover:bg-primary-dark transition-colors"
      >
        搜索
      </button>
    </form>
  );
}
