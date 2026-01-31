import React, { useMemo, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { useTranslation } from "react-i18next";
import axios from "axios";
import "swiper/css";
import "swiper/css/pagination";
import "./Ads.css";
import { Link } from "react-router-dom";

const Ads = () => {
  const { i18n } = useTranslation();
  const swiperKey = useMemo(() => `swiper-${i18n.language}`, [i18n.language]);
  const isRTL = i18n.language === "ar";

  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdvertisements();
  }, [i18n.language]);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/banners`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );
////console.log({response:response.data.data });

      if (response.data.status) {
        setAds(response.data.data || []);
      } else {
        setError(response.data.message || "Failed to fetch advertisements");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching advertisements");
      console.error("Error fetching advertisements:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ads py-5">
        <div className="container">
          <div className="ads-loading">
            <div className="spinner-border text-dark" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ads py-5">
        <div className="container">
          <div className="ads-error">
            <p className="text-danger">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!ads || ads.length === 0) {
    return (
      <div className="ads py-5">
        <div className="container">
          <div className="ads-empty">
            <p className="text-muted">No advertisements available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ads py-5">
      <div className="container">
        <Swiper
          modules={[Pagination, Autoplay]}
          slidesPerView={1}
          spaceBetween={20}
          key={swiperKey}
          dir={isRTL ? "rtl" : "ltr"}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          loop={true}
          pagination={{ clickable: true }}
        >
          {ads.map((ad) => (
            <SwiperSlide key={ad.id}>
             <Link to={{
          pathname: "/Banner/offers",
          search: `?BannerId=${ad.vendor_id}`
        }}>
              <img
                src={ad.image}
                alt={`Advertisement ${ad.id}`}
                className="w-100 rounded shadow-sm"
                style={{ maxHeight: "350px", objectFit: "fill" }}
                />
                </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default Ads;




