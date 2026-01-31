



import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  FiCreditCard,
  FiTruck,
  FiMapPin,
  FiCheckCircle,
  FiShoppingBag,
} from "react-icons/fi";
import { FaCcVisa, FaCcMastercard } from "react-icons/fa";
import "./Checkout.css";
import { useDispatch, useSelector } from "react-redux";
import { apiRequest } from "../../Redux/Apis/apiRequest";
import { toast } from "react-toastify";
import axios from "axios";


export default function Checkout() {
  const { t, i18n } = useTranslation("global");
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    address: "",
    phone: "",
    order_note: "",
  });
  const [isZoneOpen, setIsZoneOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [zoneSearchQuery, setZoneSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  const dispatch = useDispatch();
  const { CartSummery, PaymentMethods, cities, addPaymentContact, addPaymentMethod } = useSelector(state => state.api);

  useEffect(() => {
    // Fetch cart summary
    dispatch(
      apiRequest({
        url: "api/summary",
        entity: "CartSummery",
        method: "GET",
        headers: {
          "Accept-Language": i18n.language,
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
    );

    // Fetch payment methods
    dispatch(
      apiRequest({
        url: "api/payment-methods",
        entity: "PaymentMethods",
        method: "GET",
        headers: {
          "Accept-Language": i18n.language,
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
    );

    // Fetch cities
    dispatch(
      apiRequest({
        url: "api/shipping/cities",
        entity: "cities",
        method: "GET",
        headers: {
          "Accept-Language": i18n.language,
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
    );
  }, [dispatch, i18n.language]);
  // console.log({PaymentMethods});
  
  // Set default payment method when payment methods are loaded
  useEffect(() => {
    if (PaymentMethods?.data?.data?.length > 0 && !paymentMethod) {
      setPaymentMethod(PaymentMethods.data.data[0].id);
    }
  }, [PaymentMethods, paymentMethod]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "phone") {
      const numericValue = value.replace(/[^0-9]/g, "");
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[0-9]{10,15}$/;
    return phoneRegex.test(phone);
  };

  const validateAddress = (address) => {
    return address.trim().length >= 8;
  };

  const filteredCities = cities?.data?.filter((city) =>
    city.name.toLowerCase().includes(zoneSearchQuery.toLowerCase())
  );

  const handleCitySelect = async (city) => {
    setSelectedZone(city);
    setIsZoneOpen(false);
    setZoneSearchQuery("");

    // Call summary API when city is selected
    try {
      const summaryFormData = new FormData();
      summaryFormData.append("vsoft_city_id", city.id);
      
      await dispatch(
        apiRequest({
          url: "api/summary",
          entity: "CartSummery",
          method: "POST",
          data: summaryFormData,
          headers: {
            "Accept-Language": i18n.language,
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
      );
    } catch (error) {
      console.error("Error applying shipping zone:", error);
      toast.error(i18n.language === "ar" ? "حدث خطأ في تطبيق منطقة الشحن" : "Error applying shipping zone");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    if (!selectedZone) {
      toast.error(i18n.language === "ar" ? "يرجى اختيار المدينة" : "Please select a city");
      return;
    }

    if (!validatePhoneNumber(formData.phone)) {
      toast.error(i18n.language === "ar" ? "يرجى إدخال رقم هاتف صحيح (10-15 رقم)" : "Please enter a valid phone number (10-15 digits)");
      return;
    }

    if (!validateAddress(formData.address)) {
      toast.error(i18n.language === "ar" ? "يرجى إدخال عنوان صحيح (8 أحرف على الأقل)" : "Please enter a valid address (at least 8 characters)");
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Step 1: Submit user contact information
      const contactFormData = new FormData();
      contactFormData.append("address", formData.address);
      contactFormData.append("order_note", formData.order_note);
      contactFormData.append("phone", formData.phone);

     

      let response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/contact` , contactFormData,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Accept-Language": i18n.language,
          "Content-Type": "application/json",
        },
      })

      if (response.data.status === true) {
        const checkoutFormData = new FormData(); 
        checkoutFormData.append("payment_method_id", paymentMethod);

        const checkoutResponse = await dispatch(
          apiRequest({
            url: "api/checkout",
            method: "POST",
            entity: "addPaymentMethod",
            data: checkoutFormData,
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Accept-Language": i18n.language,
              "Content-Type": "application/json",
            },
          })
        );

 if (checkoutResponse.payload?.data?.status === true) {
          const { redirect_url, order_id } = checkoutResponse.payload.data.data;
        

          dispatch(apiRequest({
                  url: "api/cart",
                  entity: "carts",
                  headers: {
                    "Accept-Language": i18n.language,
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                  }
                }));
          
          if (redirect_url && redirect_url.trim() !== "") {
            // Redirect to payment gateway
            ////console.log("Redirecting to:", redirect_url);
            window.location.href = redirect_url;
          } else {
            // Cash payment - show success message and redirect to orders
            // toast.success(t("messages.checkout.success", { defaultValue: "تم الطلب بنجاح!" }));
            setTimeout(() => {
              navigate("/all-orders");
            }, 1500);
          }
        }


      }




    } catch (error) {
       toast.error(t("messages.checkout.error", { defaultValue: "حدث خطأ في إتمام الطلب" }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-container ">
      <div className="checkout-wrapper">
        <div className="checkout-header">
          <h1 className="checkout-title">{t("checkout.title")}</h1>
          <div className="checkout-steps">
            <div className="step active">
              <FiCheckCircle />
              <span>{t("checkout.step1")}</span>
            </div>
            <div className="step active">
              <FiCheckCircle />
              <span>{t("checkout.step2")}</span>
            </div>
            <div className="step">
              <FiCheckCircle />
              <span>{t("checkout.step3")}</span>
            </div>
          </div>
        </div>

        <div className="checkout-layout">
          <div className="checkout-form-section">
            <form onSubmit={handleSubmit} className="checkout-form">
              {/* Shipping Information */}
              <div className="form-section">
                <h3 className="section-title">
                  <FiMapPin className="section-icon" />
                  {t("checkout.shipping")}
                </h3>
                <div className="form-group">
                  <label className="form-label">
                    {i18n.language === "ar" ? "اختر المدينة" : "Select City"}
                  </label>
                  <div className="dropdown" ref={dropdownRef}>
                    <button
                      type="button"
                      className="form-input btn btn-outline-dark w-100 text-start d-flex justify-content-between align-items-center"
                      onClick={() => setIsZoneOpen(!isZoneOpen)}
                      style={{ color: selectedZone ? 'inherit' : 'inherit' }}
                    >
                      <span>
                        {selectedZone
                          ? selectedZone.name
                          : i18n.language === "ar" ? "اختر المدينة" : "Select City"}
                      </span>
                      <i className={`bi bi-chevron-${isZoneOpen ? "up" : "down"}`}></i>
                    </button>
                    {isZoneOpen && (
                      <div
                        style={{
                          height: "200px",
                          overflowY: "scroll",
                          overflowX: "hidden"
                        }}
                        className="dropdown-menu show w-100 p-2 mt-1"
                      >
                        <input
                          type="text"
                          className="form-control mb-2"
                          placeholder={i18n.language === "ar" ? "ابحث عن المدينة" : "Search City"}
                          value={zoneSearchQuery}
                          onChange={(e) => setZoneSearchQuery(e.target.value)}
                        />
                        {filteredCities?.map((city) => (
                          <button
                            key={city.id}
                            type="button"
                            className={`dropdown-item ${
                              selectedZone?.id === city.id ? "active" : ""
                            }`}
                            onClick={() => handleCitySelect(city)}
                          >
                            {city.name} - {city.price} EGP
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">{t("checkout.address")}</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder={i18n.language === "ar" ? "العنوان (8 أحرف على الأقل)" : "Address (at least 8 characters)"}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t("checkout.phone")}</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder={i18n.language === "ar" ? "رقم الهاتف (أرقام فقط)" : "Phone number (numbers only)"}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t("checkout.notes")}</label>
                  <textarea
                    name="order_note"
                    value={formData.order_note}
                    onChange={handleInputChange}
                    className="form-textarea"
                    rows="3"
                    placeholder={t("checkout.notesPlaceholder")}
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div className="form-section">
                <h3 className="section-title">
                  <FiCreditCard className="section-icon" />
                  {t("checkout.payment")}
                </h3>
                <div className="payment-methods">
                  {PaymentMethods?.data?.data?.map((method) => (
                    <div
                      key={method.id}
                      className={`payment-method ${
                        paymentMethod === method.id ? "active" : ""
                      }`}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <div className="method-radio">
                        {paymentMethod === method.id && (
                          <div className="radio-dot"></div>
                        )}
                      </div>
                      <div className="method-content">
                        <div className="method-title">{method.name}</div>
                        {method.type === "card" && (
                          <div className="method-icons">
                            <FaCcVisa />
                            <FaCcMastercard />
                          </div>
                        )}
                        {method.description && (
                          <div className="method-description">
                            {method.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                className="checkout-submit"
                disabled={!selectedZone || !paymentMethod || !formData.address.trim() || !formData.phone.trim() || isSubmitting}
              >
                {isSubmitting ? t("checkout.processing", { defaultValue: "جاري المعالجة..." }) : t("checkout.confirm")}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="checkout-summary-section">
            <div className="order-summary">
              <h3 className="summary-title">
                <FiShoppingBag className="summary-icon" />
                {t("checkout.orderSummary")}
              </h3>

              <div className="summary-total">
                <div className="total-row">
                  <span>{t("checkout.subtotal")}</span>
                  <span>
                    {CartSummery?.data?.data?.subtotal} {t("cart.currency")}
                  </span>
                </div>
                <div className="total-row">
                  <span>{t("checkout.shipping")}</span>
                  <span>
                    {CartSummery?.data?.data?.shipping_zone?.price || 0} {t("cart.currency")}
                  </span>
                </div>
                <div className="total-row">
                  <span>{i18n.language === "ar" ? "المنطقة" : "Place"}</span>
                  <span>
                    {CartSummery?.data?.data?.shipping_zone?.name }
                  </span>
                </div>
                <div className="total-row grand-total">
                  <span>{t("checkout.total")}</span>
                  <span>
                    {CartSummery?.data?.data?.total} {t("cart.currency")}
                  </span>
                </div>
              </div>

              <div className="shipping-info">
                <FiTruck className="shipping-icon" />
                <div className="shipping-text">
                  {t("checkout.shippingTime")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



