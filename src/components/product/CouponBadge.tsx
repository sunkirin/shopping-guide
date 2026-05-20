interface CouponBadgeProps {
  amount: number;
}

export default function CouponBadge({ amount }: CouponBadgeProps) {
  if (amount <= 0) return null;

  return (
    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-2.5 py-1 rounded-full">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
      领券减¥{amount}
    </span>
  );
}
