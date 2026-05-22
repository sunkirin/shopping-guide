import { useState, type FormEvent } from 'react';
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
        className="w-full h-10 pl-10 pr-20 rounded-full bg-pink-50 border-2 border-transparent text-sm focus:outline-none focus:border-pink focus:bg-white transition-all placeholder:text-pink-300"
      />
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-300"
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
        className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#FF4081] to-[#FF6D3A] text-white text-xs font-bold px-5 py-1.5 rounded-full hover:scale-105 transition-transform shadow-md"
      >
        搜索
      </button>
    </form>
  );
}
