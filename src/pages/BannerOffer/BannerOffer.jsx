import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import Marquee from "react-fast-marquee";
import { apiRequest } from "../../Redux/Apis/apiRequest";

export default function OffersBanner() {
  const { t, i18n } = useTranslation(); 
  const { offerBanner } = useSelector((state) => state.api);
  const dispatch = useDispatch();
  const [isPaused, setIsPaused] = useState(false);
  
  ////console.log({offerBanner});
 
  useEffect(() => {
    dispatch(apiRequest({
      url: "api/offers",
      entity: "offerBanner",
      method: "get",
      headers: {
        // "Authorization": `${sessionStorage.getItem("token") || localStorage.getItem("token")}`,
        'Accept-Language': i18n.language || localStorage.getItem('language') 
      }
    }));
  }, [dispatch, i18n.language || localStorage.getItem('language')]);

  // Don't render if no offers
  if (!offerBanner?.data?.data?.length) {
    return null;
  }

  // If only one offer and it's short, just display it statically
  if (offerBanner.data.data.length === 1 && offerBanner.data.data[0].name.length < 50) {
    return (
      <div className="bg-dark text-white py-1 text-center">
        <h5 className="m-0" style={{fontSize: "15px"}}>
          {offerBanner.data.data[0].name}
        </h5>
      </div>
    );
  }

  return (
    <div 
      className="bg-dark text-white py-1"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Marquee
        speed={40} // Smooth speed
        gradient={true} // Subtle gradient fade at edges
        gradientColor="rgb(33, 37, 41)" // Match bg-dark color
        gradientWidth={20} // Small gradient width
        pauseOnHover={true}
        pauseOnClick={true}
        direction="left"
        loop={0} // Infinite loop
        play={!isPaused} // Control play state
      >
        {offerBanner.data.data.map((offer, index) => (
          <div
            key={offer.id || index}
            className="d-flex align-items-center"
            style={{ marginRight: '60px' }} // Space between offers
          >
            <span className="text-warning me-2">🎉</span> {/* Optional emoji */}
            <h5 className="m-0 text-nowrap" style={{fontSize: "15px"}}>
              {offer.name}
            </h5>
          </div>
        ))}
      
      </Marquee>
    </div>
  );
}