

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Users, MessageSquare, Star } from 'lucide-react';
// import CourseCard from '../../Components/Ui/CourseCard';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../../Redux/Apis/apiRequest';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const OfferBanner = () => {
  const { t, i18n } = useTranslation(); 
  let {offerBanner} = useSelector((state) => state.api);
  let dispatch = useDispatch();
  ////console.log({offerBanner});
 
  useEffect(() => {
    dispatch(apiRequest({
      url:"api/offers",
      entity:"offerBanner",
      method:"get",
      headers:{
        // "Authorization": `${sessionStorage.getItem("token") || localStorage.getItem("token") }`,
       'Accept-Language':i18n.language|| localStorage.getItem('language') 
      }
    }));
  }, [dispatch , i18n.language|| localStorage.getItem('language') ]);

 

  return (
    <div className="container-fluid" style={{maxWidth: '1200px', padding: '2rem 1.5rem', backgroundColor: '#f9f9f9'}}>
      {/* Header */}
      <div className="text-center mb-4">
 

                      <h2 className=" fw-bold text-dark mb-0">{i18n.language=="en" ?  "All Offers " :"كل العروض"}</h2>

     
      </div>

      {/* Offers Grid */}
      <div className="row g-4">
        {offerBanner?.data?.data?.map((item) => (
          <div key={item.id} style={{cursor:"pointer"}} className="col-12 col-sm-6 col-md-4 col-lg-3">
            <Link to={{
          pathname: "/products/offers",
          search: `?id=${item.id}`
        }}>

            <div className="card h-100 border-0 bg-white">
              <div className="card-body text-center" style={{backgroundColor:'#f9f9f9'}}>
                <div className="d-flex flex-column justify-content-center align-items-center">
                  <div 
                    className="rounded-circle mb-3 d-flex align-items-center justify-content-center" 
                    style={{width: '80px', height: '80px', backgroundColor:'#eee', border:'1px solid #eee'}}
                  >
                    {/* You can add an icon or image here */}
                    <span className="fs-2">🏷️</span>
                  </div>
                  <h5 className="card-title mb-2 text-dark">{item.name}</h5>
                  {item.description && (
                    <p className="card-text text-muted small mb-3" style={{backgroundColor:'#fff'}}>{item.description}</p>
                  )}
                  {item.discount && (
                    <div className="badge bg-danger mb-2">
                      {item.discount}% {t("off")}
                    </div>
                  )}
                  {item.price && (
                    <div className="mb-2">
                      {item.originalPrice && (
                        <span className="text-decoration-line-through text-muted me-2">
                          ${item.originalPrice}
                        </span>
                      )}
                      <span className="fw-bold text-success">${item.price}</span>
                    </div>
                  )}
                  {item.validUntil && (
                    <small className="text-muted">
                      {t("validUntil")}: {new Date(item.validUntil).toLocaleDateString()}
                    </small>
                  )}
                </div>
              </div>
              {/* <div className="card-footer bg-transparent border-0">
                <button className="btn bg-black text-white w-100">
                  {i18n.language=="ar" ? "عرض":"oFFer"}
                </button>
              </div> */}
            </div>

        </Link>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {(!offerBanner?.data?.data || offerBanner.data.data.length === 0) && (
        <div className="text-center py-5">
          <div className="mb-3">
            <span className="fs-1">📋</span>
          </div>
          <h4 className="text-muted">{t("noOffersAvailable")}</h4>
          <p className="text-muted">{t("checkBackLater")}</p>
        </div>
      )}
    </div>
  );
};

export default OfferBanner;