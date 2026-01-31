


import React, { useMemo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "./ProductsServices.css";
import { Link } from "react-router-dom";
import axios from "axios";

const ProductsServices = ({ status = false, ouroffers = false, title }) => {
  const { t, i18n } = useTranslation("global");
  const swiperKey = useMemo(() => `swiper-${i18n.language}`, [i18n.language]);
  const isRTL = i18n.language === "ar";

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
  });

  // Fetch products from API
  const getProducts = async (page = 1) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/products?page=${page}`,
        {
          headers: {
            "Accept-Language": i18n.language,
          },
        }
      );
      if (res.data.status) {
        setProducts(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  useEffect(() => {
    getProducts();
  }, [i18n.language]);

  return (
    <div className="products py-5">
      <div className="container">
        <div className="row">
          <div className="col-xl-5 col-lg-4 col-md-12 col-12">
            <h4 className="mb-4 main-color title">
              {/* <img src="/layout.gif" alt="--" /> */}
               {title}
            </h4>
          </div>
          {!status && (
            <div className="col-xl-7 col-lg-8 col-md-12 col-12 text-end">
              <div
                className={`d-inline-block ${
                  isRTL ? "float-start" : "float-end"
                }`}
              >
                <button className="btn btn-categories">
                  {t("products.allcategories")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container-fluid">
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={20}
          loop={true}
          key={swiperKey}
          dir={isRTL ? "rtl" : "ltr"}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          // pagination={{ clickable: true }}
          breakpoints={{
            0: {
              slidesPerView: 2,
            },
            576: {
              slidesPerView: 2,
            },
            768: {
              slidesPerView: 3,
            },
            992: {
              slidesPerView: 4,
            },
          }}
        >
          {products.map((item) => {
            return (
              <SwiperSlide key={item.id}>
                <div className="product_card  border rounded-4 overflow-hidden position-relative">
                  {item.discount > 0 && (
                    <div
                      className="position-absolute text-white px-2 py-1 small"
                      style={{
                        top: "10px",
                        [isRTL ? "right" : "left"]: "10px",
                        backgroundColor: "#dc3545",
                        borderRadius: "0.375rem",
                        zIndex: 10,
                      }}
                    >
                       {item.discount}%
                    </div>
                  )}
   <Link to={`/productdetails/${item?.id}`}>
                  <img
                    src={
                      item.images.length > 0
                        ? item.images[0]
                        : "/placeholder.png"
                    }
                    alt={item.name}
                    className="img-fluid mb-3 rounded-4"
                  />
   </Link>
                  <div className="p-3">
                    <p className="line-height mb-1">{item.name}</p>
                    <small className="mb-2 d-block main-color fw-bold">
                      {item.brand}
                    </small>

                    <div className="text-sm d-flex justify-content-between align-items-center">
                      <div>
                        {t("products.startingFrom")}
                        {item.discount > 0 ? (
                          <>
                            <span className="mx-1 text-muted text-decoration-line-through">
                              {item.price_before} {t("products.currency")}
                            </span>
                            <span className="fw-bold mx-1 main-color">
                              {item.price_after} {t("products.currency")}
                            </span>
                          </>
                        ) : (
                          <span className="fw-bold mx-1 main-color">
                            {item.price_after} {t("products.currency")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* Pagination Controls */}
      <div className="text-center " style={{ paddingTop: "20px" }}>
        {pagination.current_page > 1 && (
          <button
            className="btn btn-outline-primary  mx-1"
            onClick={() => getProducts(pagination.current_page - 1)}
          >
            {t("pagination.previous")}
          </button>
        )}
        {pagination.current_page < pagination.last_page && (
          <button
            className="btn btn-outline-primary mx-1"
            onClick={() => getProducts(pagination.current_page + 1)}
          >
            {t("pagination.next")}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductsServices;
