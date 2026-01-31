import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import "./Createaccount.css";
import logo from "../../assests/imgs/logo.svg";

const Createaccount = () => {
  const { t, i18n } = useTranslation("global");
  const isRTL = i18n.language === "ar";

  return (
    <div className="signup-page" dir={isRTL ? "rtl" : "ltr"}>
      <div className="signup-container">
        <img className="signup-logo" src={logo} alt="Logo" />
        <h5 className="signup-title">{t("sign.createAccount")}</h5>

        <div className="signup-subtitle">
          <span>{t("sign.haveAccount")}</span>
          <Link to="/login" className="login-link mx-1">
            {t("sign.login")}
          </Link>
        </div>

        <form className="signup-form">
          <div className="form-group">
            <label className="form-label">{t("sign.email")}</label>
            <input
              className="form-input"
              autoComplete="off"
              type="email"
              name="email"
              placeholder={t("sign.email")}
              dir={isRTL ? "rtl" : "ltr"}
              style={{ textAlign: isRTL ? "right" : "left" }}
            />
          </div>

          <button type="submit" className="signup-button">
            {t("sign.createAccount")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Createaccount;
