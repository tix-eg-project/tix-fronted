


import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { FiUser, FiSearch, FiChevronDown, FiMenu, FiX } from "react-icons/fi";
import { IoIosHeartEmpty } from "react-icons/io";
import logo from "../assests/imgs/logo.svg";
import axios from "axios";
import OffersBanner from "./BannerOffer/BannerOffer";
import { useDispatch, useSelector } from "react-redux";
import { apiRequest } from "../Redux/Apis/apiRequest";

const Navbar = ({ favLength, onCartUpdate }) => {
  const { t, i18n } = useTranslation("global");
  const navigate = useNavigate();
  const [isMobileScrolled, setIsMobileScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]); // ✅ نتائج السيرش
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [screenSize, setScreenSize] = useState(window.innerWidth);
  const dispatch = useDispatch();
  const { carts } = useSelector((state) => state.api);



  const getAllCategories = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/categories`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );
      if (response.data.status === true) {

      }
    } catch (error) {

    }
  };


  const searchQueryAPI = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]); // لو مفيش query فضي النتائج
      return;
    }
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/search?q=${searchQuery}`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );
      if (response.data.status === true) {
        setSearchResults(response.data.data || []); // ✅ حط النتائج
      } else {
        setSearchResults([]);
      }
    } catch (error) {

      setSearchResults([]);
    }
  };


  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      searchQueryAPI();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);


  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {

      setSearchQuery("");
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e);
    }
  };

  const handleSearchIconClick = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  };


  const refreshCartData = () => {
    if (localStorage.getItem("token")) {
      dispatch(apiRequest({
        url: "api/cart",
        entity: "carts",
        headers: {
          "Accept-Language": i18n.language,
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      }));
    }
  };

  window.refreshCart = refreshCartData;

  window.triggerCartUpdate = () => {
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    localStorage.setItem('cartUpdated', Date.now().toString());
  };

  window.addToCartAndUpdate = async (productId, quantity = 1) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept-Language': i18n.language
        },
        body: JSON.stringify({ product_id: productId, quantity })
      });
      if (response.ok) {
        window.triggerCartUpdate();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };


  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsSearchOpen(false);
  };

  const toggleMobileSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    setIsMobileMenuOpen(false);
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsMobileMenuOpen(false);
  };


  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/logout`, {}, {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      dispatch({ type: 'api/request/fulfilled', payload: { entity: 'carts', data: null } });
      toast.success(t("topnav.logoutSuccess"));
      setIsMobileMenuOpen(false);
      setTimeout(() => window.location.reload(), 1500);
    }
  };


  useEffect(() => {
    getAllCategories();
    if (localStorage.getItem("token")) {
      refreshCartData();
    }
  }, [i18n.language]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        e.newValue ? refreshCartData() : dispatch({ type: 'api/request/fulfilled', payload: { entity: 'carts', data: null } });
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [dispatch]);

  useEffect(() => {
    if (onCartUpdate) refreshCartData();
  }, [onCartUpdate]);

  useEffect(() => {
    const handleCartUpdate = () => refreshCartData();
    window.addEventListener('cartUpdated', handleCartUpdate);
    const handleStorage = (e) => {
      if (e.key === 'cartUpdated') refreshCartData();
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  useEffect(() => {
    const handleScroll = () => setIsMobileScrolled(window.scrollY >= 100);
    const handleResize = () => {
      setScreenSize(window.innerWidth);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
        setIsSearchOpen(false);
      }
    };
    
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const cartItemCount = localStorage.getItem("token") && carts?.data?.data?.data?.length || 0;

  return (
    <div>
      <OffersBanner />
      <nav className={`navbar navbar-expand-lg ${isMobileScrolled ? "fixed-top shadow-sm" : ""}`}
           style={{
             background: theme === "dark" ? "#1a1a1a" : "#fff",
             borderBottom: theme === "dark" ? "1px solid #333" : "1px solid #eee",
             zIndex: 1030
           }}>
        <div className="container-fluid px-3 px-md-4">
          
          {/* Main Navbar Row */}
          <div className="row w-100 align-items-center gx-1 gx-sm-2">
            
            {/* Logo Section */}
            <div className="col-5 col-sm-4 col-md-3 col-lg-2">
              <Link className="navbar-brand d-flex align-items-center" to="/">
                <img 
                  src={logo} 
                  alt="logo" 
                  style={{ 
                    width: screenSize < 576 ? "40px" : screenSize < 768 ? "45px" : "50px",
                    height: "auto"
                  }} 
                />
              </Link>
            </div>

            {/* Desktop Search - Hidden on mobile */}
            <div className="col-lg-6 col-xl-7 d-none d-lg-block position-relative">
              <form onSubmit={handleSearchSubmit} className="w-100">
                <div className="search-box position-relative">
                  <input
                    type="text"
                    className="form-control rounded"
                    placeholder={i18n.language === "ar" ? "ابحث ...." : "Search..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    style={{
                      padding: "12px 50px 12px 20px",
                      background: theme === "dark" ? "#2a2a2a" : "#f8f9fa",
                      color: theme === "dark" ? "#eee" : "#000",
                      border: theme === "dark" ? "1px solid #444" : "1px solid #dee2e6",
                      fontSize: "14px"
                    }}
                  />
                  <FiSearch
                    onClick={handleSearchIconClick}
                    className="position-absolute"
                    style={{
                      right: i18n.language === "ar" ? "auto" : "15px",
                      left: i18n.language === "ar" ? "15px" : "auto",
                      top: "50%", 
                      transform: "translateY(-50%)",
                      color: theme === "dark" ? "#ccc" : "#666",
                      fontSize: "18px", 
                      cursor: "pointer"
                    }}
                  />
                </div>
              </form>

              {/* ✅ Dropdown للنتائج */}
              {searchQuery && (
                <div
                  className="position-absolute w-100 mt-1 rounded shadow"
                  style={{
                    background: theme === "dark" ? "#2a2a2a" : "#fff",
                    maxHeight: "300px",
                    overflowY: "auto",
                    zIndex: 2000,
                    border: theme === "dark" ? "1px solid #444" : "1px solid #dee2e6"
                  }}
                >
                  {searchResults.length > 0 ? (
                    searchResults.map((item, index) => (
                      <Link
                        key={index}
                        to={`/productdetails/${item.id}`}
                        className="d-block px-3 py-2 text-decoration-none"
                        style={{
                          color: theme === "dark" ? "#eee" : "#333",
                          borderBottom: theme === "dark" ? "1px solid #444" : "1px solid #f1f1f1",
                          fontSize: "14px",
                          transition: "background-color 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = theme === "dark" ? "#333" : "#f8f9fa";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent";
                        }}
                        onClick={() => {
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                      >
                        {item.name}
                      </Link>
                    ))
                  ) : (
                    <div
                      className="px-3 py-2"
                      style={{ 
                        color: theme === "dark" ? "#aaa" : "#666",
                        fontSize: "14px"
                      }}
                    >
                      {i18n.language === "ar"
                        ? "لا يوجد نتائج"
                        : "No results found"}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions Section */}
            <div className="col-7 col-sm-8 col-md-9 col-lg-4 col-xl-3 d-flex justify-content-end align-items-center">
              
              {/* Desktop Actions */}
              <div className="d-none d-md-flex align-items-center gap-2 gap-lg-3">
                
                {/* Cart */}
                <div className="position-relative">
                  <Link to="/cart" title={t("navbar.cart")} className="text-decoration-none p-1">
                    <i className="bi bi-cart" 
                       style={{ 
                         fontSize: "22px", 
                         color: theme === "dark" ? "#eee" : "#333" 
                       }}></i>
                  </Link>
                  {cartItemCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle text-center text-white rounded-pill bg-danger"
                          style={{ fontSize: "12px", minWidth: "18px", height: "18px", lineHeight: "18px" }}>
                      {cartItemCount > 99 ? "99+" : cartItemCount }
                    </span>
                  )}
                </div>

                {/* Favorites */}
                <div className="position-relative">
                  <Link to="/favorites" title={t("navbar.favorites")} className="text-decoration-none p-1">
                    <IoIosHeartEmpty 
                      style={{ 
                        fontSize: "24px", 
                        color: "#dc3545" 
                      }} 
                    />
                  </Link>
                  {favLength > 0 && (
                    <span className="position-absolute -top-2 start-100 translate-middle text-center text-white rounded-pill bg-danger"
                          style={{ fontSize: "12px", minWidth: "18px", height: "18px", lineHeight: "18px" }}>
                      {favLength > 99 ? "99+" : favLength}
                    </span>
                  )}
                </div>

                {/* User Menu */}
                <div>
                  {localStorage.getItem("token") ? (
                    <div className="dropdown">
                      <button
                        className="btn btn-sm dropdown-toggle border-0 p-1"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        style={{ 
                          background: "transparent",
                          color: theme === "dark" ? "#eee" : "#333"
                        }}
                      >
                        <FiUser style={{ fontSize: "22px" }} />
                      </button>
                      <ul className={i18n.language === "en" ? "dropdown-menu dropdown-menu-end" : "dropdown-menu dropdown-menu-start"}
                          style={{
                            background: theme === "dark" ? "#2a2a2a" : "#fff",
                            border: theme === "dark" ? "1px solid #444" : "1px solid #dee2e6"
                          }}>
                        <li>
                          <Link to="/profile" 
                                className="dropdown-item"
                                style={{ color: theme === "dark" ? "#eee" : "#333" }}>
                            {t("navbar.myAccount")}
                          </Link>
                        </li>
                        <li>
                          <button onClick={handleLogout} 
                                  className="dropdown-item"
                                  style={{ color: theme === "dark" ? "#eee" : "#333" }}>
                            {t("navbar.logout")}
                          </button>
                        </li>
                      </ul>
                    </div>
                  ) : (
                    <Link to="/login" className="text-decoration-none p-1">
                      <FiUser style={{ 
                        fontSize: "22px", 
                        color: theme === "dark" ? "#eee" : "#333" 
                      }} />
                    </Link>
                  )}
                </div>

                {/* Language Switcher */}
                <div className="dropdown">
                  <button 
                    className="btn btn-sm bg-secondary dropdown-toggle border-0 px-2 py-1" 
                    data-bs-toggle="dropdown"
                    style={{ 
                      background: "transparent",
                      color:"white",
                      fontSize: "12px",
                      minWidth: "40px",
                      minHeight: "40px"
                    }}>
                    {i18n.language === "ar" ? "AR" : "EN"}
                  </button>
                  <ul className={i18n.language === "en" ? "dropdown-menu dropdown-menu-end" : "dropdown-menu dropdown-menu-start"}
                      style={{
                        background: theme === "dark" ? "#2a2a2a" : "#fff",
                        border: theme === "dark" ? "1px solid #444" : "1px solid #dee2e6",
                        minWidth: "100px"
                      }}>
                    <li>
                      <button className="dropdown-item" 
                              onClick={() => changeLanguage("en")}
                              style={{ 
                                color: theme === "dark" ? "#eee" : "#333",
                                fontSize: "13px"
                              }}>
                        English
                      </button>
                    </li>
                    <li>
                      <button className="dropdown-item" 
                              onClick={() => changeLanguage("ar")}
                              style={{ 
                                color: theme === "dark" ? "#eee" : "#333",
                                fontSize: "13px"
                              }}>
                        العربية
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="d-flex d-md-none align-items-center gap-1">
                
                {/* Mobile Search Toggle */}
                <button 
                  className="btn btn-sm p-2"
                  onClick={toggleMobileSearch}
                  style={{ 
                    background: "transparent",
                    border: "none",
                    color: theme === "dark" ? "#eee" : "#333",
                    minWidth: "44px",
                    minHeight: "44px"
                  }}>
                  <FiSearch style={{ fontSize: "20px" }} />
                </button>

                {/* Mobile Cart */}
                <div className="position-relative">
                  <Link to="/cart" className="text-decoration-none p-2 d-flex align-items-center justify-content-center"
                        style={{ minWidth: "44px", minHeight: "44px" }}>
                    <i className="bi bi-cart" 
                       style={{ 
                         fontSize: "20px", 
                         color: theme === "dark" ? "#eee" : "#333" 
                       }}></i>
                  </Link>
                  {cartItemCount > 0 && (
                    <span className="position-absolute top-0 text-white d-flex align-items-center justify-content-center text-center translate-middle  rounded-pill bg-danger"
                          style={{ fontSize: "10px", minWidth: "20px", right: "-15%", height: "20px", lineHeight: "16px" }}>
                      {cartItemCount > 9 ? "9+" : cartItemCount}
                    </span>
                  )}
                </div>

                {/* Mobile Menu Toggle */}
                <button 
                  className="btn btn-sm p-2"
                  onClick={toggleMobileMenu}
                  style={{ 
                    background: "transparent",
                    border: "none",
                    color: theme === "dark" ? "#eee" : "#333",
                    minWidth: "44px",
                    minHeight: "44px"
                  }}>
                  {isMobileMenuOpen ? 
                    <FiX style={{ fontSize: "22px" }} /> : 
                    <FiMenu style={{ fontSize: "22px" }} />
                  }
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Search Dropdown */}
          {isSearchOpen && (
            <div className="row w-100 mt-2 d-md-none">
              <div className="col-12 position-relative">
                <form onSubmit={handleSearchSubmit}>
                  <div className="search-box position-relative">
                    <input
                      type="text"
                      className="form-control rounded-pill"
                      placeholder={i18n.language === "ar" ? "ابحث ...." : "Search..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleSearchKeyPress}
                      autoFocus
                      style={{
                        padding: "12px 50px 12px 20px",
                        background: theme === "dark" ? "#2a2a2a" : "#f8f9fa",
                        color: theme === "dark" ? "#eee" : "#000",
                        border: theme === "dark" ? "1px solid #444" : "1px solid #dee2e6",
                        fontSize: "16px"
                      }}
                    />
                    <FiSearch
                      onClick={handleSearchIconClick}
                      className="position-absolute"
                      style={{
                        right: i18n.language === "ar" ? "auto" : "15px",
                        left: i18n.language === "ar" ? "15px" : "auto",
                        top: "50%", 
                        transform: "translateY(-50%)",
                        color: theme === "dark" ? "#ccc" : "#666",
                        fontSize: "18px", 
                        cursor: "pointer",
                        padding: "4px"
                      }}
                    />
                  </div>
                </form>

                {/* ✅ Mobile Search Results Dropdown */}
                {searchQuery && (
                  <div
                    className="position-absolute w-100 mt-1 rounded shadow"
                    style={{
                      background: theme === "dark" ? "#2a2a2a" : "#fff",
                      maxHeight: "250px",
                      overflowY: "auto",
                      zIndex: 2000,
                      border: theme === "dark" ? "1px solid #444" : "1px solid #dee2e6"
                    }}
                  >
                    {searchResults.length > 0 ? (
                      searchResults.map((item, index) => (
                        <Link
                          key={index}
                          to={`/productdetails/${item.id}`}
                          className="d-block px-3 py-2 text-decoration-none"
                          style={{
                            color: theme === "dark" ? "#eee" : "#333",
                            borderBottom: theme === "dark" ? "1px solid #444" : "1px solid #f1f1f1",
                            fontSize: "15px"
                          }}
                          onClick={() => {
                            setSearchQuery("");
                            setSearchResults([]);
                            setIsSearchOpen(false);
                          }}
                        >
                          {item.name}
                        </Link>
                      ))
                    ) : (
                      <div
                        className="px-3 py-2"
                        style={{ 
                          color: theme === "dark" ? "#aaa" : "#666",
                          fontSize: "15px"
                        }}
                      >
                        {i18n.language === "ar"
                          ? "لا يوجد نتائج"
                          : "No results found"}
                      </div>
                    )}
                  </div>
                )}
                
              </div>
            </div>
          )}

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="row w-100 mt-2 d-md-none">
              <div className="col-12">
                <div className="mobile-menu p-3 rounded"
                     style={{
                       background: theme === "dark" ? "#2a2a2a" : "#f8f9fa",
                       border: theme === "dark" ? "1px solid #444" : "1px solid #dee2e6",
                       marginBottom: "10px"
                     }}>
                  
                  {/* Mobile User Section */}
                  <div className="mb-3 pb-3 border-bottom"
                       style={{ borderColor: theme === "dark" ? "#444" : "#dee2e6" }}>
                    {localStorage.getItem("token") ? (
                      <>
                        <Link to="/profile" 
                              className="d-flex align-items-center text-decoration-none mb-2 py-2"
                              style={{ 
                                color: theme === "dark" ? "#eee" : "#333",
                                fontSize: "16px"
                              }}
                              onClick={() => setIsMobileMenuOpen(false)}>
                          <FiUser className="me-3" style={{ fontSize: "20px" }} />
                          {t("navbar.myAccount")}
                        </Link>
                        <button onClick={handleLogout} 
                                className="btn btn-link p-0 text-start py-2"
                                style={{ 
                                  color: theme === "dark" ? "#eee" : "#333",
                                  textDecoration: "none",
                                  fontSize: "16px"
                                }}>
                          <FiUser className="me-3" style={{ fontSize: "20px" }} />
                          {t("navbar.logout")}
                        </button>
                      </>
                    ) : (
                      <Link to="/login" 
                            className="d-flex align-items-center text-decoration-none py-2"
                            style={{ 
                              color: theme === "dark" ? "#eee" : "#333",
                              fontSize: "16px"
                            }}
                            onClick={() => setIsMobileMenuOpen(false)}>
                        <FiUser className="me-3" style={{ fontSize: "20px" }} />
                        {i18n.language=="ar"? "تسجيل دخول": "Login"}
                      </Link>
                    )}
                  </div>

                  {/* Mobile Favorites */}
                  <div className="mb-3">
                    <Link to="/favorites" 
                          className="d-flex align-items-center justify-content-between text-decoration-none py-2"
                          style={{ 
                            color: theme === "dark" ? "#eee" : "#333",
                            fontSize: "16px"
                          }}
                          onClick={() => setIsMobileMenuOpen(false)}>
                      <span className="d-flex align-items-center">
                        <IoIosHeartEmpty className="me-3 text-danger" style={{ fontSize: "22px" }} />
                        {t("navbar.favorites")}
                      </span>
                      {favLength > 0 && (
                        <span className="badge bg-danger rounded-pill" style={{ fontSize: "12px" }}>
                          {favLength > 99 ? "99+" : favLength}
                        </span>
                      )}
                    </Link>
                  </div>

                  {/* Mobile Language Switcher */}
                  <div className="mb-3 pb-3 border-bottom"
                       style={{ borderColor: theme === "dark" ? "#444" : "#dee2e6" }}>
                    <div style={{ 
                      color: theme === "dark" ? "#ccc" : "#666",
                      fontSize: "14px",
                      marginBottom: "12px",
                      fontWeight: "500"
                    }}>
                      {i18n.language=="ar"? "اللغات" : "Language"}
                    </div>
                    <div className="d-flex gap-2">
                      <button 
                        className={`btn btn-sm ${i18n.language === "en" ? "bg-dark text-white" : "btn-outline-secondary"}`}
                        onClick={() => changeLanguage("en")}
                        style={{ 
                          fontSize: "14px", 
                          minWidth: "80px",
                          padding: "8px 12px"
                        }}>
                        English
                      </button>
                      <button 
                        className={`btn btn-sm ${i18n.language === "ar" ? "bg-dark text-white" : "btn-outline-secondary"}`}
                        onClick={() => changeLanguage("ar")}
                        style={{ 
                          fontSize: "14px", 
                          minWidth: "80px",
                          padding: "8px 12px"
                        }}>
                        عربي
                      </button>
                    </div>
                  </div>

                 
                </div>
              </div>
            </div>
          )}

          {/* Tablet Search (md screens) - Hidden on mobile and desktop */}
          {!isSearchOpen && (
            <div className="row w-100 mt-2 d-none d-md-block d-lg-none position-relative">
              <div className="col-12">
                <form onSubmit={handleSearchSubmit}>
                  <div className="search-box position-relative">
                    <input
                      type="text"
                      className="form-control rounded-pill"
                      placeholder={i18n.language === "ar" ? "ابحث ...." : "Search..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleSearchKeyPress}
                      style={{
                        padding: "12px 50px 12px 20px",
                        background: theme === "dark" ? "#2a2a2a" : "#f8f9fa",
                        color: theme === "dark" ? "#eee" : "#000",
                        border: theme === "dark" ? "1px solid #444" : "1px solid #dee2e6",
                        fontSize: "15px"
                      }}
                    />
                    <FiSearch
                      onClick={handleSearchIconClick}
                      className="position-absolute"
                      style={{
                        right: i18n.language === "ar" ? "auto" : "15px",
                        left: i18n.language === "ar" ? "15px" : "auto",
                        top: "50%", 
                        transform: "translateY(-50%)",
                        color: theme === "dark" ? "#ccc" : "#666",
                        fontSize: "18px", 
                        cursor: "pointer",
                        padding: "4px"
                      }}
                    />
                  </div>
                </form>

                {/* ✅ Tablet Search Results Dropdown */}
                {searchQuery && (
                  <div
                    className="position-absolute w-100 mt-1 rounded shadow"
                    style={{
                      background: theme === "dark" ? "#2a2a2a" : "#fff",
                      maxHeight: "250px",
                      overflowY: "auto",
                      zIndex: 2000,
                      border: theme === "dark" ? "1px solid #444" : "1px solid #dee2e6"
                    }}
                  >
                    {searchResults.length > 0 ? (
                      searchResults.map((item, index) => (
                        <Link
                          key={index}
                          to={`/productdetails/${item.id}`}
                          className="d-block px-3 py-2 text-decoration-none"
                          style={{
                            color: theme === "dark" ? "#eee" : "#333",
                            borderBottom: theme === "dark" ? "1px solid #444" : "1px solid #f1f1f1",
                            fontSize: "14px"
                          }}
                          onClick={() => {
                            setSearchQuery("");
                            setSearchResults([]);
                          }}
                        >
                          {item.name}
                        </Link>
                      ))
                    ) : (
                      <div
                        className="px-3 py-2"
                        style={{ 
                          color: theme === "dark" ? "#aaa" : "#666",
                          fontSize: "14px"
                        }}
                      >
                        {i18n.language === "ar"
                          ? "لا يوجد نتائج"
                          : "No results found"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;





















































































































































































































































































































































  
























































































      





















    





























































































































    










































































































































          


            




























































              


                





























































































































                








































































































                  















































































































































