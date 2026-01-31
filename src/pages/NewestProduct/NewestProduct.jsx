import React, {
  useEffect,
  useState,
  useCallback,
} from "react";
import { useTranslation } from "react-i18next";
import "./NewestProduct.css";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import ProductCard from "../../component/UI/ProductCard";

const NewestProduct = ({setFavlength}) => {
  const { t, i18n } = useTranslation("global");
  let navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API call function
 const  getNewestProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/product/filter?sort=newest`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
            "Authorization":`Bearer ${localStorage.getItem("token")}`
          },
        }
      );

      if (response.data.status === true) {
        setProducts(response.data.data);
      } else {
        setError("Failed to fetch products");
      }
    } catch (error) {
      ////console.log({ error });
      setError("Error fetching products");
    } finally {
      setLoading(false);
    }
  }, [i18n.language]);

    let GetAllFavourite= async()=>{
    await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/favorites`,{headers:{
         Accept: "application/json",
            "Accept-Language": i18n.language,
             "Authorization":`Bearer ${localStorage.getItem("token")}`
    }}).then(res=>{
      ////console.log(res);
      setFavlength(res.data.data.length)
      
    }).catch(err=>{
      ////console.log(err);
      
    })
  }

  useEffect(() => {
    getNewestProduct();
  }, [getNewestProduct, i18n.language]);

  return (
    <div className="products py-5">
      <div className="container-fluid">
        {/* Section Header */}
        <div className="text-center mb-5">
          <h4 className="mb-4 title" style={{fontSize: '1.4rem !important'}}>
            {i18n.language == "ar" ? "المنتجات المضافة حديثا" : "Newly added products"}
          </h4>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="row g-4">
            {[...Array(8)].map((_, i) => (
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
        ) : error ? (
          <div className="text-center py-5">
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          </div>
        ) : products.length > 0 ? (
          <div className="row g-4">
            {products.map((item) => (
              <div key={item.id} className="col-6 col-xl-3">
                <ProductCard
                  item={item}
                  getProductHaveDiscount={getNewestProduct}
                  getFav={GetAllFavourite}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <div className="mb-4">
              <div className="bg-light rounded-circle mx-auto d-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px' }}>
                <i className="bi bi-box text-muted" style={{ fontSize: '40px' }}></i>
              </div>
            </div>
            <h4 className="text-muted mb-3">{i18n.language == "ar" ? "لا توجد منتجات" : "No products found"}</h4>
            <p className="text-muted">{i18n.language == "ar" ? "حاول مرة أخرى لاحقاً" : "Please try again later"}</p>
          </div>
        )}

        {/* Show More Button */}
        <div className="d-flex justify-content-center align-items-center mt-4">
          <button
            onClick={() => {
              navigate("/all-products");
            }}
            className="btn bg-black text-white px-4 py-2"
            style={{
              transition: "all 0.3s ease",
              borderRadius: "8px",
              fontWeight: "500",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            {i18n.language == "ar" ? "عرض المزيد" : "Show More"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewestProduct;