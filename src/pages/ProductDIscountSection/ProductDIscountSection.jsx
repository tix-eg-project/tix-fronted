

import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "./ProductDiscountSection.css";
import { Link, useNavigate } from "react-router-dom";
import house from "../../assests/imgs/house.jpg";
import house1 from "../../assests/imgs/image 6.svg";
import axios from "axios";
import ProductCard from "../../component/UI/ProductCard";

export const ProductImageGallery = ({ images, productName }) => {
 
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef(null);

  // Use house as fallback if no images
  const imageList = useMemo(
    () => (images && images.length > 0 ? images : [house, house1]),
    [images]
  );

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) =>
      prev === imageList.length - 1 ? 0 : prev + 1
    );
  }, [imageList.length]);

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? imageList.length - 1 : prev - 1
    );
  }, [imageList.length]);

  const goToImage = useCallback((index) => {
    setCurrentImageIndex(index);
  }, []);

  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying((prev) => !prev);
  }, []);

  // Autoplay functionality with proper cleanup
  useEffect(() => {
    if (isAutoPlaying && !isHovered && imageList.length > 1) {
      intervalRef.current = setInterval(nextImage, 3000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAutoPlaying, isHovered, imageList.length, nextImage]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <div
      className="product-image-gallery position-relative"
      style={{ height: "200px" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={imageList[currentImageIndex]}
        alt={productName || "Product"}
        className="img-fluid w-100 h-100"
        style={{
          objectFit: "cover",
          transition: "opacity 0.3s ease-in-out",
        }}
        onError={(e) => {
          e.target.src = house;
        }}
      />

      {imageList.length > 1 && (
        <>
          {/* Navigation buttons - show on hover */}
          {isHovered && (
            <>
              <button
                className="btn btn-sm btn-light position-absolute top-50 start-0 translate-middle-y ms-2"
                onClick={prevImage}
                style={{
                  zIndex: 3,
                  opacity: 0.8,
                  transition: "opacity 0.2s ease",
                }}
                onMouseEnter={(e) => (e.target.style.opacity = "1")}
                onMouseLeave={(e) => (e.target.style.opacity = "0.8")}
              >
                <i className="bi bi-chevron-left"></i>
              </button>

              <button
                className="btn btn-sm btn-light position-absolute top-50 end-0 translate-middle-y me-2"
                onClick={nextImage}
                style={{
                  zIndex: 3,
                  opacity: 0.8,
                  transition: "opacity 0.2s ease",
                }}
                onMouseEnter={(e) => (e.target.style.opacity = "1")}
                onMouseLeave={(e) => (e.target.style.opacity = "0.8")}
              >
                <i className="bi bi-chevron-right"></i>
              </button>

              {/* Autoplay toggle button */}
              <button
                className="btn btn-sm btn-dark position-absolute top-0 end-0 m-2"
                onClick={toggleAutoPlay}
                style={{
                  zIndex: 3,
                  opacity: 0.7,
                  fontSize: "12px",
                }}
                title={isAutoPlaying ? "Pause autoplay" : "Start autoplay"}
              >
                <i
                  className={`bi ${
                    isAutoPlaying ? "bi-pause-fill" : "bi-play-fill"
                  }`}
                ></i>
              </button>
            </>
          )}

          {/* Enhanced pagination dots */}
          <div className="position-absolute bottom-0 start-50 translate-middle-x mb-2 d-flex gap-1">
            {imageList.map((_, index) => (
              <button
                key={index}
                className={`border-0 rounded-circle ${
                  index === currentImageIndex ? "bg-black" : "bg-light"
                }`}
                style={{
                  width: "10px",
                  height: "10px",
                  cursor: "pointer",
                  opacity: index === currentImageIndex ? "1" : "0.6",
                  transition: "all 0.3s ease",
                  transform:
                    index === currentImageIndex ? "scale(1.2)" : "scale(1)",
                }}
                onClick={() => goToImage(index)}
                onMouseEnter={(e) => {
                  if (index !== currentImageIndex) {
                    e.target.style.opacity = "0.8";
                    e.target.style.transform = "scale(1.1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (index !== currentImageIndex) {
                    e.target.style.opacity = "0.6";
                    e.target.style.transform = "scale(1)";
                  }
                }}
              />
            ))}
          </div>

          {/* Progress bar for autoplay */}
          {isAutoPlaying && !isHovered && (
            <div
              className="position-absolute top-0 start-0 bg-black"
              style={{
                height: "2px",
                width: "100%",
                zIndex: 2,
                animation: "progressBar 3s linear infinite",
              }}
            />
          )}

          {/* Image counter */}
          <div
            className="position-absolute top-0 start-0 m-2 bg-dark text-white px-2 py-1 rounded"
            style={{
              fontSize: "12px",
              opacity: isHovered ? 0.8 : 0,
              transition: "opacity 0.3s ease",
              zIndex: 2,
            }}
          >
            {currentImageIndex + 1} / {imageList.length}
          </div>
        </>
      )}

      <style jsx={"true"}>{`
        @keyframes progressBar {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

const ProductSection = ({setFavlength}) => {
  const { t, i18n } = useTranslation("global");
  const swiperKey = useMemo(() => `swiper-${i18n.language}`, [i18n.language]);
  const isRTL = i18n.language === "ar";
  let navigate = useNavigate();
  const [discountProduct, setDiscountProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refs for navigation buttons and swiper instance
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);
  const swiperRef = useRef(null);

  // API call function
 const  getProductHaveDiscount = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/product/discounted`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
            "Authorization":`Bearer ${localStorage.getItem("token")}`
          },
        }
      );

      if (response.data.status === true) {
        setDiscountProduct(response.data.data);
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


 

  // Handle Swiper initialization and navigation setup
  const handleSwiperInit = useCallback((swiper) => {
    swiperRef.current = swiper;

    // Ensure navigation buttons are properly assigned
    if (navigationPrevRef.current && navigationNextRef.current) {
      swiper.params.navigation.prevEl = navigationPrevRef.current;
      swiper.params.navigation.nextEl = navigationNextRef.current;
      swiper.navigation.init();
      swiper.navigation?.update();
    }
  }, []);

  // Manual navigation handlers as fallback
  const handlePrevClick = useCallback(() => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  }, []);

  const handleNextClick = useCallback(() => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  }, []);

  useEffect(() => {
    getProductHaveDiscount();
  }, [getProductHaveDiscount, i18n.language]);

  // Update navigation after swiper key changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (swiperRef.current) {
        swiperRef.current.navigation?.update();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [swiperKey]);

  return (
    <div className="products py-5 position-relative">
      <div className="container">
        <div className="row justify-content-between align-items-center">
          <div className="col-xl-12 col-lg-12 col-md-12 col-12 ">
            <h4 className="mb-4 main-color text-center w-full title d-flex justify-content-center align-items-center">
              <img src="/layout.gif" alt="--" />
              {i18n.language == "ar" ? "عروض علي المنتجات" : "Products Offers"}
            </h4>
          </div>
        </div>
      </div>

      {/* Navigation buttons for the slider with fallback click handlers */}
      <button
        ref={navigationPrevRef}
        className="btn bg-black text-white position-absolute top-50 start-0 translate-middle-y z-3 ms-4 d-none d-md-block"
        style={{
          opacity: 0.8,
          transition: "opacity 0.2s ease",
        }}
        onClick={handlePrevClick}
        onMouseEnter={(e) => (e.target.style.opacity = "1")}
        onMouseLeave={(e) => (e.target.style.opacity = "0.8")}
      >
        <i
          className={`text-sm bi ${isRTL ? "bi-arrow-left" : "bi-arrow-left"}`}
        />
      </button>

      <button
        ref={navigationNextRef}
        className="btn bg-black text-white position-absolute top-50 end-0 translate-middle-y z-3 me-4 d-none d-md-block"
        style={{
          opacity: 0.8,
          transition: "opacity 0.2s ease",
        }}
        onClick={handleNextClick}
        onMouseEnter={(e) => (e.target.style.opacity = "1")}
        onMouseLeave={(e) => (e.target.style.opacity = "0.8")}
      >
        <i
          className={`text-sm bi ${
            isRTL ? "bi-arrow-right" : "bi-arrow-right"
          }`}
        />
      </button>

      <div className="mx-auto sliderWidth">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-black" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-black text-center" role="alert">
            {error}
          </div>
        ) : (
          <Swiper
            modules={[Autoplay, Navigation]}
            spaceBetween={20}
            loop={discountProduct.length > 4}
            key={swiperKey}
            dir={isRTL ? "rtl" : "ltr"}
            className="white-swiper"
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            navigation={{
              prevEl: navigationPrevRef.current,
              nextEl: navigationNextRef.current,
            }}
            onInit={handleSwiperInit}
            onSwiper={handleSwiperInit}
            pagination={{ clickable: true }}
            breakpoints={{
              0: { slidesPerView: 1 },
              576: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              992: { slidesPerView: 4 },
            }}
            watchOverflow={true}
            observer={true}
            observeParents={true}
          >
            {discountProduct.map((item, index) => (
              <SwiperSlide  key={`${item.id || index}-${swiperKey}`}>
                <ProductCard  item={item} getProductHaveDiscount={getProductHaveDiscount} getFav={ GetAllFavourite} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      <div className="d-flex justify-content-center align-items-center">
        <button
          onClick={() => {
            navigate("/products/offers");
          }}
          className="btn bg-black text-white mt-3 px-4 py-2"
          style={{
            transition: "all 0.3s ease",
            borderRadius: "8px",
            fontWeight: "500",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 4px 12px rgba(220, 53, 69, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "none";
          }}
        >
          Show More
        </button>
      </div>
    </div>
  );
};

export default ProductSection;
