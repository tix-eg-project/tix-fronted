import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import "./ResetPassword.css";
import logo from "../../assests/imgs/logo.svg";


const validateEmail = (email) => {

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email.trim());
};

const ResetPassword = () => {
  const { t, i18n } = useTranslation("global");
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();


    if (!email.trim()) {
      setError(i18n.language === "ar" ? "البريد الإلكتروني مطلوب" : "Email is required");
      return;
    } else if (!validateEmail(email)) {
      setError(i18n.language === "ar" ? "البريد الإلكتروني غير صحيح" : "Invalid email format");
      return;
    }

    setError(""); // Clear error if validation passes

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/user/forget-password`,
        { email }
      );

      toast.success(res.data.message || t("sign.emailSent"));
      localStorage.setItem("resetEmail", email);
      navigate("/otpforgetpassword");
    } catch (err) {
      toast.error(err.response?.data?.message || t("sign.errorOccurred"));
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) {
      setError(""); // Clear error when user starts typing
    }
  };

  return (
    <div className="reset-password-page" dir={isRTL ? "rtl" : "ltr"}>
      <div className="reset-password-container">
        <img className="reset-password-logo" src={logo} alt="Logo" />
        <h5 className="reset-password-title">{t("sign.resetPassword")}</h5>

        <div className="reset-password-subtitle">
          {t("sign.weWillHelpYouReset")}
        </div>

        <form className="reset-password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t("sign.email")}</label>
            <input
              className={`form-input ${error ? 'error' : ''}`}
              autoComplete="off"
              type="email"
              name="email"
              placeholder={t("sign.email")}
              value={email}
              onChange={handleEmailChange}
              dir={isRTL ? "rtl" : "ltr"}
              style={{ textAlign: isRTL ? "right" : "left" }}
              required
            />
            {error && <span className="error-message">{error}</span>}
          </div>

          <Link to="/login" className="remember-password-link">
            {t("sign.rememberPassword")}
          </Link>

          <button type="submit" className="reset-password-button">
            {t("sign.reset")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
