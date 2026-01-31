


import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import {
  FaShoppingCart,
  FaTags,
  FaMinus,
  FaPlus,
} from "react-icons/fa";
import { IoIosHeart, IoIosHeartEmpty } from "react-icons/io";
import { toast } from "react-toastify";
import axios from "axios";
import image from "../../assests/imgs/Frame 1410103977.svg"

import latop from "../../assests/imgs/22.svg";
import ProductsServices from "../../component/ProductsServices/ProductsServices";
import ProductDetalisPageHead from "../../component/ProductDetalisPageHead/ProductDetalisPageHead";
import ProductSection from "../ProductDIscountSection/ProductDIscountSection";
import NewestProduct from "../NewestProduct/NewestProduct";
import { apiRequest } from "../../Redux/Apis/apiRequest";
import { useDispatch } from "react-redux";

export default function ProductsDetalis({ setFavlength }) {
  const { t, i18n } = useTranslation("global");
  let { productId } = useParams();
let dispatch = useDispatch();
  let [loading, setLoading] = useState(false);
  let [product, setProduct] = useState({});
  let [favorites, setFavorites] = useState([]);
  let [selectedColor, setSelectedColor] = useState(null);
  let [selectedItem, setSelectedItem] = useState(null);
  let [quantity, setQuantity] = useState(1);
  let [addingToCart, setAddingToCart] = useState(false);
////console.log({product});

    useEffect(() => {
    window.scrollTo(0,0)
  }, []);

  let getProductDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/products/${productId}`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.status === true) {
        setProduct(response.data.data);
        if (response.data.data.groups?.length > 0) {
          setSelectedColor(response.data.data.groups[0]);
          setSelectedItem(response.data.data.groups[0].items[0]);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error loading product");
    } finally {
      setLoading(false);
    }
  };

  let GetAllFavourite = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/favorites`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setFavlength(res.data.data.length);
      setFavorites(res.data.data);
    } catch (err) {
      ////console.log(err);
    }
  };

  const toggleFavorite = async (id) => {
    ////console.log({id});
    
    try {
      const formData = new FormData();
      formData.append("product_id", id);

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/favorites/toggle`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(response.data.message || "Updated favorites");
      GetAllFavourite();
      getProductDetails();
    } catch (error) {
      toast.error("Error updating favorites");
    }
  };

  ////console.log({selectedItem});
  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      const formData = new FormData();
      ////console.log({selectedItem});
      
      if (selectedItem?.id) {
        formData.append("product_variant_item_id", selectedItem.id);
      }
      formData.append("product_id", product.id);
      formData.append("quantity", quantity);

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/cart/add`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(response.data.message);

       dispatch(apiRequest({
              url: "api/cart",
              entity: "carts",
              headers: {
                "Accept-Language": i18n.language,
                "Authorization": `Bearer ${localStorage.getItem("token")}`
              }
            }));

      if (window.triggerCartUpdate) {
        window.triggerCartUpdate();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (action) => {
    if (action === "increase") {
      setQuantity((prev) => prev + 1);
    } else if (action === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  useEffect(() => {
    getProductDetails();
    GetAllFavourite();
  }, [i18n.language, productId]);

  const getLocalizedDescription = (longDescription) => {
    if (typeof longDescription === "object" && longDescription !== null) {
      return (
        longDescription[i18n.language] ||
        longDescription.ar ||
        longDescription.en ||
        ""
      );
    }
    return longDescription || "";
  };

  const getDiscountPercentage = (priceBefore, priceAfter, discount) => {
    if (priceBefore && priceAfter && priceBefore !== priceAfter) {
      return Math.round(((priceBefore - priceAfter) / priceBefore) * 100);
    }
    return discount || 0;
  };

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-dark" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : [latop, image];

  const currentPrice = selectedItem?.price_after || product.price_after;
  const originalPrice = selectedItem?.price_before || product.price_before;
  const discountPercentage = getDiscountPercentage(
    originalPrice,
    currentPrice,
    product.discount
  );

  return (
    <>
      <ProductDetalisPageHead
        services={t("products.newmarket")}
        flitercategory={product.category || ""}
        Products={product.name || ""}
      />

      <section
        className="container"
        style={{ backgroundColor: "#fff", color: "#000" }}
      >
        <div className="row g-4">
          {/* Product Image - Left Half */}
          <div className="col-lg-6 col-md-12">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={10}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              className="product-swiper"
            >
              {productImages.map((img, index) => (
                <SwiperSlide key={index}>
                 
                  
                  <div className="swiper-image-container p-3 rounded ">
                    <img
                      src={typeof img === "string" ? img : img.url || latop}
                      alt={`${product.name} ${index + 1}`}
                      className="w-100"
                      style={{
                        height: "400px",
                        objectFit: "cover",
                        borderRadius: "12px",
                      }}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>



<style jsx ={"true"}>{`
  .product-swiper {
    --swiper-theme-color: #000;
    --swiper-navigation-size: 24px;

  }
  
  .product-swiper .swiper-slide {
    transition: transform 0.3s ease;
  }
  
  /* Custom pagination styles */
  .custom-pagination .swiper-pagination-bullet {
    width: 12px;
    height: 12px;
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(8px);
    border: 2px solid rgba(255, 255, 255, 0.3);
    opacity: 1;
    transition: all 0.3s ease;
    margin: 0 4px;
  }
  
  .custom-pagination .swiper-pagination-bullet-active {
    background: rgba(255, 255, 255, 0.8);
    border-color: rgba(255, 255, 255, 0.8);
    transform: scale(1.2);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  .custom-pagination .swiper-pagination-bullet:hover {
    background: rgba(255, 255, 255, 0.8);
    transform: scale(1.1);
  }
  
  /* Navigation button hover effects */
  .custom-swiper-button-prev,
  .custom-swiper-button-next {
    opacity: 0.8;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .custom-swiper-button-prev:hover,
  .custom-swiper-button-next:hover {
    opacity: 1;
    transform: translateY(-50%) scale(1.1);
  }
  
  .custom-swiper-button-prev:active,
  .custom-swiper-button-next:active {
    transform: translateY(-50%) scale(0.95);
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .custom-swiper-button-prev,
    .custom-swiper-button-next {
      width: 48px;
      height: 48px;
    }
    
    .custom-swiper-button-prev svg,
    .custom-swiper-button-next svg {
      width: 20px;
      height: 20px;
    }
    
    .custom-pagination .swiper-pagination-bullet {
      width: 10px;
      height: 10px;
      margin: 0 3px;
    }
    
    .swiper-image-container img {
      height: 300px !important;
      object-fit: contain !important;
    }
  }
  
  @media (max-width: 576px) {
    .swiper-image-container img {
      height: 250px !important;
      object-fit: contain !important;
    }
  }
  
  /* Add subtle animation on slide change */
  .product-swiper .swiper-slide-active .swiper-image-container img {
    animation: slideInScale 0.6s ease-out;
    object-fit: contain !important;
  }
  
  @keyframes slideInScale {
    from {
      transform: scale(1.05);
      opacity: 0.8;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
`}</style>
          </div>

            <style >{`
        .attribute-btn {
          border: 2px solid #dee2e6;
          background: white;
          padding: 8px 12px;
          margin: 4px;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .attribute-btn:hover {
          border-color: #6c757d;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .attribute-btn.active {
          border-color: #212529;
          background-color: #f8f9fa;
          box-shadow: 0 4px 12px rgba(33, 37, 41, 0.2);
        }
        
        .attr-item {
          display: block;
          text-align: center;
          margin-bottom: 4px;
        }
        
        .attr-key {
          font-size: 1rem;
          color: #000;
           display: block;
        }
        
        .attr-value {
          font-weight: 600;
          color: #212529;
           display: block;
           font-size: 0.7rem;
        }
        
        .color-circle {
          width: 40px;
          height: 40px;
          border: 2px solid #6c757d;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .color-circle.active {
          border-color: #212529;
          border-width: 3px;
          transform: scale(1.1);
        }
        
        .color-circle:hover {
          transform: scale(1.05);
        }
        
        .quantity-control {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .quantity-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>

          {/* Product Details - Right Half */}
          <div className="col-lg-6 col-md-12 d-flex flex-column">
            <h1 >{product.name}</h1>
            <div className="m-2 d-flex justify-content-between align-items-center">
              <span className="text-muted bg-light p-2 rounded-pill ">ID: #{product.id}</span>{" "}
              {product.brand && <span className="mx-2 bg-secondary p-2 text-white rounded-3">{product.brand}</span>}
              {product.category && (
                <span
                  className="text-white p-2 bg-dark ms-2"
                  style={{ borderRadius: "10px" }}
                >
                  <FaTags /> {product.category}
                </span>
              )}
            </div>

            {discountPercentage > 0 && (
              <div style={{ borderRadius: "10px", textAlign: "end" , marginTop:"10px"}}>
                { i18n.language === "ar" ? " خصم : " : "Discount :" }

                <span
                  className="text-white  p-2  bg-danger mb-3 ms-2"
                  style={{ borderRadius: "10px", textAlign: "center" }}
                >
                  {discountPercentage}%
                </span>
              </div>
            )}

            <div className="my-3">
              {originalPrice && currentPrice && originalPrice !== currentPrice ? (
                <>
                  <del className="text-muted me-2">
                  {////console.log({originalPrice, currentPrice})
                  }
                    {originalPrice} {t("currency", { defaultValue: "EGP" })}
                  </del>
                  <h3>
                    {currentPrice} {t("currency", { defaultValue: "EGP" })}
                  </h3>
                </>
              ) : (
                <h3>
                  {currentPrice} {t("currency", { defaultValue: "EGP" })}
                </h3>
              )}
            </div>
                    {product?.vendor?.store_name &&(
            <p className="" >{i18n.language=="ar"? "الشركة" :"Company"} :<Link 
            style={{color:"#000" , textDecoration: "none"}}
            
            to={{
    pathname: "/Banner/offers",
    search: `?BannerId=${product.vendor.id}`
  }}
  
            className="mx-1  p-2 text-decoration-underline rounded-pill text-decoration-none">{product?.vendor?.store_name}</Link> </p>

          )}

            {/* Variants */}
            {product.groups && product.groups.length > 0 && (
              <div className="mb-3">
                {product.groups.length > 1 &&(

                <h5>{ i18n.language === "ar" ? "اختر اللون" : "Select  color " }</h5>
                )}
                {/* <div className="d-flex gap-2 mb-2">
                  {product.groups.map((group, idx) => (
                    <button
                      key={idx}
                      className={`p-2 border  rounded-circle ${
                        selectedColor?.value === group.value
                          ? "border-dark"
                          : "border-secondary"
                      }`}
                      style={{ backgroundColor: group.meta?.code , width: "40px", height: "40px" }}
                      onClick={() => {
                        setSelectedColor(group);
                        setSelectedItem(group.items[0]);
                      }}
                    />
                  ))}
                </div> */}
<div className="d-flex flex-row flex-nowrap gap-2 my-2">
  {product.groups.map((group, idx) => (
    <button
      key={idx}
      className={`p-2 border rounded-circle ${
        selectedColor?.value === group.value
          ? "border-dark"
          : "border-secondary"
      }`}
      style={{
        backgroundColor: group.meta?.code,
        width: "30px",
        height: "30px",
      }}
      onClick={() => {
        setSelectedColor(group);
        setSelectedItem(group.items[0]);
      }}
    />
  ))}
</div>

             
                {selectedColor && (
                  <div className="d-flex  gap-2">
  {selectedColor.items.map((item) => (
    <button
      key={item.id}
      className={`btn attribute-btn ${
        selectedItem?.id === item.id ? "active" : ""
      }`}
      onClick={() => setSelectedItem(item)}
    >
      {Object.entries(item.attrs).map(([k, v]) => (
        <div key={k} className="attr-item" >
          <span className="attr-key" >{k}</span>
          
          <span className="attr-value">{v}</span>
        </div>
      ))}
    </button>
  ))}
</div>

                )}
              </div>
            )}
  
            {/* Quantity */}
            <div className="d-flex align-items-center my-3">
              <button
                className="btn btn-outline-dark"
                onClick={() => handleQuantityChange("decrease")}
                disabled={quantity <= 1}
              >
                <FaMinus />
              </button>
              <span className="mx-3">{quantity}</span>
              <button
                className="btn btn-outline-dark"
                onClick={() => handleQuantityChange("increase")}
              >
                <FaPlus />
              </button>
            </div>

            {/* Buttons */}
            <div className="d-flex flex-wrap gap-2 mb-3">
              <button
                onClick={() => toggleFavorite(product.id)}
                className="btn btn-outline-dark flex-fill"
              >
                {product.is_fav ? <IoIosHeart /> : <IoIosHeartEmpty />}{" "}
                <span className="d-none d-sm-inline">{t("productDetails.addToFavorites")}</span>
                <span className="d-sm-none">{t("productDetails.fav")}</span>
              </button>
            </div>

            <button
              className="btn btn-dark w-100"
              onClick={handleAddToCart}
              disabled={addingToCart}
            >
              <FaShoppingCart className="me-2" />
              {addingToCart
                ? i18n.language=="ar"? "جاري الاضافة الى السلة":"Adding to Cart..."
                : t("productDetails.addToCart")}
            </button>

            {/* Description */}
            <div className="mt-4">
              <h4>{t("productDetails.description")}</h4>
              <p>{getLocalizedDescription(product.long_description)}</p>
            </div>

          </div>
        </div>
      </section>

      <NewestProduct setFavlength={setFavlength} />
      {/* <ProductSection setFavlength={setFavlength} /> */}
      <ProductsServices title={t("products.similarproduct")} status={true} />
    </>
  );
}
