import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Changepassword.css";
import logo from "../../assests/imgs/logo.svg";


const validatePassword = (password) => {

  const passwordRegex = /^[a-zA-Z0-9\u0600-\u06FF]{8,}$/;
  return passwordRegex.test(password);
};

const ChangePassword = () => {
  const { t, i18n } = useTranslation("global");
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = localStorage.getItem("resetEmail"); // الإيميل اللي مخزنينه
    if (!email) {
      toast.error(t("sign.emailMissing"));
      return navigate("/resetpassword");
    }


    const validationErrors = {};

    if (!password.trim()) {
      validationErrors.password = i18n.language === "ar" ? "كلمة المرور مطلوبة" : "Password is required";
    } else if (!validatePassword(password)) {
      validationErrors.password = i18n.language === "ar" 
        ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل (أرقام أو حروف)" 
        : "Password must be at least 8 characters (letters or numbers)";
    }

    if (!confirmPassword.trim()) {
      validationErrors.confirmPassword = i18n.language === "ar" ? "تأكيد كلمة المرور مطلوب" : "Password confirmation is required";
    } else if (password !== confirmPassword) {
      validationErrors.confirmPassword = i18n.language === "ar" ? "كلمة المرور غير متطابقة" : "Passwords do not match";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error(i18n.language === "ar" ? "يرجى تصحيح الأخطاء في النموذج" : "Please fix the errors in the form");
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/user/reset-password`,
        {
          email,
          New_password: password,
          New_password_confirmation: confirmPassword,
        }
      );

      toast.success(res.data.message || t("sign.passwordChanged"));
      localStorage.removeItem("resetEmail"); // نمسحه عشان الأمان
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || t("sign.errorOccurred"));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      const newErrors = { ...errors };
      delete newErrors.password;
      setErrors(newErrors);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (errors.confirmPassword) {
      const newErrors = { ...errors };
      delete newErrors.confirmPassword;
      setErrors(newErrors);
    }
  };
  

  return (
    <div className="change-password-page" dir={isRTL ? "rtl" : "ltr"}>
      <div className="change-password-container">
        <img className="change-password-logo" src={logo} alt="Logo" />
        <h5 className="change-password-title">{t("sign.newPassword")}</h5>

        <div className="change-password-subtitle">
          {t("sign.resetPasswordHelp")}
        </div>

        <form className="change-password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t("sign.newPassword")}</label>
            <input
              className={`form-input ${errors.password ? 'error' : ''}`}
              autoComplete="off"
              type="password"
              name="newPassword"
              placeholder={i18n.language === "ar" ? "8 أحرف على الأقل (أرقام أو حروف)" : "At least 8 characters (letters or numbers)"}
              value={password}
              onChange={handlePasswordChange}
              dir={isRTL ? "rtl" : "ltr"}
              style={{ textAlign: isRTL ? "right" : "left" }}
              required
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">{t("sign.confirmPassword")}</label>
            <input
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              autoComplete="off"
              type="password"
              name="confirmPassword"
              placeholder={t("sign.confirmPassword")}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              dir={isRTL ? "rtl" : "ltr"}
              style={{ textAlign: isRTL ? "right" : "left" }}
              required
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="change-password-button">
            {t("sign.changePassword")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
