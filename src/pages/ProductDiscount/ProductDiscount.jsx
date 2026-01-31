

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../../Redux/Apis/apiRequest';
import { useDispatch, useSelector } from 'react-redux';
import ProductCard from '../../component/UI/ProductCard';
import "./ProductDiscount.css";

const ProductDiscount = () => {
  const { i18n } = useTranslation(); 
  let { productsDiscounts } = useSelector((state) => state.api);
  let dispatch = useDispatch();

  useEffect(() => {
    dispatch(apiRequest({
      url:"api/product/discounted",
      entity:"productsDiscounts",
      method:"get",
      headers:{
       'Accept-Language':i18n.language || localStorage.getItem('language') 
      }
    }));
  }, [dispatch, i18n.language]);

  return (
    <div dir={i18n.language === "ar" ? "rtl" : "ltr"} 
         className="container-fluid" 
         style={{ padding: '2rem 1.5rem'}}>

      {/* Header */}
      <div className="d-flex align-items-center justify-content-center mb-5">
        <h4 className=" fw-bold text-dark text-center mb-0  title" >
          {i18n.language === "ar" ? "منتجات ذات خصم" : "Discounted products"}
        </h4>
      </div>

      {/* Products Grid */}
      <div className="row">
        {productsDiscounts?.data?.data?.map((item) => (
          <div key={item.id} className="col-6 col-lg-3 mb-4">
            <ProductCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductDiscount;
