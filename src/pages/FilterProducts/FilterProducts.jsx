import React, { useEffect, useState, useCallback, useMemo } from "react";
import FliterPageHead from "../../component/FliterPageHead/FliterPageHead";
import { useTranslation } from "react-i18next";
import "../FilterProducts/FilterProducts.css";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import ProductCard from "../../component/UI/ProductCard";
const FilterProducts = ({ setFavlength }) => {
  const { t, i18n } = useTranslation("global");
  const isRTL = i18n.language === "ar";
  const { categoryKey } = useParams();
  const [searchParams] = useSearchParams();
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1
  });
  const categoryName = searchParams.get("name");
  let [products, setProducts] = useState([]);
  let [subcategories, setSubcategories] = useState([]);
  let [selectedSubcategory, setSelectedSubcategory] = useState(null);
  let [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    sort: "",
    price_min: "",
    price_max: "",
    page: 1
  });
  // Handle filter input changes
  const handleFilterChange = useCallback((field, value) => {
    const newFilters = {
      ...filters,
      [field]: value,
      page: 1
    };
    setFilters(newFilters);
    HandleFilter(1, newFilters);
  }, [filters]);
  // Handle pagination
  const handlePageChange = useCallback((page) => {
    const newFilters = {
      ...filters,
      page: page
    };
    setFilters(newFilters);
    HandleFilter(page, newFilters);
  }, [filters]);
  // Unified Filter API
  const HandleFilter = useCallback(async (page = 1, customFilters = null, subCategoryId = null) => {
    try {
      setLoading(true);
      const currentFilters = customFilters || filters;
      const params = new URLSearchParams();
      params.append("page", page.toString());
      if (currentFilters.name && currentFilters.name.trim())
        params.append("name", currentFilters.name.trim());
      if (currentFilters.sort) params.append("sort", currentFilters.sort);
      if (currentFilters.price_min) params.append("price_min", currentFilters.price_min);
      if (currentFilters.price_max) params.append("price_max", currentFilters.price_max);
      // category or subcategory
      if (subCategoryId) {
        params.append("subcategory", subCategoryId);
      } else {
        params.append("category", categoryKey);
      }
      const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/api/product/filter?${params.toString()}`;
      const response = await axios.get(apiUrl, {
        headers: {
          Accept: "application/json",
          "Accept-Language": i18n.language,
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (response.data.status === true) {
        setProducts(response.data.data);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (error) {
      console.error('Error fetching filtered products:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, categoryKey, i18n.language]);
  // Get subcategories
  let getAllSubCategoriesByCategoryId = async () => {
    try {
      const response = await axios.get(
        `https://admin.tix-eg.com/api/category/${categoryKey}/subcategories`,
        {
          headers: {
            "Accept": "application/json",
            "Accept-Language": i18n.language,
            //  "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      if (response.data.status === true) {
        setSubcategories(response.data.data);
      }
    } catch (error) { 
      ////console.log({ error });
    }
  };
  // Handle subcategory click
  const handleSubcategoryClick = async (subcategoryId) => {
    setSelectedSubcategory(subcategoryId);
    setFilters({
      name: "",
      sort: "",
      price_min: "",
      price_max: "",
      page: 1
    });
    await HandleFilter(1, null, subcategoryId);
  };
  // Handle "All Products" click
  const handleShowAllProducts = async () => {
    setSelectedSubcategory(null);
    setFilters({
      name: "",
      sort: "",
      price_min: "",
      price_max: "",
      page: 1
    });
    await HandleFilter(1);
  };
  // Get Favourites
  let GetAllFavourite = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/favorites`, {
        headers: {
          Accept: "application/json",
          "Accept-Language": i18n.language,
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setFavlength(res.data.data.length);
    } catch (err) {
      ////console.log(err);
    }
  };
  // Pagination UI
  const renderPagination = () => {
    const pages = [];
    const { current_page, last_page } = pagination;
    if (current_page > 1) {
      pages.push(
        <li key="prev" className="page-item">
          <button className="page-link" onClick={() => handlePageChange(current_page - 1)}>
            {t("pagination.previous") || "Previous"}
          </button>
        </li>
      );
    }
    const startPage = Math.max(1, current_page - 2);
    const endPage = Math.min(last_page, current_page + 2);
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li key={i} className={`page-item ${current_page === i ? "active" : ""}`}>
          <button className="page-link" onClick={() => handlePageChange(i)}>
            {i}
          </button>
        </li>
      );
    }
    if (current_page < last_page) {
      pages.push(
        <li key="next" className="page-item">
          <button className="page-link" onClick={() => handlePageChange(current_page + 1)}>
            {t("pagination.next") || "Next"}
          </button>
        </li>
      );
    }
    return pages;
  };
  // Initial Load
  useEffect(() => {
    Promise.all([HandleFilter(1), getAllSubCategoriesByCategoryId()]);
  }, [categoryKey, i18n.language]);
  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="filter-products-page">
      <FliterPageHead services={t("products.newmarket")} flitercategory={categoryName} />
      {/* Subcategories Tabs */}
      <div className="tabs-container">
        <button
          className={`tab${selectedSubcategory === null ? " active" : ""}`}
          onClick={handleShowAllProducts}
        >
          {t("filter.allproducts") || "All Products"}
        </button>
        {subcategories.map((subcategory) => (
          <button
            key={subcategory.id}
            className={`tab${selectedSubcategory === subcategory.id ? " active" : ""}`}
            onClick={() => handleSubcategoryClick(subcategory.id)}
          >
            {subcategory.name}
          </button>
        ))}
      </div>
      <div className="p-5 main-container  ">
        <div className="row gx-4">
          {/* Sidebar Filters */}
          <div className="col-lg-3  ">
            <div style={{ height:"500px"}} className="filters-box ">
              {/* Search */}
              <div dir="ltr" className="filter-block">
                <h6>{t("filter.search") || "Search"}</h6>
                <input
                  type="text"
                  className="form-control"
                  placeholder={t("filter.searchPlaceholder") || "Search products..."}
                  value={filters.name}
                  onChange={(e) => handleFilterChange("name", e.target.value)}
                />
              </div>
              {/* Sort */}
              <div className="filter-block">
                <h6>{t("filter.sortby")}</h6>
                <select
                  className="form-select"
                  value={filters.sort}
                  onChange={(e) => handleFilterChange("sort", e.target.value)}
                >
                  <option value="">{t("sort.default") || "Default"}</option>
                  <option value="price_low">{t("sort.priceLowHigh")}</option>
                  <option value="price_high">{t("sort.priceHighLow")}</option>
                  <option value="name_asc">{t("sort.nameAZ")}</option>
                  <option value="name_desc">{t("sort.nameZA")}</option>
                </select>
              </div>
              {/* Price */}
              <div className="filter-block">
                <h6>{t("filter.price")}</h6>
                <div className="price-range">
                  <input
                    type="number"
                    className="form-control"
                    placeholder={t("filter.from")}
                    min={0}
                    value={filters.price_min}
                    // onChange={(e) => handleFilterChange("price_min", e.target.value)}
                    onChange={(e) => {
    const val = Math.max(0, Number(e.target.value));
    handleFilterChange("price_min", val);
  }}
                  />
                  <span className="range-separator">-</span>
                  <input
                    type="number"
                    min={0}
                    className="form-control"
                    placeholder={t("filter.to")}
                    value={filters.price_max}
                    // onChange={(e) => handleFilterChange("price_max", e.target.value)}
                    onChange={(e) => {
    const val = Math.max(0, Number(e.target.value));
    handleFilterChange("price_max", val);
  }}
                  />
                </div>
              </div>
              {/* Clear Filters */}
              <div className="filter-block">
                <button
                  className="btn bg-black text-white w-100"
                  onClick={() => {
                    const resetFilters = {
                      name: "",
                      sort: "",
                      price_min: "",
                      price_max: "",
                      page: 1
                    };
                    setFilters(resetFilters);
                    if (selectedSubcategory) {
                      HandleFilter(1, resetFilters, selectedSubcategory);
                    } else {
                      HandleFilter(1, resetFilters);
                    }
                  }}
                >
                  {t("filter.clearAll") || "Clear Filters"}
                </button>
              </div>
            </div>
          </div>
          {/* Products */}
          <div className="col-lg-9">
            {loading ? (
              <div className="text-center p-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">{t("loading") || "Loading..."}</p>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products && products.length > 0 ? (
                    products.map((product) => (
                      <ProductCard
                        key={product.id}
                        item={product}
                        getProductHaveDiscount={HandleFilter}
                        getFav={GetAllFavourite}
                      />
                    ))
                  ) : (
                    <div className="no-products text-center p-4">
                      <p>{t("products.no_products") || "No products found"}</p>
                    </div>
                  )}
                </div>
                {pagination.last_page > 1 && (
                  <div className="pagination-container">
                    <nav>
                      <ul className="pagination justify-content-center">
                        {renderPagination()}
                      </ul>
                    </nav>
                    <div className="pagination-info text-center mt-2">
                      <small className="text-muted">
                        {t("pagination.showing")}{" "}
                        {(pagination.current_page - 1) * pagination.per_page + 1} -{" "}
                        {Math.min(pagination.current_page * pagination.per_page, pagination.total)}{" "}
                        {t("pagination.of")} {pagination.total} {t("pagination.results")}
                      </small>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default React.memo(FilterProducts);
