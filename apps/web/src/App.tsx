import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderPage } from './pages/OrderPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { AccountPage } from './pages/AccountPage';
import { InfoPage } from './pages/InfoPage';
import { NotFoundPage } from './pages/NotFoundPage';

/** Resets scroll when the route changes, but not when only filters change. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order/:orderNumber" element={<OrderPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/account" element={<AccountPage />} />

          {/* Editorial, support and legal pages all render from content/pages.ts */}
          <Route path="/explore" element={<InfoPage />} />
          <Route path="/story" element={<InfoPage />} />
          <Route path="/sustainability" element={<InfoPage />} />
          <Route path="/press" element={<InfoPage />} />
          <Route path="/careers" element={<InfoPage />} />
          <Route path="/affiliates" element={<InfoPage />} />
          <Route path="/gift-cards" element={<InfoPage />} />
          <Route path="/support/track-order" element={<InfoPage />} />
          <Route path="/support/returns" element={<InfoPage />} />
          <Route path="/support/warranty" element={<InfoPage />} />
          <Route path="/support/product-help" element={<InfoPage />} />
          <Route path="/support/contact" element={<InfoPage />} />
          <Route path="/support/faqs" element={<InfoPage />} />
          <Route path="/privacy" element={<InfoPage />} />
          <Route path="/terms" element={<InfoPage />} />
          <Route path="/cookies" element={<InfoPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
