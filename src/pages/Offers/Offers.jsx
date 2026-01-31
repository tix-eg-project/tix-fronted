



import React, { useState, useCallback, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ChevronLeft, ChevronRight, Star, Tag, ShoppingBag, X } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import ProductCard from '../../component/UI/ProductCard';
import { useLocation } from 'react-router-dom';

export default function Offers({ setFavlength }) {
  const { t, i18n } = useTranslation("global");
  const isRTL = i18n.language === "ar";
  const [offers, setOffers] = useState([]);
  const [productsInOffer, setProductsInOffer] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
 const location = useLocation();
 const searchParams = new URLSearchParams(location.search);
 const id = searchParams.get("id");
////console.log({location ,searchParams , id});

  // Get offers
  const getOffers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/offers`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
        }
      );
      
      if (response.data.status === true) {
        setOffers(response.data.data);
        // Set first offer as active by default
        if (response.data.data.length > 0) {
          setActiveTab(response.data.data[0].id);
        }
      } else {
        setError("Failed to fetch offers");
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
      setError("Error fetching offers");
    } finally {
      setLoading(false);
    }
  }, [i18n.language]);

  // Get products by offer
  const getProductsByOffer = useCallback(async (offerId, page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/offers/${offerId}/products?page=${page}`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
        }
      );
      
      if (response.data.status === true) {
        setProductsInOffer(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setError("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Error fetching products");
    } finally {
      setLoading(false);
    }
  }, [i18n.language]);

  let GetAllFavourite = async () => {
    await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/favorites`, {
      headers: {
        Accept: "application/json",
        "Accept-Language": i18n.language,
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    }).then(res => {
      setFavlength(res.data.data.length)
    }).catch(err => {
      console.error("Error fetching favorites:", err);
    })
  }

  // Handle tab change
  const handleTabChange = (offerId) => {
    setActiveTab(offerId);
    setCurrentPage(1);
    getProductsByOffer(offerId, 1);
    // Hide sidebar on mobile after selection
    if (window.innerWidth < 992) {
      setSidebarVisible(false);
    }
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    getProductsByOffer(activeTab, page);
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  useEffect(() => {
    getOffers();
  }, [getOffers]);

  

useEffect(() => {
  getOffers();
}, [getOffers]);


useEffect(() => {
  if (id && offers.length > 0) {
    const foundOffer = offers.find((offer) => String(offer.id) === String(id));
    if (foundOffer) {
      setActiveTab(foundOffer.id);
      getProductsByOffer(foundOffer.id, 1);
    }
  }
}, [id, offers, getProductsByOffer]);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div className="container-fluid py-4">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-4">
          <h4 className=" fw-bold text-black mb-3" style={{fontSize: '2 rem !important'}}>
            <Tag className="mx-1 " size={28} />
            {i18n.language === "ar" ? "العروض" : "Offers"}
          </h4>
          <p className=" text-muted">
            {i18n.language === "ar"
              ? "اكتشف أفضل العروض والخصومات على منتجاتنا المختارة."
              : "Discover the best offers and discounts on our selected products."}
          </p>
        </div>

        {/* Mobile sidebar toggle button */}
        <div className="d-lg-none mb-3">
          <button 
            className="btn bg-black text-white w-100 d-flex align-items-center justify-content-center"
            onClick={toggleSidebar}
          >
            <Tag className="me-2" size={20} />
            {t("offers.viewOffers", "View Offers")}
            <span className="ms-2 badge bg-light text-dark">{offers.length}</span>
          </button>
        </div>

        <div className="row">
          {/* Offers Sidebar */}
          <div className={`col-lg-3 ${sidebarVisible ? 'sidebar-mobile-visible' : 'd-none d-lg-block'}`}>
            <div className="card border-0 mb-4 sticky-top" style={{ top: '20px', borderRadius: '15px', background: 'rgba(255,255,255,0.95)' }}>
              <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center d-lg-none">
                <h5 className="mb-0">{t("offers.offersList", "Offers")}</h5>
                <button className="btn btn-sm btn-none" onClick={() => setSidebarVisible(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="card-body p-0">
                <div className="p-3" style={{ background: 'rgba(102, 126, 234, 0.1)', borderRadius: '15px 15px 0 0' }}>
                  <h6 className="text-center mb-3 fw-bold">{i18n.language=="ar"  ?   "العروض المتاحة" :"Available Offers"}</h6>
                </div>
                <div className="p-3">
                  {offers.map((offer) => (
                    <button
                      key={offer.id}
                      className={`d-block w-100 text-start btn btn-none fw-bold py-3 px-3 mb-2 border-0 ${
                        activeTab === offer.id 
                          ? 'active text-white' 
                          : 'text-black bg-light'
                      }`}
                      onClick={() => handleTabChange(offer.id)}
                      style={{
                        borderRadius: '10px',
                        background: activeTab === offer.id 
                          ? 'linear-gradient(135deg, rgba(0,0,0,0.5) 0%, #000 100%)' 
                          : 'rgba(255,255,255,0.9)',
                        transition: 'all 0.3s ease',
                        transform: activeTab === offer.id ? 'translateX(5px)' : 'none',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Star className="me-2" size={18} />
                      {offer.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Display */}
          <div className="col-lg-9">
            {activeTab && (
              <div className="card border-0" style={{ borderRadius: '15px', background: 'rgba(255,255,255,0.98)' }}>
                <div className="card-body p-3 p-md-4">
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-black" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-3 text-muted">{t("offers.loading", "Loading amazing products...")}</p>
                    </div>
                  ) : (
                    <>
                      {/* Active Offer Title */}
                      {offers.find(offer => offer.id === activeTab) && (
                        <div className="text-center mb-4">
                          <h3 className="fw-bold text-black">
                            {offers.find(offer => offer.id === activeTab).name}
                          </h3>
                        </div>
                      )}

                      {/* Products Grid */}
                      <div className="row g-3">
                        {productsInOffer.map((product) => (
                          <div key={product.id} className="col-6 col-xl-4 col-lg-6">
                            <div 
                              className="card h-100 border-0 shadow-sm product-card"
                              style={{ 
                                borderRadius: '15px',
                                transition: 'all 0.3s ease',
                                overflow: 'hidden'
                              }}
                            >
                              <ProductCard 
                                item={product} 
                                getProductHaveDiscount={getProductsByOffer} 
                                getFav={GetAllFavourite} 
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination */}
                      {pagination && pagination.last_page > 1 && (
                        <nav className="mt-4">
                          <ul className="pagination justify-content-center flex-wrap">
                            <li className={`page-item ${pagination.current_page === 1 ? 'disabled' : ''}`}>
                              <button
                                className="page-link border-0 rounded-pill me-1"
                                onClick={() => handlePageChange(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                                style={{ background: 'rgba(243, 9, 9, 0.1)' }}
                              >
                                <ChevronLeft size={18} />
                              </button>
                            </li>

                            {Array.from({ length: Math.min(5, pagination.last_page) }, (_, index) => {
                              let page;
                              if (pagination.current_page <= 3) {
                                page = index + 1;
                              } else if (pagination.current_page >= pagination.last_page - 2) {
                                page = pagination.last_page - 4 + index;
                              } else {
                                page = pagination.current_page - 2 + index;
                              }
                              
                              if (page > pagination.last_page || page < 1) return null;
                              
                              return (
                                <li key={page} className={`page-item ${pagination.current_page === page ? 'active' : ''}`}>
                                  <button
                                    className="page-link border-0 rounded-pill mx-1"
                                    onClick={() => handlePageChange(page)}
                                    style={{
                                      background: pagination.current_page === page 
                                        ? 'linear-gradient(135deg, rgba(0,0,0,0.5) 0%, #000 100%)' 
                                        : 'rgba(174, 7, 26, 0.1)',
                                      color: pagination.current_page === page ? 'white' : '#667eea'
                                    }}
                                  >
                                    {page}
                                  </button>
                                </li>
                              );
                            })}

                            <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
                              <button
                                className="page-link border-0 rounded-pill ms-1"
                                onClick={() => handlePageChange(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page}
                                style={{ background: 'rgba(102, 126, 234, 0.1)' }}
                              >
                                <ChevronRight size={18} />
                              </button>
                            </li>
                          </ul>
                        </nav>
                      )}

                      {/* No Products Message */}
                      {!loading && productsInOffer.length === 0 && (
                        <div className="text-center py-5">
                          <ShoppingBag size={64} className="text-muted mb-3" />
                          <p className="text-muted">{i18n.language=="ar" ? "لا توجد منتجات للعرض"   :"No products found in this offer"}</p>
                          <p className="text-muted">{i18n.language =="ar" ? "اختر عرض اخر"  :" Try selecting a different offer"}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx={"true"}>{`
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.1);
        }
        
        .product-card:hover .product-overlay {
          opacity: 1;
        }
        
        .product-card:hover .card-img-top {
          transform: scale(1.05);
        }
        
        .hover-effect:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 19, 39, 0.2);
        }
        
        .nav-link {
          transition: all 0.3s ease;
        }
        
        .page-link {
          transition: all 0.3s ease;
        }
        
        .page-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(219, 10, 10, 0.3);
        }
        
        @media (max-width: 991px) {
          .sidebar-mobile-visible {
            position: fixed;
            top: 0;
            left: 0;
            width: 85%;
            height: 100vh;
            background: white;
            z-index: 1050;
            overflow-y: auto;
            padding: 1rem;
            box-shadow: 5px 0 15px rgba(0,0,0,0.1);
          }
          
          .sidebar-mobile-visible .sticky-top {
            position: relative;
            top: 0;
          }
        }
        
        @media (max-width: 576px) {
          .container {
            padding-left: 10px;
            padding-right: 10px;
          }
          
          .card-body {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}




