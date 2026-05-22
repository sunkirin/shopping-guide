export default function Footer() {
  return (
    <footer className="bg-white/60 backdrop-blur-sm border-t border-pink-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <img src="/logo.svg" alt="享折扣" className="w-6 h-6" />
          <span className="font-black gradient-text text-lg">享折扣</span>
        </div>
        <p className="text-sm text-text-secondary">
          © 2026 享折扣 — 全网优惠券聚合平台
        </p>
        <p className="text-xs text-text-secondary mt-1">
          本站为商品信息聚合平台，商品信息来源于各大电商平台。
        </p>
      </div>
    </footer>
  );
}
