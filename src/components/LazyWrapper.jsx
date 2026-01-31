import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Loading component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    fontSize: '14px',
    color: '#666'
  }}>
    Loading...
  </div>
);

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    padding: '20px',
    textAlign: 'center'
  }}>
    <h3>Something went wrong:</h3>
    <p style={{ color: '#666', marginBottom: '20px' }}>
      {error.message}
    </p>
    <button
      onClick={resetErrorBoundary}
      style={{
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Try again
    </button>
  </div>
);

// Lazy wrapper component
const LazyWrapper = ({ children, fallback = <LoadingSpinner /> }) => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

// Higher-order component for lazy loading
export const withLazyLoading = (Component, fallback = <LoadingSpinner />) => {
  const LazyComponent = lazy(() => Promise.resolve({ default: Component }));
  
  return (props) => (
    <LazyWrapper fallback={fallback}>
      <LazyComponent {...props} />
    </LazyWrapper>
  );
};

// Lazy load pages
export const LazyPages = {
  Home: lazy(() => import('../pages/Home/Home')),
  Login: lazy(() => import('../pages/Login/Login')),
  Register: lazy(() => import('../pages/Register/Register')),
  Profile: lazy(() => import('../pages/Profile/Profile')),
  Cart: lazy(() => import('../pages/Cart/Cart')),
  Checkout: lazy(() => import('../pages/Checkout/Checkout')),
  Products: lazy(() => import('../pages/AllProducts/AllProducts')),
  ProductDetails: lazy(() => import('../pages/ProductsDetalis/ProductsDetalis')),
  Favorites: lazy(() => import('../pages/Favorites/Favorites')),
  Orders: lazy(() => import('../pages/Orders/Orders')),
  OrderDetails: lazy(() => import('../pages/OrderDetails/OrderDetails')),
  Offers: lazy(() => import('../pages/Offers/Offers')),
  About: lazy(() => import('../pages/AboutUS/AboutUS')),
  Contact: lazy(() => import('../pages/ContactUS/ContactUS')),
  Terms: lazy(() => import('../pages/Terms/Terms')),
  Privacy: lazy(() => import('../pages/Terms/Privacy')),
};

// Lazy load components
export const LazyComponents = {
  Navbar: lazy(() => import('../pages/Navbar')),
  Footer: lazy(() => import('../pages/Footer')),
  ProductCard: lazy(() => import('../component/UI/ProductCard')),
  Hero: lazy(() => import('../component/Hero/Hero')),
  Features: lazy(() => import('../component/Features/Features')),
  ShopByCategory: lazy(() => import('../component/ShopByCategory/ShopByCategory')),
  Ads: lazy(() => import('../component/Ads/Ads')),
  ImagesSlider: lazy(() => import('../component/ImagesSlider/ImagesSlider')),
};

export default LazyWrapper;
