

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";
import logo from "../../assests/imgs/logo.svg";
import { toast } from "react-toastify";
import axios from "axios";

const Register = () => {
  const { t, i18n } = useTranslation("global");
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("user");
  const [loading, setLoading] = useState(false);

  const [userErrors, setUserErrors] = useState({});
  const [vendorErrors, setVendorErrors] = useState({});

  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    address: "",
  });

  const [vendorFormData, setVendorFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    company_name: "",
    description: "",
    address: "",
    postal_code: "",
    vodafone_cash: "",
    instapay: "",
    type_business: "",
    category_id: "",
    country_id: "",
    city_id: "",
    id_card_back_image:"",
    id_card_front_image:""
  });

  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [businessTypes] = useState([
    { id: 1, name: "Individual" },
    { id: 2, name: "Company" },
    { id: 3, name: "Institution" },
  ]);

  useEffect(() => {
    fetchCategories();
    fetchCountries();
  }, [i18n.language]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/categories`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );
      if (response.data.status) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/countries`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );
      if (response.data.status) {
        setCountries(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const fetchCities = async (countryId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/cities/${countryId}`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );
      if (response.data.status) {
        setCities(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const validateName = (name) => {
    const nameRegex = /^[\u0600-\u06FFa-zA-Z0-9\s]{3,50}$/;
    return nameRegex.test(name.trim());
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email.trim());
  };

  const validateEgyptianPhone = (phone) => {
    const egyptianMobileRegex = /^(01[0125][0-9]{8}|(\+2)?01[0125][0-9]{8})$/;
    return egyptianMobileRegex.test(phone.replace(/\s+/g, ''));
  };

  const validatePassword = (password) => {
    const passwordRegex = /^[a-zA-Z0-9\u0600-\u06FF]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateAddress = (address) => {
    return address.trim().length >= 10 && address.trim().length <= 200;
  };

  const validateCompanyName = (companyName) => {
    const companyRegex = /^[\u0600-\u06FFa-zA-Z0-9\s&.,'-]{3,100}$/;
    return companyRegex.test(companyName.trim());
  };

  const validateDescription = (description) => {
    return description.trim().length >= 20 && description.trim().length <= 500;
  };

  const validateEgyptianPostalCode = (postalCode) => {
    const postalRegex = /^[0-9]{5}$/;
    return postalRegex.test(postalCode);
  };

  const validateVodafoneCash = (number) => {
    return validateEgyptianPhone(number);
  };

  const validateInstapay = (number) => {
    return validateEgyptianPhone(number) || validateEmail(number);
  };

  const validateFileSize = (file) => {
    const maxSize = 5 * 1024 * 1024;
    return file && file.size <= maxSize;
  };

  const validateFileType = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    return file && allowedTypes.includes(file.type);
  };

  const validateUserForm = () => {
    const errors = {};


    if (!userFormData.name.trim()) {
      errors.name = i18n.language === "ar" ? "الاسم مطلوب" : "Name is required";
    } else if (!validateName(userFormData.name)) {
      errors.name = i18n.language === "ar" 
        ? "الاسم يجب أن يكون من 3-50 حرف ويحتوي على حروف وأرقام" 
        : "Name must be 3-50 characters and contain letters and numbers";
    }


    if (!userFormData.email.trim()) {
      errors.email = i18n.language === "ar" ? "البريد الإلكتروني مطلوب" : "Email is required";
    } else if (!validateEmail(userFormData.email)) {
      errors.email = i18n.language === "ar" ? "البريد الإلكتروني غير صحيح" : "Invalid email format";
    }


    if (!userFormData.phone.trim()) {
      errors.phone = i18n.language === "ar" ? "رقم الهاتف مطلوب" : "Phone number is required";
    } else if (!validateEgyptianPhone(userFormData.phone)) {
      errors.phone = i18n.language === "ar" 
        ? "رقم الهاتف يجب أن يكون رقم مصري صحيح (مثال: 01012345678)" 
        : "Phone must be a valid Egyptian number (e.g., 01012345678)";
    }


    if (!userFormData.address.trim()) {
      errors.address = i18n.language === "ar" ? "العنوان مطلوب" : "Address is required";
    } else if (!validateAddress(userFormData.address)) {
      errors.address = i18n.language === "ar" 
        ? "العنوان يجب أن يكون من 10-200 حرف" 
        : "Address must be 10-200 characters long";
    }


    if (!userFormData.password.trim()) {
      errors.password = i18n.language === "ar" ? "كلمة المرور مطلوبة" : "Password is required";
    }


    if (!userFormData.password_confirmation.trim()) {
      errors.password_confirmation = i18n.language === "ar" ? "تأكيد كلمة المرور مطلوب" : "Password confirmation is required";
    } else if (userFormData.password !== userFormData.password_confirmation) {
      errors.password_confirmation = i18n.language === "ar" ? "كلمة المرور غير متطابقة" : "Passwords do not match";
    }

    setUserErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const validateVendorForm = () => {
    const errors = {};


    if (!vendorFormData.name.trim()) {
      errors.name = i18n.language === "ar" ? "الاسم مطلوب" : "Name is required";
    } else if (!validateName(vendorFormData.name)) {
      errors.name = i18n.language === "ar" 
        ? "الاسم يجب أن يكون من 3-50 حرف ويحتوي على حروف وأرقام" 
        : "Name must be 3-50 characters and contain letters and numbers";
    }


    if (!vendorFormData.email.trim()) {
      errors.email = i18n.language === "ar" ? "البريد الإلكتروني مطلوب" : "Email is required";
    } else if (!validateEmail(vendorFormData.email)) {
      errors.email = i18n.language === "ar" ? "البريد الإلكتروني غير صحيح" : "Invalid email format";
    }


    if (!vendorFormData.phone.trim()) {
      errors.phone = i18n.language === "ar" ? "رقم الهاتف مطلوب" : "Phone number is required";
    } else if (!validateEgyptianPhone(vendorFormData.phone)) {
      errors.phone = i18n.language === "ar" 
        ? "رقم الهاتف يجب أن يكون رقم مصري صحيح (مثال: 01012345678)" 
        : "Phone must be a valid Egyptian number (e.g., 01012345678)";
    }


    if (!vendorFormData.company_name.trim()) {
      errors.company_name = i18n.language === "ar" ? "اسم الشركة مطلوب" : "Company name is required";
    } else if (!validateCompanyName(vendorFormData.company_name)) {
      errors.company_name = i18n.language === "ar" 
        ? "اسم الشركة يجب أن يكون من 3-100 حرف" 
        : "Company name must be 3-100 characters long";
    }


    if (!vendorFormData.description.trim()) {
      errors.description = i18n.language === "ar" ? "الوصف مطلوب" : "Description is required";
    } else if (!validateDescription(vendorFormData.description)) {
      errors.description = i18n.language === "ar" 
        ? "الوصف يجب أن يكون من 20-500 حرف" 
        : "Description must be 20-500 characters long";
    }


    if (!vendorFormData.address.trim()) {
      errors.address = i18n.language === "ar" ? "العنوان مطلوب" : "Address is required";
    } else if (!validateAddress(vendorFormData.address)) {
      errors.address = i18n.language === "ar" 
        ? "العنوان يجب أن يكون من 10-200 حرف" 
        : "Address must be 10-200 characters long";
    }


    if (!vendorFormData.postal_code.trim()) {
      errors.postal_code = i18n.language === "ar" ? "الرمز البريدي مطلوب" : "Postal code is required";
    } else if (!validateEgyptianPostalCode(vendorFormData.postal_code)) {
      errors.postal_code = i18n.language === "ar" 
        ? "الرمز البريدي يجب أن يكون 5 أرقام" 
        : "Postal code must be 5 digits";
    }


    if (!vendorFormData.vodafone_cash.trim()) {
      errors.vodafone_cash = i18n.language === "ar" ? "رقم فودافون كاش مطلوب" : "Vodafone Cash number is required";
    } else if (!validateVodafoneCash(vendorFormData.vodafone_cash)) {
      errors.vodafone_cash = i18n.language === "ar" 
        ? "رقم فودافون كاش يجب أن يكون رقم موبايل مصري صحيح" 
        : "Vodafone Cash must be a valid Egyptian mobile number";
    }


    if (!vendorFormData.instapay.trim()) {
      errors.instapay = i18n.language === "ar" ? "رقم إنستاباي مطلوب" : "Instapay number is required";
    } else if (!validateInstapay(vendorFormData.instapay)) {
      errors.instapay = i18n.language === "ar" 
        ? "إنستاباي يجب أن يكون رقم موبايل مصري أو بريد إلكتروني صحيح" 
        : "Instapay must be a valid Egyptian mobile number or email";
    }


    if (!vendorFormData.type_business) {
      errors.type_business = i18n.language === "ar" ? "نوع العمل مطلوب" : "Business type is required";
    }


    if (!vendorFormData.category_id) {
      errors.category_id = i18n.language === "ar" ? "الفئة مطلوبة" : "Category is required";
    }


    if (!vendorFormData.country_id) {
      errors.country_id = i18n.language === "ar" ? "الدولة مطلوبة" : "Country is required";
    } else {
      const selectedCountry = countries.find(country => country.id == vendorFormData.country_id);
      if (!selectedCountry) {
        errors.country_id = i18n.language === "ar" ? "يرجى اختيار دولة صحيحة" : "Please select a valid country";
      }
    }


    if (!vendorFormData.city_id) {
      errors.city_id = i18n.language === "ar" ? "المدينة مطلوبة" : "City is required";
    } else {
      const selectedCity = cities.find(city => city.id == vendorFormData.city_id);
      if (!selectedCity) {
        errors.city_id = i18n.language === "ar" ? "يرجى اختيار مدينة صحيحة" : "Please select a valid city";
      }
    }


    if (!vendorFormData.password.trim()) {
      errors.password = i18n.language === "ar" ? "كلمة المرور مطلوبة" : "Password is required";
    }


    if (!vendorFormData.password_confirmation.trim()) {
      errors.password_confirmation = i18n.language === "ar" ? "تأكيد كلمة المرور مطلوب" : "Password confirmation is required";
    } else if (vendorFormData.password !== vendorFormData.password_confirmation) {
      errors.password_confirmation = i18n.language === "ar" ? "كلمة المرور غير متطابقة" : "Passwords do not match";
    }


    if (!vendorFormData.id_card_front_image) {
      errors.id_card_front_image = i18n.language === "ar" ? "صورة البطاقة الأمامية مطلوبة" : "Front ID card image is required";
    } else if (!validateFileType(vendorFormData.id_card_front_image)) {
      errors.id_card_front_image = i18n.language === "ar" 
        ? "يجب أن تكون الصورة من نوع JPEG, JPG, PNG, أو GIF" 
        : "Image must be JPEG, JPG, PNG, or GIF format";
    } else if (!validateFileSize(vendorFormData.id_card_front_image)) {
      errors.id_card_front_image = i18n.language === "ar" 
        ? "حجم الصورة يجب أن يكون أقل من 5 ميجابايت" 
        : "Image size must be less than 5MB";
    }


    if (!vendorFormData.id_card_back_image) {
      errors.id_card_back_image = i18n.language === "ar" ? "صورة البطاقة الخلفية مطلوبة" : "Back ID card image is required";
    } else if (!validateFileType(vendorFormData.id_card_back_image)) {
      errors.id_card_back_image = i18n.language === "ar" 
        ? "يجب أن تكون الصورة من نوع JPEG, JPG, PNG, أو GIF" 
        : "Image must be JPEG, JPG, PNG, or GIF format";
    } else if (!validateFileSize(vendorFormData.id_card_back_image)) {
      errors.id_card_back_image = i18n.language === "ar" 
        ? "حجم الصورة يجب أن يكون أقل من 5 ميجابايت" 
        : "Image size must be less than 5MB";
    }

    setVendorErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;


    if (name === "phone") {
      let cleanedValue = value.replace(/[^0-9+]/g, "");

      if (cleanedValue.startsWith("2") && !cleanedValue.startsWith("+")) {
        cleanedValue = "+" + cleanedValue;
      }
      setUserFormData({ ...userFormData, [name]: cleanedValue });
    } else {
      setUserFormData({ ...userFormData, [name]: value });
    }
    

    if (userErrors[name]) {
      const newErrors = { ...userErrors };
      delete newErrors[name];
      setUserErrors(newErrors);
    }
  };

  const handleVendorChange = (e) => {
    const { name, value, files } = e.target;


    if (files && files.length > 0) {
      setVendorFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
      

      if (vendorErrors[name]) {
        const newErrors = { ...vendorErrors };
        delete newErrors[name];
        setVendorErrors(newErrors);
      }
    } else {

      if (name === "phone" || name === "vodafone_cash") {
        let cleanedValue = value.replace(/[^0-9+]/g, "");

        if (cleanedValue.startsWith("2") && !cleanedValue.startsWith("+")) {
          cleanedValue = "+" + cleanedValue;
        }
        setVendorFormData((prev) => ({
          ...prev,
          [name]: cleanedValue,
        }));
      } else if (name === "instapay") {

        setVendorFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      } else if (name === "postal_code") {

        const numericValue = value.replace(/[^0-9]/g, "");
        setVendorFormData((prev) => ({
          ...prev,
          [name]: numericValue,
        }));
      } else {
        setVendorFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }


      if (vendorErrors[name]) {
        const newErrors = { ...vendorErrors };
        delete newErrors[name];
        setVendorErrors(newErrors);
      }
    }


    if (name === "country_id" && value) {
      fetchCities(value);
      if (vendorFormData.city_id) {
        setVendorFormData((prev) => ({
          ...prev,
          city_id: "",
        }));
      }
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateUserForm()) {
      toast.error(i18n.language === "ar" ? "يرجى تصحيح الأخطاء في النموذج" : "Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();
      Object.keys(userFormData).forEach((key) => {
        form.append(key, userFormData[key]);
      });

      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/user/register`,
        form,
        {
          headers: { Accept: "application/json" },
        }
      );

      toast.success(res.data.message);

      if (res.data.status) {
        localStorage.setItem("register_email", userFormData.email);
        navigate("/otp");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("خطأ في الاتصال بالسيرفر");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateVendorForm()) {
      toast.error(i18n.language === "ar" ? "يرجى تصحيح الأخطاء في النموذج" : "Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();
      Object.keys(vendorFormData).forEach((key) => {
        form.append(key, vendorFormData[key]);
      });

      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/vendor/register`,
        form,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );

      toast.success(res.data.message);

      if (res.data.status) {

        navigate("/login");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("خطأ في الاتصال بالسيرفر");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderUserForm = () => (
    <form className="register-form" onSubmit={handleUserSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("profile.name")}</label>
          <input
            className={`form-input ${userErrors.name ? 'error' : ''}`}
            type="text"
            name="name"
            value={userFormData.name}
            onChange={handleUserChange}
            placeholder={t("profile.name")}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          />
          {userErrors.name && <span className="error-message">{userErrors.name}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">{t("profile.email")}</label>
          <input
            className={`form-input ${userErrors.email ? 'error' : ''}`}
            type="email"
            name="email"
            value={userFormData.email}
            onChange={handleUserChange}
            placeholder={t("profile.email")}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          />
          {userErrors.email && <span className="error-message">{userErrors.email}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("profile.phone")}</label>
          <input
            className={`form-input ${userErrors.phone ? 'error' : ''}`}
            type="text"
            name="phone"
            value={userFormData.phone}
            onChange={handleUserChange}
            placeholder={i18n.language === "ar" ? "01012345678" : "01012345678"}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          />
          {userErrors.phone && <span className="error-message">{userErrors.phone}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">{t("profile.address")}</label>
          <input
            className={`form-input ${userErrors.address ? 'error' : ''}`}
            type="text"
            name="address"
            value={userFormData.address}
            onChange={handleUserChange}
            placeholder={t("profile.address")}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          />
          {userErrors.address && <span className="error-message">{userErrors.address}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("sign.password")}</label>
          <input
            className={`form-input ${userErrors.password ? 'error' : ''}`}
            type="password"
            name="password"
            value={userFormData.password}
            onChange={handleUserChange}
            placeholder={i18n.language === "ar" ? "8 أحرف على الأقل (أرقام أو حروف)" : "At least 8 characters (letters or numbers)"}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          />
          {userErrors.password && <span className="error-message">{userErrors.password}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">{t("sign.confirmPassword")}</label>
          <input
            className={`form-input ${userErrors.password_confirmation ? 'error' : ''}`}
            type="password"
            name="password_confirmation"
            value={userFormData.password_confirmation}
            onChange={handleUserChange}
            placeholder={t("sign.confirmPassword")}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          />
          {userErrors.password_confirmation && <span className="error-message">{userErrors.password_confirmation}</span>}
        </div>
      </div>

      <button type="submit" className="register-button" disabled={loading}>
        {loading ? t("sign.registering") : t("sign.register")}
      </button>
    </form>
  );

  const renderVendorForm = () => (
    <form className="register-form" onSubmit={handleVendorSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("profile.name")}</label>
          <input
            className={`form-input ${vendorErrors.name ? 'error' : ''}`}
            type="text"
            name="name"
            value={vendorFormData.name}
            onChange={handleVendorChange}
            placeholder={t("profile.name")}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          />
          {vendorErrors.name && <span className="error-message">{vendorErrors.name}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">{t("profile.email")}</label>
          <input
            className={`form-input ${vendorErrors.email ? 'error' : ''}`}
            type="email"
            name="email"
            value={vendorFormData.email}
            onChange={handleVendorChange}
            placeholder={t("profile.email")}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          />
          {vendorErrors.email && <span className="error-message">{vendorErrors.email}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("profile.phone")}</label>
          <input
            className={`form-input ${vendorErrors.phone ? 'error' : ''}`}
            type="text"
            name="phone"
            value={vendorFormData.phone}
            onChange={handleVendorChange}
            placeholder={i18n.language === "ar" ? "01012345678" : "01012345678"}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          />
          {vendorErrors.phone && <span className="error-message">{vendorErrors.phone}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">{t("sign.companyName")}</label>
          <input
            className={`form-input ${vendorErrors.company_name ? 'error' : ''}`}
            type="text"
            name="company_name"
            value={vendorFormData.company_name}
            onChange={handleVendorChange}
            placeholder={t("sign.companyName")}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          />
          {vendorErrors.company_name && <span className="error-message">{vendorErrors.company_name}</span>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t("sign.description")}</label>
        <textarea
          className={`form-textarea ${vendorErrors.description ? 'error' : ''}`}
          name="description"
          value={vendorFormData.description}
          onChange={handleVendorChange}
          placeholder={i18n.language === "ar" ? "وصف تفصيلي للنشاط التجاري (20 حرف على الأقل)" : "Detailed business description (at least 20 characters)"}
          dir={isRTL ? "rtl" : "ltr"}
          style={{ textAlign: isRTL ? "right" : "left" }}
        />
        {vendorErrors.description && <span className="error-message">{vendorErrors.description}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("profile.address")}</label>
          <input
            className={`form-input ${vendorErrors.address ? 'error' : ''}`}
            type="text"
            name="address"
            value={vendorFormData.address}
            onChange={handleVendorChange}
            placeholder={i18n.language === "ar" ? "العنوان التفصيلي (10 أحرف على الأقل)" : "Detailed address (at least 10 characters)"}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          />
          {vendorErrors.address && <span className="error-message">{vendorErrors.address}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">{t("sign.postalCode")}</label>
          <input
            className={`form-input ${vendorErrors.postal_code ? 'error' : ''}`}
            type="text"
            name="postal_code"
            value={vendorFormData.postal_code}
            onChange={handleVendorChange}
            placeholder={i18n.language === "ar" ? "12345" : "12345"}
            maxLength="5"
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          />
          {vendorErrors.postal_code && <span className="error-message">{vendorErrors.postal_code}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("sign.vodafoneCash")}</label>
          <input
            className={`form-input ${vendorErrors.vodafone_cash ? 'error' : ''}`}
            type="text"
            name="vodafone_cash"
            value={vendorFormData.vodafone_cash}
            onChange={handleVendorChange}
            placeholder={i18n.language === "ar" ? "01012345678" : "01012345678"}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          />
          {vendorErrors.vodafone_cash && <span className="error-message">{vendorErrors.vodafone_cash}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">{t("sign.instapay")}</label>
          <input
            className={`form-input ${vendorErrors.instapay ? 'error' : ''}`}
            type="text"
            name="instapay"
            value={vendorFormData.instapay}
            onChange={handleVendorChange}
            placeholder={i18n.language === "ar" ? "01012345678 أو email@example.com" : "01012345678 or email@example.com"}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          />
          {vendorErrors.instapay && <span className="error-message">{vendorErrors.instapay}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("sign.typeOfBusiness")}</label>
          <select
            className={`form-input ${vendorErrors.type_business ? 'error' : ''}`}
            name="type_business"
            value={vendorFormData.type_business}
            onChange={handleVendorChange}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          >
            <option value="">{t("sign.selectBusinessType")}</option>
            {businessTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          {vendorErrors.type_business && <span className="error-message">{vendorErrors.type_business}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">{t("sign.category")}</label>
          <select
            className={`form-input ${vendorErrors.category_id ? 'error' : ''}`}
            name="category_id"
            value={vendorFormData.category_id}
            onChange={handleVendorChange}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          >
            <option value="">{t("sign.selectCategory")}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {vendorErrors.category_id && <span className="error-message">{vendorErrors.category_id}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("sign.country")}</label>
          <select
            className={`form-input ${vendorErrors.country_id ? 'error' : ''}`}
            name="country_id"
            value={vendorFormData.country_id}
            onChange={handleVendorChange}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          >
            <option value="">{t("sign.selectCountry")}</option>
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
          {vendorErrors.country_id && <span className="error-message">{vendorErrors.country_id}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">{t("sign.city")}</label>
          <select
            className={`form-input ${vendorErrors.city_id ? 'error' : ''}`}
            name="city_id"
            value={vendorFormData.city_id}
            onChange={handleVendorChange}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
            disabled={!vendorFormData.country_id}
          >
            <option value="">{t("sign.selectCity")}</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
          {vendorErrors.city_id && <span className="error-message">{vendorErrors.city_id}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t("sign.password")}</label>
          <input
            className={`form-input ${vendorErrors.password ? 'error' : ''}`}
            type="password"
            name="password"
            value={vendorFormData.password}
            onChange={handleVendorChange}
            placeholder={i18n.language === "ar" ? "8 أحرف على الأقل (أرقام أو حروف)" : "At least 8 characters (letters or numbers)"}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          />
          {vendorErrors.password && <span className="error-message">{vendorErrors.password}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">{t("sign.confirmPassword")}</label>
          <input
            className={`form-input ${vendorErrors.password_confirmation ? 'error' : ''}`}
            type="password"
            name="password_confirmation"
            value={vendorFormData.password_confirmation}
            onChange={handleVendorChange}
            placeholder={t("sign.confirmPassword")}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ textAlign: isRTL ? "right" : "left" }}
          />
          {vendorErrors.password_confirmation && <span className="error-message">{vendorErrors.password_confirmation}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{i18n.language=="ar"? "صورة امامية للبطاقة (أقل من 5 ميجا)":"Front view of the card (less than 5MB)"}</label>
          <input
            className={`form-input ${vendorErrors.id_card_front_image ? 'error' : ''}`}
            type="file"
            name="id_card_front_image"
            accept="image/jpeg,image/jpg,image/png,image/gif"
            onChange={handleVendorChange}
          />
          {vendorErrors.id_card_front_image && <span className="error-message">{vendorErrors.id_card_front_image}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">{i18n.language=="ar"? "صورة خلفية للبطاقة (أقل من 5 ميجا)":"Back of card image (less than 5MB)"}</label>
          <input
            className={`form-input ${vendorErrors.id_card_back_image ? 'error' : ''}`}
            type="file"
            name="id_card_back_image"
            accept="image/jpeg,image/jpg,image/png,image/gif"
            onChange={handleVendorChange}
          />
          {vendorErrors.id_card_back_image && <span className="error-message">{vendorErrors.id_card_back_image}</span>}
        </div>
      </div>

      <button type="submit" className="register-button" disabled={loading}>
        {loading ? t("sign.registering") : t("sign.registerAsVendor")}
      </button>
    </form>
  );

  return (
    <div className="register-page" dir={isRTL ? "rtl" : "ltr"}>
      <div className="register-container">
        <img className="register-logo" src={logo} alt="Logo" />

        {/* Tabs */}
        <div className="register-tabs">
          <button
            className={`tab-button ${activeTab === "user" ? "active" : ""}`}
            onClick={() => setActiveTab("user")}
          >
            {t("sign.userRegistration")}
          </button>
          <button
            className={`tab-button ${activeTab === "vendor" ? "active" : ""}`}
            onClick={() => setActiveTab("vendor")}
          >
            {t("sign.vendorRegistration")}
          </button>
        </div>

        {/* Form Content */}
        {activeTab === "user" ? renderUserForm() : renderVendorForm()}

        <div className="login-link">
          <span>{t("sign.haveAccount")}</span>
          <Link to="/login" className="link">
            {t("sign.login")}
          </Link>
        </div>

          <Link style={{fontSize:"14px"}} to="/NewOtp" className="link">
            {i18n.language=="ar"? "رمز التحقق" :"verification code"} 
          </Link>
      </div>
    </div>
  );
};

export default Register;
