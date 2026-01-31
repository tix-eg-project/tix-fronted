


import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, X, Menu } from 'lucide-react';
import ProductCard from '../../component/UI/ProductCard';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { apiRequest } from '../../Redux/Apis/apiRequest';

const AllProducts = () => {
  const { t, i18n } = useTranslation("global");
  const dispatch = useDispatch();
  const { carts } = useSelector(state => state.api);
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1
  });
  const [showFilters, setShowFilters] = useState(false); // State for mobile filter visibility

  // Filter states
  const [filters, setFilters] = useState({
    category: '',
    subcategory: '',
    brand: '',
    name: '',
    sort: '',
    price_min: "",
    price_max: "",
    selectedCategories: [],
    selectedBrands: [],
    selectedSubCategories: [],
    page: 1
  });

  // Get all subcategories
  const getAllSubcategories = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/subcategories`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
        }
      );

      if (response.data.status === true) {
        setSubCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  }, [i18n.language]);

  // Get all categories
  const getAllcategories = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/categories`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
        }
      );

      if (response.data.status === true) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [i18n.language]);

  // Get all brands
  const getAllBrands = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/brands`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
        }
      );

      if (response.data.status === true) {
        setBrands(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  }, [i18n.language]);

  // Initialize data
  useEffect(() => {
    Promise.all([
      getAllBrands(),
      getAllSubcategories(),
      getAllcategories()
    ]);
    
    // Load all products without any filters initially
    getAllProductsWithoutFilters();
  }, [i18n.language, getAllBrands, getAllSubcategories, getAllcategories]);

  // Get all products without filters initially
  const getAllProductsWithoutFilters = useCallback(async () => {
    try {
      setLoading(true);
      
      const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/api/product/filter`;
      
      const response = await axios.get(apiUrl, {
        headers: {
          Accept: "application/json",
          "Accept-Language": i18n.language,
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
      });

      if (response.data.status === true) {
        dispatch(apiRequest({
          url:"api/cart",
          entity:"carts",
          headers: {
             "Accept-Language": i18n.language,
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        }))
        setProducts(response.data.data);
        
        // Update pagination if available
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }

    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [i18n.language, dispatch]);

  // Get filtered products
  const getAllProductWithfilteration = async (page = 1, customFilters = null) => {
    try {
      setLoading(true);
      
      const currentFilters = customFilters || filters;
      
      // Build query parameters
      const params = new URLSearchParams();
      
      // Add pagination
      params.append('page', page.toString());
      
      // Only add filters if they have values
      if (currentFilters.category) params.append('category', currentFilters.category);
      if (currentFilters.subcategory) params.append('subcategory', currentFilters.subcategory);
      if (currentFilters.brand) params.append('brand', currentFilters.brand);
      if (currentFilters.name && currentFilters.name.trim()) params.append('name', currentFilters.name.trim());
      if (currentFilters.sort) params.append('sort', currentFilters.sort);
      if (currentFilters.price_min) params.append('price_min', currentFilters.price_min);
      if (currentFilters.price_max) params.append('price_max', currentFilters.price_max);

      const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/api/product/filter?${params.toString()}`;
      ////console.log('API URL:', apiUrl);

      const response = await axios.get(apiUrl, {
        headers: {
          Accept: "application/json",
          "Accept-Language": i18n.language,
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
      });

      if (response.data.status === true) {
        ////console.log("Products data:", response.data.data);
        dispatch(apiRequest({
          url:"api/cart",
          entity:"carts",
          headers: {
             "Accept-Language": i18n.language,
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        }))
        setProducts(response.data.data);
        
        // Update pagination if available
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }

    } catch (error) {
      ////console.log({ error });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  }, []);

  const handleMultiSelectChange = useCallback((key, value, checked) => {
    setFilters(prev => ({
      ...prev,
      [key]: checked 
        ? [...prev[key], value]
        : prev[key].filter(item => item !== value),
      page: 1 // Reset to first page when filters change
    }));
  }, []);

  const handleSearch = useCallback(() => {
    // Update main filter values from multi-select arrays
    const updatedFilters = {
      ...filters,
      category: filters.selectedCategories.join(','),
      brand: filters.selectedBrands.join(','),
      subcategory: filters.selectedSubCategories.join(','),
      page: 1
    };
    
    setFilters(updatedFilters);
    getAllProductWithfilteration(1, updatedFilters);
    setShowFilters(false); // Close filters on mobile after search
  }, [filters]);

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      subcategory: '',
      brand: '',
      name: '',
      sort: '',
      price_min: '',
      price_max: '',
      selectedCategories: [],
      selectedBrands: [],
      selectedSubCategories: [],
      page: 1
    };
    
    setFilters(clearedFilters);
    getAllProductsWithoutFilters(); // Load all products without filters
  };

  const removeFilter = (filterType, value = null) => {
    let updatedFilters;
    
    if (value) {
      // For array filters
      updatedFilters = {
        ...filters,
        [filterType]: filters[filterType].filter(item => item !== value),
        page: 1
      };
    } else {
      // For single filters
      updatedFilters = {
        ...filters,
        [filterType]: filterType.includes('selected') ? [] : '',
        page: 1
      };
    }
    
    setFilters(updatedFilters);
    
    // Update main filter values and call API
    const finalFilters = {
      ...updatedFilters,
      category: updatedFilters.selectedCategories.join(','),
      brand: updatedFilters.selectedBrands.join(','),
      subcategory: updatedFilters.selectedSubCategories.join(',')
    };
    
    getAllProductWithfilteration(1, finalFilters);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      setFilters(prev => ({ ...prev, page: newPage }));
      getAllProductWithfilteration(newPage);
    }
  };

  // Auto-apply when sort changes
  useEffect(() => {
    if (filters.sort) {
      const updatedFilters = {
        ...filters,
        category: filters.selectedCategories.join(','),
        brand: filters.selectedBrands.join(','),
        subcategory: filters.selectedSubCategories.join(',')
      };
      getAllProductWithfilteration(filters.page, updatedFilters);
    } else if (filters.sort === '') {
      // If sort is empty (default), load all products without filters
      getAllProductsWithoutFilters();
    }
  }, [filters.sort]);

  // Memoized values for performance
  const hasActiveFilters = useMemo(() => {
    return filters.name || filters.selectedCategories.length > 0 || 
           filters.selectedBrands.length > 0 || filters.selectedSubCategories.length > 0 ||
           filters.price_min || filters.price_max || filters.sort;
  }, [filters]);

  const totalProducts = useMemo(() => {
    return pagination.total || products.length;
  }, [pagination.total, products.length]);

  return (
    <div className="bg-light min-vh-100">
      <div className="container-fluid p-4">
        <div className="row">
          {/* Mobile Filter Toggle Button */}
          <div className="d-lg-none mb-3">
            <button 
              className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Menu size={18} className="me-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {/* Filters Sidebar */}
          <div className={`col-lg-3 ${showFilters ? 'd-block' : 'd-none d-lg-block'}`}>
            <div className="filters-box card shadow-sm sticky-top" style={{ top: '20px' }}>
              <div className="card-header bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 d-flex align-items-center">
                    <Filter className="me-2 text-white" size={20} />
                    {t('filter.title') || 'Filters'}
                  </h5>
                  <div className="d-flex align-items-center">
                    <button 
                      onClick={clearFilters}
                      className="btn btn-danger text-white btn-sm me-2"
                    >
                      {t('filter.clearAll') || 'Clear All'}
                    </button>
                    <button 
                      className="btn btn-outline-secondary btn-sm d-lg-none"
                      onClick={() => setShowFilters(false)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="card-body">
                {/* Search by Name */}
                <div className="filter-block mb-4 " >
                  <h6 className="fw-semibold mb-3">{t('filter.search') || 'Search Products'}</h6>
                  <div dir='ltr' className="input-group mb-2 ">
                    <span className={`input-group-text bg-light  border-end-0`}>
                      <Search size={16} />
                    </span>
                    <input
                    
                      type="text"
                      className={`form-control border-start-0`}
                      placeholder={t('filter.searchPlaceholder') || 'Search by product name...'}
                      value={filters.name}
                      onChange={(e) => handleFilterChange('name', e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <button 
                    onClick={handleSearch}
                    className="btn bg-black text-white btn-sm w-100"
                    disabled={loading}
                  >
                    <Search size={14} className="me-1" />
                    {t('filter.searchBtn') || 'Search'}
                  </button>
                </div>

                {/* Sort Options */}
                <div className="filter-block mb-4">
                  <h6 className="fw-semibold mb-3">{t('filter.sortBy') || 'Sort By'}</h6>
                  <select 
                    className="form-select"
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                  >
                    <option value="">{t('sort.default') || 'Default'}</option>
                    <option value="newest">{t('sort.newest') || 'الأحدث'}</option>
                    <option value="price_low">{t('sort.priceLowHigh') || 'Price: Low to High'}</option>
                    <option value="price_high">{t('sort.priceHighLow') || 'Price: High to Low'}</option>
                    <option value="name_asc">{t('sort.nameAZ') || 'Name: A to Z'}</option>
                    <option value="name_desc">{t('sort.nameZA') || 'Name: Z to A'}</option>
                  </select>
                </div>

                {/* Price Range */}
                <div className="filter-block mb-4">
                  <h6 className="fw-semibold mb-3">{t('filter.priceRange') || 'Price Range'}</h6>
                  <div className="price-range d-flex align-items-center gap-2">
                    <input
                      type="number"
                      className="form-control"
                      min={0}
                      placeholder={t('filter.min') || 'Min'}
                      value={filters.price_min}
                      // onChange={(e) => handleFilterChange('price_min', e.target.value)}
onChange={(e) => {
    const val = Math.max(0, Number(e.target.value));
    handleFilterChange('price_min', val);
  }}
/>
                    <span className="text-muted">-</span>
                    <input
                      type="number"
                      className="form-control"
                      min={0}
                      placeholder={t('filter.max') || 'Max'}
                      value={filters.price_max}
                      // onChange={(e) => handleFilterChange('price_max', e.target.value)}

                      onChange={(e) => {
     const val = Math.max(0, Number(e.target.value));
     handleFilterChange('price_max', val);
  }}
 
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="filter-block mb-4">
                  <h6 className="fw-semibold mb-3">{t('filter.categories') || 'Categories'}</h6>
                  <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    {categories.map((category) => (
                      <div className="form-check mb-2" key={category.id}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`category-${category.id}`}
                          checked={filters.selectedCategories.includes(category.id.toString())}
                          onChange={(e) => handleMultiSelectChange('selectedCategories', category.id.toString(), e.target.checked)}
                        />
                        <label className="form-check-label small" htmlFor={`category-${category.id}`}>
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sub Categories */}
                <div className="filter-block mb-4">
                  <h6 className="fw-semibold mb-3">{t('filter.subCategories') || 'Sub Categories'}</h6>
                  <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    {subCategories.map((subCat) => (
                      <div className="form-check mb-2" key={subCat.id}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`subcategory-${subCat.id}`}
                          checked={filters.selectedSubCategories.includes(subCat.id.toString())}
                          onChange={(e) => handleMultiSelectChange('selectedSubCategories', subCat.id.toString(), e.target.checked)}
                        />
                        <label className="form-check-label small" htmlFor={`subcategory-${subCat.id}`}>
                          {subCat.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div className="filter-block mb-4">
                  <h6 className="fw-semibold mb-3">{t('filter.brands') || 'Brands'}</h6>
                  <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    {brands.map((brand) => (
                      <div className="form-check mb-2" key={brand.id}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`brand-${brand.id}`}
                          checked={filters.selectedBrands.includes(brand.id.toString())}
                          onChange={(e) => handleMultiSelectChange('selectedBrands', brand.id.toString(), e.target.checked)}
                        />
                        <label className="form-check-label small" htmlFor={`brand-${brand.id}`}>
                          {brand.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Apply Filters Button */}
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="btn bg-black text-white w-100"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {t('filter.applying') || 'Applying...'}
                    </>
                  ) : (
                    t('filter.applyFilters') || 'Apply Filters'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className={`${showFilters ? 'd-none d-lg-block col-lg-9' : 'col-lg-9'}`}>
            {/* Active Filters */}
            <div className="card mb-4">
              <div className="card-body py-3">
                <div className="d-flex flex-wrap gap-2">
                  {filters.name && (
                    <span className=" bg-primary p-2 text-white rounded d-flex align-items-center gap-1">
                      Search: "{filters.name}"
                      <X 
                        size={14} 
                        className="cursor-pointer" 
                        onClick={() => removeFilter('name')}
                        style={{ cursor: 'pointer' }}
                      />
                    </span>
                  )}
                  {filters.price_min && (
                    <span className=" bg-success text-white p-2 rounded d-flex align-items-center gap-1">
                      Min: {filters.price_min}
                      <X 
                        size={14} 
                        className="cursor-pointer" 
                        onClick={() => removeFilter('price_min')}
                        style={{ cursor: 'pointer' }}
                      />
                    </span>
                  )}
                  {filters.price_max && (
                    <span className=" bg-success text-white p-2 rounded d-flex align-items-center gap-1">
                      Max: {filters.price_max}
                      <X 
                        size={14} 
                        className="cursor-pointer" 
                        onClick={() => removeFilter('price_max')}
                        style={{ cursor: 'pointer' }}
                      />
                    </span>
                  )}
                  {filters.selectedCategories.length > 0 && (
                    <span className=" bg-info p-2 text-white rounded d-flex align-items-center gap-1">
                      {filters.selectedCategories.length} Categories
                      <X 
                        size={14} 
                        className="cursor-pointer" 
                        onClick={() => removeFilter('selectedCategories')}
                        style={{ cursor: 'pointer' }}
                      />
                    </span>
                  )}
                  {filters.selectedBrands.length > 0 && (
                    <span className=" bg-warning p-2 rounded text-white d-flex align-items-center gap-1">
                      {filters.selectedBrands.length} Brands
                      <X 
                        size={14} 
                        className="cursor-pointer" 
                        onClick={() => removeFilter('selectedBrands')}
                        style={{ cursor: 'pointer' }}
                      />
                    </span>
                  )}
                  {filters.selectedSubCategories.length > 0 && (
                    <span className=" bg-secondary text-white p-2 rounded d-flex align-items-center gap-1">
                      {filters.selectedSubCategories.length} Sub Categories
                      <X 
                        size={14} 
                        className="cursor-pointer" 
                        onClick={() => removeFilter('selectedSubCategories')}
                        style={{ cursor: 'pointer' }}
                      />
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Products Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="h4 mb-0">
                {t('products.title') || 'Products'} ({totalProducts})
              </h2>
              <small className="text-muted">
                {loading ? 
                  ( 'Loading...') : 
                  ( `Showing ${products.length} of ${totalProducts} products`)
                }
              </small>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="row g-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="col-md-6 col-lg-4">
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
                    <div key={item.id} className="col-md-6 col-lg-4">
                      <ProductCard
                        item={item}
                        getProductHaveDiscount={() => {}}
                        getFav={() => {}}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.last_page > 1 && (
                  <nav className="mt-5">
                    <ul className="pagination justify-content-center">
                      <li className={`page-item ${pagination.current_page === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => handlePageChange(pagination.current_page - 1)}
                          disabled={pagination.current_page === 1}
                        >
                          {t('pagination.previous') || 'Previous'}
                        </button>
                      </li>
                      
                      {[...Array(pagination.last_page)].map((_, index) => {
                        const pageNum = index + 1;
                        return (
                          <li key={pageNum} className={`page-item ${pagination.current_page === pageNum ? 'active' : ''}`}>
                            <button 
                              className="page-link"
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </button>
                          </li>
                        );
                      })}
                      
                      <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => handlePageChange(pagination.current_page + 1)}
                          disabled={pagination.current_page === pagination.last_page}
                        >
                          {t('pagination.next') || 'Next'}
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
              </>
            ) : (
              <div className="text-center py-5">
                <div className="mb-4">
                  <div className="bg-light rounded-circle mx-auto d-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px' }}>
                    <Search size={40} className="text-muted" />
                  </div>
                </div>
                <h4 className="text-muted mb-3">{t('products.noProducts') || 'No products found'}</h4>
                <p className="text-muted mb-4">{t('products.adjustFilters') || 'Try adjusting your filters or search terms'}</p>
                <button 
                  onClick={clearFilters}
                  className="btn btn-outline-primary"
                >
                  {t('filter.clearAll') || 'Clear all filters'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AllProducts);