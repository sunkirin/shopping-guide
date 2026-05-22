interface PaginationProps {
  current: number;
  total: number;
  onChange: (page: number) => void;
}

export default function Pagination({ current, total, onChange }: PaginationProps) {
  if (total <= 1) return null;

  const pages: (number | '...')[] = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-pink-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-text-secondary"
      >
        上一页
      </button>
      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-text-secondary font-bold">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onChange(page as number)}
            className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
              page === current
                ? 'bg-gradient-to-br from-[#FF4081] to-[#FF6D3A] text-white shadow-lg shadow-pink/30'
                : 'hover:bg-pink-50 text-text-secondary'
            }`}
          >
            {page}
          </button>
        )
      )}
      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className="px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-pink-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-text-secondary"
      >
        下一页
      </button>
    </div>
  );
}
