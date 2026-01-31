
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "../OtpVerifyEmail/OtpVerifyEmail.css";
import logo from "../../assests/imgs/logo.svg";
import axios from "axios";
import { toast } from "react-toastify";

const NewOTP = () => {
  const { i18n } = useTranslation("global");
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();

  const [otp, setOtp] = useState(Array(6).fill(""));
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1); // 1 = email input, 2 = otp verification
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const inputsRef = useRef([]);
  const timerRef = useRef(null);

  // Timer for resend functionality
  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [resendTimer]);

  // Auto-focus first OTP input when step changes
  useEffect(() => {
    if (step === 2 && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, [step]);

  // Handle OTP input changes
  const handleChange = useCallback((value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        inputsRef.current[index + 1]?.focus();
      }

      if (value && index === 5) {
        const fullCode = [...newOtp];
        fullCode[index] = value;
        if (fullCode.every((digit) => digit !== "")) {
          setTimeout(() => handleVerify(null, fullCode.join("")), 100);
        }
      }
    }
  }, [otp]);

  const handleKeyDown = useCallback((e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        inputsRef.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  }, [otp]);

  const handlePaste = useCallback((e) => {
    const pasteData = e.clipboardData.getData("Text").trim();
    if (/^\d{6}$/.test(pasteData)) {
      const pasteArray = pasteData.split("");
      setOtp(pasteArray);
      pasteArray.forEach((digit, idx) => {
        if (inputsRef.current[idx]) {
          inputsRef.current[idx].value = digit;
        }
      });
      setTimeout(() => handleVerify(null, pasteData), 100);
    }
    e.preventDefault();
  }, []);

  const handleSendEmail = useCallback(async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error(isRTL ? "الرجاء إدخال البريد الإلكتروني" : "Please enter your email");
      return;
    }

    setIsLoading(true);
    try {
      const form = new FormData();
      form.append("email", email.trim());

      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/user/resend-reset-code`,
        form,
        { headers: { Accept: "application/json" } }
      );

      toast.success(res.data.message || (isRTL ? "تم إرسال الكود بنجاح" : "Code sent successfully"));
      setStep(2);
      setResendTimer(60);
      setOtp(Array(6).fill(""));
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          (isRTL ? "خطأ في الاتصال بالسيرفر" : "Server connection error")
      );
    } finally {
      setIsLoading(false);
    }
  }, [email, isRTL]);

  const handleVerify = useCallback(async (e, codeParam = null) => {
    if (e) e.preventDefault();

    const code = codeParam || otp.join("");

    if (code.length !== 6) {
      toast.error(isRTL ? "الرجاء إدخال الكود بالكامل" : "Please enter the full code");
      return;
    }

    setIsLoading(true);
    try {
      const form = new FormData();
      form.append("email", email);
      form.append("code", code);

      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/user/verify`,
        form,
        { headers: { Accept: "application/json" } }
      );

      toast.success(res.data.message || (isRTL ? "تم التحقق بنجاح" : "Verified successfully"));

      if (res.data.status) {
        navigate("/login");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          (isRTL ? "خطأ في الاتصال بالسيرفر" : "Server connection error")
      );
      setOtp(Array(6).fill(""));
      if (inputsRef.current[0]) {
        inputsRef.current[0].focus();
      }
    } finally {
      setIsLoading(false);
    }
  }, [otp, isRTL, email, navigate]);

  const handleResend = useCallback(() => {
    if (resendTimer === 0) {
      handleSendEmail({ preventDefault: () => {} });
    }
  }, [resendTimer, handleSendEmail]);

  const handleBackToEmail = useCallback(() => {
    setStep(1);
    setOtp(Array(6).fill(""));
    setResendTimer(0);
  }, []);

  // Memoized values
  const isOtpComplete = useMemo(() => otp.every((digit) => digit !== ""), [otp]);
  const canSubmitEmail = useMemo(() => email.trim().length > 0, [email]);

  return (
    <div className="otp-verify-page" dir={isRTL ? "rtl" : "ltr"}>
      <div className="otp-verify-container">
        <img className="otp-verify-logo" src={logo} alt="Logo" />

        {step === 1 ? (
          <>
            <h5 className="otp-verify-title">
              {isRTL ? "تأكيد البريد الإلكتروني" : "Email Confirmation"}
            </h5>
            <div className="otp-verify-subtitle">
              {isRTL
                ? "أدخل بريدك الإلكتروني لاستلام رمز التأكيد"
                : "Enter your email to receive a confirmation code"}
            </div>

            <form className="otp-verify-form" onSubmit={handleSendEmail}>
              <div className="form-group">
                <label className="form-label">{isRTL ? "البريد الإلكتروني" : "Email"}</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isRTL ? "البريد الإلكتروني" : "Email"}
                  required
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <button type="submit" className="otp-verify-button" disabled={isLoading || !canSubmitEmail}>
                {isLoading ? (isRTL ? "جاري الإرسال..." : "Sending...") : isRTL ? "إرسال الكود" : "Send Code"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h5 className="otp-verify-title">
              {isRTL ? "تأكيد البريد الإلكتروني" : "Email Confirmation"}
            </h5>
            <div className="otp-verify-subtitle">
              {isRTL ? "تم إرسال رمز التأكيد إلى" : "A confirmation code has been sent to"}
              <br />
              <strong>{email}</strong>
            </div>

            <form className="otp-verify-form" onSubmit={handleVerify}>
              <div className="form-group">
                <label className="form-label">{isRTL ? "رمز التأكيد" : "Confirmation Code"}</label>
                <div className="otp-input-container" onPaste={handlePaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputsRef.current[index] = el)}
                      className="otp-input"
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleChange(e.target.value, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      autoComplete="off"
                      disabled={isLoading}
                      style={{ textAlign: "center" }}
                    />
                  ))}
                </div>
              </div>

              <button type="submit" className="otp-verify-button" disabled={isLoading || !isOtpComplete}>
                {isLoading ? (isRTL ? "جاري التحقق..." : "Verifying...") : isRTL ? "تأكيد" : "Confirm"}
              </button>
            </form>

            <div className="otp-actions" style={{ marginTop: "20px", textAlign: "center" }}>
              <div style={{ marginBottom: "10px" }}>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendTimer > 0 || isLoading}
                  style={{
                    background: "none",
                    border: "none",
                    color: resendTimer > 0 ? "#999" : "#007bff",
                    cursor: resendTimer > 0 ? "not-allowed" : "pointer",
                    textDecoration: "underline",
                  }}
                >
                  {resendTimer > 0
                    ? isRTL
                      ? `إعادة الإرسال خلال ${resendTimer} ثانية`
                      : `Resend in ${resendTimer}s`
                    : isRTL
                    ? "إعادة إرسال الكود"
                    : "Resend Code"}
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  disabled={isLoading}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#6c757d",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  {isRTL ? "تغيير البريد الإلكتروني" : "Change Email"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(NewOTP);

