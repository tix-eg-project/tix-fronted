import React, { useEffect } from 'react';
import "./AboutUS.css";
import PageHead from '../../component/PageHead/PageHead';
import { useTranslation } from 'react-i18next';

import { FaShoppingCart, FaHeadset, FaExchangeAlt, FaCreditCard } from 'react-icons/fa';
import Features from '../../component/Features/Features';
import { useDispatch, useSelector } from 'react-redux';
import { apiRequest } from '../../Redux/Apis/apiRequest';

export default function AboutUS() {
  const { t, i18n } = useTranslation("global");
  let dispatch = useDispatch();
  let {aboutus} = useSelector(state=>state.api)
  ////console.log({aboutus});

    useEffect(() => {
      window.scrollTo(0,0)
    }, []);


  useEffect(()=>{
      dispatch(apiRequest({
          url:"api/about-us",
          method:"GET",
          entity:"aboutus",
          headers:{
            "Accept-Language":i18n.language
          }
        }))
  },[i18n.language])
  

  // قائمة الأيقونات فقط، النصوص تأتي من ملفات الترجمة
  const icons = [
    <FaShoppingCart className="feature-icon" />,
    <FaHeadset className="feature-icon" />,
    <FaExchangeAlt className="feature-icon" />,
    <FaCreditCard className="feature-icon" />
  ];

  const features = t("about.features", { returnObjects: true });

  return (
    <>
      <PageHead header={t("aboutus")} />

      <section className='about-us-section'>
        <div className="container">
          <div className="row">
            <div className="col-lg-6 about-content">
              <h6>{t("aboutus")}</h6>
              <h2>{aboutus?.data?.data[0].title}</h2>
              <p>{aboutus?.data?.data[0].description}</p>
              <p>{t("about.paragraph2")}</p>

              <div className="about-features">
                <p>{t("about.featuresTitle")}</p>
                <ul>
                  {features.map((text, index) => (
                    <li key={index}>
                      {icons[index]}
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-lg-6 about-image">
              <img style={{width:"100%", height:"100%"}} className='' src={aboutus?.data?.data[0]?.image} alt={t("aboutus")} />
            </div>
          </div>
        </div>
      </section>

      {/* <Features/> */}

    </>
  );
}
