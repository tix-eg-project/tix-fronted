import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FaLinkedin, FaBehance, FaFacebook, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import logo from "../assests/imgs/logo.svg";
import { useDispatch, useSelector } from "react-redux";
import { apiRequest } from "../Redux/Apis/apiRequest";

const Footer = () => {
  const { t , i18n } = useTranslation("global");
   const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
   let {social} =useSelector(state=>state.api)
   let dispatch= useDispatch()


   useEffect(()=>{
    dispatch(apiRequest({url:"api/social-links" , entity:"social",header:{
      "Accept-Language":i18n.language
    } }))
   },[])
  useEffect(() => {
  const updateTheme = () => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
  };

  window.addEventListener("storage", updateTheme);

  return () => {
    window.removeEventListener("storage", updateTheme);
  };
}, []);


  return (
    <div className="footer pt-5 pb-2">
      <div className="container">
        <div className="row">
          <div className="col-xl-3 col-lg-3 col-md-6">
            <div className="logo">
              <Link className="text-white">
              <img src={logo} style={{width: "50px"}} alt="logo" />
              </Link>
            </div>
            <p className="line-height">{t("footer.aboutPlatform")}</p>
            <div className="flex_contact d-flex my-2">
              <div className="d-block">
                <i className="bi bi-chat-text-fill"></i>
              </div>
              <div className="mx-2 d-block">
                <span className="d-block">{t("footer.support")}</span>
                <small className="d-block text-sm">info@gmail.com</small>
              </div>
            </div>
            <div className="flex_contact d-flex my-2">
              <div className="d-block">
                <i className="bi bi-telephone-fill"></i>
              </div>
              <div className="mx-2 d-block">
                <span className="d-block">{t("footer.contact")}</span>
                <small className="d-block text-sm">755. 002. 3005. 905</small>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-lg-3 col-md-6">
            <div className="links">
              <b className="d-block">{t("footer.quickLinks")}</b>
              <ul className="list-unstyled p-0">
                <li className="mb-2">
                  <Link to={"/"}>{t("footer.home")}</Link>
                </li>
                
                <li className="mb-2">
                  <Link  to={"/contactus"}>{i18n.language=="ar"? "تواصل معنا":"Contact Us"}</Link>
                </li>
                <li className="mb-2">
                  <Link to={"/aboutus"}>{t("footer.aboutUs")}</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-xl-3 col-lg-3 col-md-6">
            <div className="links">
              <b className="d-block">{t("footer.myAccount")}</b>
              <ul className="list-unstyled p-0">
                <li className="mb-2">
                  <Link to={"/terms"}>{t("footer.terms")}</Link>
                </li>
                <li className="mb-2">
                  <Link to={"/policy"}>{t("footer.privacy")}</Link>
                </li>
                <li className="mb-2">
                  <Link to={"/return-policy"}>
                    {i18n.language === "ar" ? "سياسة الاسترجاع" : "Return Policy"}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-xl-3 col-lg-3 col-md-6">
            <div className="links">
              <b className="d-block">{t("footer.socialMedia")}</b>
              <ul className="list-unstyled p-0">
                {social?.data?.data?.map((ele , index)=>(

                <li className="mb-2" key={index}>
                  <Link target="_blank" to={ele.url}>
                    {/* <FaXTwitter className="me-2 mx-2" /> */}
                    {ele.platform}
                  </Link>
                </li>
                ))}
           
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="copyright py-2 text-sm text-center">
        <span>
          &copy; {new Date().getFullYear()} {t("footer.copyright")}
        </span>{" "}
        <a
          href="https://brmja.tech/"
          style={{ color: "orange" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("footer.poweredBy")}
        </a>
      </div>
    </div>
  );
};

export default Footer;
