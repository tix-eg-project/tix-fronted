import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import "./ShopByCategory.css";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { apiRequest } from "../../Redux/Apis/apiRequest";

export default function ShopByCategory() {
  const { t ,i18n} = useTranslation("global");
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState(null);
// let [categories, setCategories] = useState([])
let dispatch = useDispatch()
let {categories} = useSelector(state=>state.api)
////console.log({categories});

  // تحديد الفئة النشطة بناءً على الـ URL الحالي
  useEffect(() => {
    const pathname = location.pathname;
    if (pathname.includes('/category/')) {
      const categoryId = pathname.split('/category/')[1]?.split('?')[0];
      setActiveCategory(categoryId);
    } else {
      setActiveCategory(null);
    }
  }, [location.pathname]);

 
  useEffect(()=>{
    dispatch(apiRequest({
      entity: "categories",
      url: "api/categories",
      method: "GET",
      headers: {
        "Accept-Language": i18n.language,
      }
    }))
  },[ i18n.language])

  return (
    <div className="shop-by-category">
      <div className="container-fluid">
        <div className="category-tabs-container bg-white rounded">
          {categories?.data?.data.map((category, index) => (
            <Link
              key={index}
              to={`/category/${category.id}?name=${encodeURIComponent(category.name)}`}
              className={`category-tab ${activeCategory === category.id.toString() ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id.toString())}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
