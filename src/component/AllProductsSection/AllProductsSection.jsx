import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from '../UI/ProductCard';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { apiRequest } from '../../Redux/Apis/apiRequest';
import './AllProductsSection.css';

const AllProductsSection = ({ setFavlength }) => {
  const { t, i18n } = useTranslation("global");
  const dispatch = useDispatch();
  const { carts } = useSelector(state => state.api);
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1
  });

  // Get all products with pagination
  const getAllProducts = useCallback(async (page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/api/products?page=${page}&per_page=10`;
      
      const response = await axios.get(apiUrl, {
        headers: {
          Accept: "application/json",
          "Accept-Language": i18n.language,
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
      });

      if (response.data.status === true) {
        dispatch(apiRequest({
          url: "api/cart",
          entity: "carts",
          headers: {
            "Accept-Language": i18n.language,
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        }));
        
        if (append) {
          setProducts(prev => [...prev, ...response.data.data]);
        } else {
          setProducts(response.data.data);
        }
        
        // Update pagination if available
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }

    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [i18n.language, dispatch]);

  // Load products on component mount
  useEffect(() => {
    getAllProducts(1);
  }, [getAllProducts]);

  // Handle load more
  const handleLoadMore = () => {
    if (pagination.current_page < pagination.last_page) {
      getAllProducts(pagination.current_page + 1, true);
    }
  };

  return (
    <section id="all-products-section" className="all-products-section">
      <div className="container-fluid">
        {/* Section Header */}
        <div className="section-header text-center mb-5">
        <h4 className=" fw-bold text-dark text-center mb-0  title" >
            
            
            {t('home.allProducts') || 'جميع المنتجات'}</h4>
          <p className="section-subtitle text-muted">
            {t('home.allProductsDesc') || 'اكتشف مجموعتنا الكاملة من المنتجات المميزة'}
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="row g-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="col-6 col-xl-3">
                <div className="card h-100">
                  <div className="card-img-top bg-light placeholder-glow" style={{ height: '200px' }}>
                    <div className="placeholder w-100 h-100"></div>
                  </div>
                  <div className="card-body">
                    <h5 className="card-title placeholder-glow">
                      <span className="placeholder col-8"></span>
                    </h5>
                    <p className="card-text placeholder-glow">
                      <span className="placeholder col-4"></span>
                    </p>
                    <div className="placeholder-glow">
                      <span className="placeholder col-12 btn"></span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="row g-4">
              {products.map((item) => (
                <div key={item.id} className="col-6 col-xl-3">
                  <ProductCard
                    item={item}
                    getProductHaveDiscount={() => {}}
                    getFav={() => {}}
                  />
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {pagination.current_page < pagination.last_page && (
              <div className="text-center mt-5">
                <button 
                  className="btn btn-load-more"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {t('products.loading') || 'جاري التحميل...'}
                    </>
                  ) : (
                    <>
                      <i className="bi bi-arrow-down-circle me-2"></i>
                      {t('products.loadMore') || 'عرض المزيد'}
                    </>
                  )}
                </button>
                <p className="text-muted mt-2 small">
                  {t('products.showing') || 'عرض'} {products.length} {t('products.of') || 'من'} {pagination.total} {t('products.products') || 'منتج'}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-5">
            <div className="mb-4">
              <div className="bg-light rounded-circle mx-auto d-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px' }}>
                <i className="bi bi-box text-muted" style={{ fontSize: '40px' }}></i>
              </div>
            </div>
            <h4 className="text-muted mb-3">{t('products.noProducts') || 'لا توجد منتجات'}</h4>
            <p className="text-muted">{t('products.tryAgain') || 'حاول مرة أخرى لاحقاً'}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default React.memo(AllProductsSection);