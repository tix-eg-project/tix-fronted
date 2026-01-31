import React, { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Login.css";
import logo from "../../assests/imgs/logo.svg";

const Login = () => {
  const { t, i18n } = useTranslation("global");
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/user/login`,
        formDataToSend,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );

      if (response.data.status === true) {
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("userData", JSON.stringify(response.data.data));

        toast.success(response.data.message || "Login successful!");
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed!");
    } finally {
      setLoading(false);
    }
  }, [formData.email, formData.password, i18n.language, navigate]);

  // Memoized values
  const isFormValid = useMemo(() => 
    formData.email.trim().length > 0 && formData.password.trim().length > 0, 
    [formData.email, formData.password]
  );

  return (
    <div className="login-page" dir={isRTL ? "rtl" : "ltr"}>
      <div className="login-container">
        <img className="login-logo" src={logo} alt="Logo" />
        <h5 className="login-title">{t("sign.login")}</h5>

        <div className="login-subtitle">
          <span>{t("sign.noAccount")}</span>
          <Link to="/register" className="create-account mx-1">
            {t("sign.createAccount")}
          </Link>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t("sign.email")}</label>
            <input
              className="form-input"
              autoComplete="off"
              type="email"
              name="email"
              placeholder={t("sign.email")}
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              dir={isRTL ? "rtl" : "ltr"}
              style={{ textAlign: isRTL ? "right" : "left" }}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t("sign.password")}</label>
            <input
              className="form-input"
              autoComplete="off"
              type="password"
              name="password"
              placeholder={t("sign.password")}
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              dir={isRTL ? "rtl" : "ltr"}
              style={{ textAlign: isRTL ? "right" : "left" }}
              required
            />
          </div>
<div className="d-flex justify-content-between align-items-center mb-3">

          <Link to="/resetpassword" className="forgot-password">
            {t("sign.forgotPassword")}
          </Link>
            <Link style={{fontSize:"14px"}} to="/NewOtp" className="link">
                      {i18n.language=="ar"? "رمز التحقق" :"verification code"} 
                    </Link>
</div>

          <button type="submit" className="login-button" disabled={loading || !isFormValid}>
            {loading ? t("sign.loggingIn") || "Logging in..." : t("sign.login")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default React.memo(Login);
