interface CouponBadgeProps {
  amount: number;
}

export default function CouponBadge({ amount }: CouponBadgeProps) {
  if (amount <= 0) return null;

  return (
    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#FF4081] via-[#FF6D3A] to-[#FFB300] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.41 11.58l-9-9A2 2 0 0010.99 2H4a2 2 0 00-2 2v7a2 2 0 00.59 1.42l9 9A2 2 0 0013 22a2 2 0 001.41-.59l7-7A2 2 0 0022 13a2 2 0 00-.59-1.42zM6.5 8A1.5 1.5 0 118 6.5 1.5 1.5 0 016.5 8z"/>
      </svg>
      领券减¥{amount}
    </span>
  );
}
