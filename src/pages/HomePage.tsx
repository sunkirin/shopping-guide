import HeroBanner from '../components/home/HeroBanner';
import CategoryNav from '../components/home/CategoryNav';
import HotDeals from '../components/home/HotDeals';
import ProductFeed from '../components/home/ProductFeed';

export default function HomePage() {
  return (
    <div>
      <HeroBanner />
      <CategoryNav />
      <HotDeals />
      <ProductFeed />
    </div>
  );
}
