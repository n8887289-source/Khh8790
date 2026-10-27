import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AccountModal } from './components/AccountModal';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { SearchOverlay } from './components/SearchOverlay';
import { Toaster } from './components/Toaster';
import { INFO_PAGES } from './content/infoPages';
import Account from './pages/Account';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import Favorites from './pages/Favorites';
import Home from './pages/Home';
import InfoPage from './pages/InfoPage';
import NotFound from './pages/NotFound';
import OrderConfirmation from './pages/OrderConfirmation';
import ProductDetail from './pages/ProductDetail';
import Shop from './pages/Shop';

const INFO_SLUGS = Object.keys(INFO_PAGES);

export default function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname, location.search]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:number" element={<OrderConfirmation />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/account" element={<Account />} />
          {INFO_SLUGS.map((slug) => (
            <Route key={slug} path={`/${slug}`} element={<InfoPage slug={slug} />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
      <SearchOverlay />
      <AccountModal />
      <Toaster />
    </div>
  );
}
