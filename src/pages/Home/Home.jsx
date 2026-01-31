import React, { useEffect, Suspense, lazy } from "react";
import "./home.css";
import { useTranslation } from 'react-i18next';

// Lazy load components for better performance
const Hero = lazy(() => import("../../component/Hero/Hero"));
const Ads = lazy(() => import("../../component/Ads/Ads"));
const Features = lazy(() => import("../../component/Features/Features"));
const ShopByCategory = lazy(() => import("../../component/ShopByCategory/ShopByCategory"));
const ProductSection = lazy(() => import("../ProductDIscountSection/ProductDIscountSection"));
const NewestProduct = lazy(() => import("../NewestProduct/NewestProduct"));
const OfferBanner = lazy(() => import("../Offers/OFFerBanner"));
const ProductDiscount = lazy(() => import("../ProductDiscount/ProductDiscount"));
const AllProductsSection = lazy(() => import("../../component/AllProductsSection/AllProductsSection"));

const Home = ({ setFavlength }) => {
  const { t, i18n } = useTranslation("global");
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  return (  
    <div className="home-page">
        <ShopByCategory />
      <Suspense fallback={<LoadingSpinner />}>
        <Ads />
        <OfferBanner />
        <ProductDiscount />
        <NewestProduct setFavlength={setFavlength} />
        <AllProductsSection setFavlength={setFavlength} />
        {/* <ProductSection setFavlength={setFavlength} /> */}
        {/* <Features /> */}
      </Suspense>
    </div>
  );
};

export default React.memo(Home);
