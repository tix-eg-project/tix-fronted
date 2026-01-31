import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import "./OtpVerifyEmail.css";
import logo from "../../assests/imgs/logo.svg";
import axios from "axios";
import { toast } from "react-toastify";

const OtpVerifyEmail = () => {
  const { t, i18n } = useTranslation("global");
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();

  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputsRef = useRef([]);
  const [timer, setTimer] = useState(60);

  const email = localStorage.getItem("register_email");

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  const handleChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to next input
      if (value && index < 5) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData("Text").trim();
    if (/^\d{6}$/.test(pasteData)) {
      const pasteArray = pasteData.split("");
      setOtp(pasteArray);
      pasteArray.forEach((digit, idx) => {
        inputsRef.current[idx].value = digit;
      });
    }
    e.preventDefault();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("الرجاء إدخال الكود بالكامل");
      return;
    }

    try {
      const form = new FormData();
      form.append("email", email);
      form.append("code", code);

      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/user/verify`,
        form,
        { headers: { Accept: "application/json" } }
      );

      toast.success(res.data.message);

      if (res.data.status) {
        navigate("/login"); 
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("خطأ في الاتصال بالسيرفر");
      }
    }
  };

  const handleResend = async () => {
    try {
      const form = new FormData();
      form.append("email", email);

      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/user/send-reset-code`,
        form,
        { headers: { Accept: "application/json" } }
      );

      toast.success(res.data.message);
      setTimer(60); 
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("خطأ في الاتصال بالسيرفر");
      }
    }
  };

  return (
    <div className="otp-verify-page" dir={isRTL ? "rtl" : "ltr"}>
      <div className="otp-verify-container">
        <img className="otp-verify-logo" src={logo} alt="Logo" />
        <h5 className="otp-verify-title">{t("sign.emailConfirmation")}</h5>
        <div className="otp-verify-subtitle">
          {t("sign.checkEmailAndEnterCode")}
        </div>

        <form className="otp-verify-form" onSubmit={handleVerify}>
          <div className="form-group">
            <label className="form-label">{t("sign.confirmationCode")}</label>
            <div className="otp-input-container" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputsRef.current[index] = el)}
                  className="otp-input"
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  autoComplete="off"
                  style={{ textAlign: "center" }}
                />
              ))}
            </div>
          </div>

          {timer > 0 ? (
            <span style={{ fontSize: "14px", color: "#666" }}>
              إعادة إرسال الكود خلال {timer} ثانية
            </span>
          ) : (
            <Link to="#" onClick={handleResend} className="resend-code-link">
              {t("sign.resendConfirmationCode")}
            </Link>
          )}

          <button type="submit" className="otp-verify-button">
            {t("sign.confirm")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OtpVerifyEmail;
