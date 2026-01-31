import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css";
import styles from "./OrderDetails.module.css";

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("global");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Return modal states
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [returnForm, setReturnForm] = useState({
    quantity: 1,
    reason_code: '',
    reason_text: '',
    return_address: '',
    payout_wallet_phone: ''
  });
  const [returnLoading, setReturnLoading] = useState(false);
  
  // Reason codes for return
  const reasonCodes = [
    { value: 1, label: i18n.language === "ar" ? "غيرت رأيي" : "Changed Mind" },
    { value: 2, label: i18n.language === "ar" ? "خطأ في طلبي" : "Order Mistake" },
    { value: 3, label: i18n.language === "ar" ? "عثرت على سعر أفضل" : "Found Better Price" },
    { value: 4, label: i18n.language === "ar" ? "عيوب في المنتج" : "Product Defect" },
    { value: 5, label: i18n.language === "ar" ? "تم إرسال سلعة خاطئة لي" : "Wrong Item Sent" },
    { value: 6, label: i18n.language === "ar" ? "وصول تالف" : "Damaged in Transit" },
    { value: 7, label: i18n.language === "ar" ? "مقاس خاطئ" : "Wrong Size" },
    { value: 8, label: i18n.language === "ar" ? "أخرى" : "Other" }
  ];
  useEffect(() => {
    window.scrollTo(0,0)
  }, []);
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/orders/${orderId}`, {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        
        
        if (!response.ok) {
          throw new Error("Failed to fetch order details");
        }
        
        const data = await response.json();
        // ////console.log({ressssssssssssssssssssssssssssssssssssssssssss:data});
        if (data.status) {
          setOrder(data.data);
        } else {
          throw new Error(data.message || "Failed to load order");
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, i18n.language]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return styles.statusConfirmed;
      case 'pending': return styles.statusPending;
      case 'cancelled': return styles.statusCancelled;
      case 'delivered': return styles.statusDelivered;
      default: return styles.statusDefault;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return styles.paymentPaid;
      case 'pending': return styles.paymentPending;
      case 'failed': return styles.paymentFailed;
      default: return styles.paymentDefault;
    }
  };

  // Handle return button click
  const handleReturnClick = useCallback((order, item) => {
    setSelectedItem({ order, item });
    setReturnForm({
      quantity: 1,
      reason_code: '',
      reason_text: '',
      return_address: '',
      payout_wallet_phone: ''
    });
    setShowReturnModal(true);
  }, []);

  // Handle return form submission
  const handleReturnSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validation
    if (!returnForm.reason_code) {
      toast.error(i18n.language === "ar" ? "يرجى اختيار سبب الاسترجاع" : "Please select a return reason");
      return;
    }
    
    if (returnForm.reason_code === "8" && !returnForm.reason_text.trim()) {
      toast.error(i18n.language === "ar" ? "يرجى كتابة سبب الاسترجاع" : "Please write the return reason");
      return;
    }
    
    if (!returnForm.return_address.trim()) {
      toast.error(i18n.language === "ar" ? "يرجى كتابة عنوان الاسترجاع" : "Please enter return address");
      return;
    }
    
    if (!returnForm.payout_wallet_phone.trim()) {
      toast.error(i18n.language === "ar" ? "يرجى كتابة رقم الهاتف" : "Please enter phone number");
      return;
    }

    // Phone validation (numbers only)
    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(returnForm.payout_wallet_phone)) {
      toast.error(i18n.language === "ar" ? "رقم الهاتف يجب أن يحتوي على أرقام فقط" : "Phone number should contain only numbers");
      return;
    }

    if (returnForm.quantity < 1) {
      toast.error(i18n.language === "ar" ? "الكمية يجب أن تكون أكبر من صفر" : "Quantity must be greater than zero");
      return;
    }

    if (returnForm.quantity > selectedItem.item.quantity) {
      toast.error(i18n.language === "ar" ? `لا يمكن استرجاع أكثر من ${selectedItem.item.quantity} قطعة` : `Cannot return more than ${selectedItem.item.quantity} items`);
      return;
    }

    try {
      setReturnLoading(true);
      
      const formData = new FormData();
      formData.append('quantity', parseInt(returnForm.quantity));
      formData.append('reason_code', parseInt(returnForm.reason_code));
      formData.append('order_item_id', selectedItem.item.item_id);
      formData.append('reason_text', returnForm.reason_code === "8" ? returnForm.reason_text : '');
      formData.append('return_address', returnForm.return_address);
      formData.append('payout_wallet_phone', returnForm.payout_wallet_phone);

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/orders/${selectedItem.order.id}/returns`,
        formData,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (response.data.status) {
        toast.success(i18n.language === "ar" ? "تم إرسال طلب الاسترجاع بنجاح" : "Return request submitted successfully");
        setShowReturnModal(false);
        // Refresh order details
        window.location.reload();
      } else {
        toast.error(response.data.message || (i18n.language === "ar" ? "حدث خطأ في إرسال طلب الاسترجاع" : "Error submitting return request"));
      }
    } catch (error) {
      console.error('Return error:', error);
      toast.error(error.response?.data?.message || (i18n.language === "ar" ? "حدث خطأ في إرسال طلب الاسترجاع" : "Error submitting return request"));
    } finally {
      setReturnLoading(false);
    }
  }, [returnForm, selectedItem, i18n.language]);

  // Handle form input changes
  const handleReturnFormChange = useCallback((field, value) => {
    setReturnForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>{t("orderDetails.loading", { defaultValue: "Loading order details..." })}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>{t("orderDetails.error", { defaultValue: "Error" })}</h2>
        <p>{error}</p>
        <button 
          className={styles.backButton}
          onClick={() => navigate(-1)}
        >
          {t("orderDetails.backToOrders", { defaultValue: "Back to Orders" })}
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.errorContainer}>
        <h2>{t("orderDetails.notFound", { defaultValue: "Order not found" })}</h2>
        <button 
          className={styles.backButton}
          onClick={() => navigate(-1)}
        >
          {t("orderDetails.backToOrders", { defaultValue: "Back to Orders" })}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={() => navigate(-1)}
        >
          ← {t("orderDetails.backToOrders", { defaultValue: "Back to Orders" })}
        </button>
        <h1 className={styles.title}>
          {t("orderDetails.title", { defaultValue: "Order Details" })} #{order.id}
        </h1>
      </div>

      <div className={styles.orderInfo}>
        <div className={styles.infoCard}>
          <h3>{t("orderDetails.orderInfo", { defaultValue: "Order Information" })}</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t("orderDetails.orderNumber", { defaultValue: "Order Number" })}:</span>
              <span className={styles.infoValue}>#{order.id}</span>
            </div>
                         <div className={styles.infoItem}>
               <span className={styles.infoLabel}>{t("orderDetails.statusLabel", { defaultValue: "Status" })}:</span>
               <span className={`${styles.statusBadge} ${getStatusColor(order.status)}`}>
                 {t(`orderDetails.status.${order.status}`, { defaultValue: order.status })}
               </span>
             </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t("orderDetails.paymentStatus", { defaultValue: "Payment Status" })}:</span>
              <span className={`${styles.paymentBadge} ${getPaymentStatusColor(order.payment_status)}`}>
                {t(`orderDetails.payment.${order.payment_status}`, { defaultValue: order.payment_status })}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t("orderDetails.paymentMethod", { defaultValue: "Payment Method" })}:</span>
              <span className={styles.infoValue}>{order.payment_method}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t("orderDetails.orderDate", { defaultValue: "Order Date" })}:</span>
              <span className={styles.infoValue}>{formatDate(order.created_at)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t("orderDetails.deliveryDate", { defaultValue: "Delivery Date" })}:</span>
              <span className={styles.infoValue}>{formatDate(order.delivered_at)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t("orderDetails.shippingZone", { defaultValue: "Shipping Zone" })}:</span>
              <span className={styles.infoValue}>{order.shipping_zone}</span>
            </div>
          </div>
        </div>

        <div className={styles.infoCard}>
          <h3>{t("orderDetails.contactInfo", { defaultValue: "Contact Information" })}</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t("orderDetails.address", { defaultValue: "Address" })}:</span>
              <span className={styles.infoValue}>{order.contact?.address || "-"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t("orderDetails.phone", { defaultValue: "Phone" })}:</span>
              <span className={styles.infoValue}>{order.contact?.phone || "-"}</span>
            </div>
            {order.contact?.order_note && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t("orderDetails.orderNote", { defaultValue: "Order Note" })}:</span>
                <span className={styles.infoValue}>{order.contact.order_note}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.productsSection}>
        <h2>{t("orderDetails.products", { defaultValue: "Products" })}</h2>
        <div className={styles.productsList}>
          {order.items.map((item, index) => (
            <div key={index} className={styles.productCard}>
              <div className={styles.productInfo}>
                <h4 className={styles.productName}>{item.name}</h4>
                <div className={styles.productId}>
                  {t("orderDetails.productId", { defaultValue: "Product ID" })}: {item.product_id}
                 
                </div>
                <p></p>
                
                {item.variant_item && (
                  <div className={styles.variants}>
                    <h5>{t("orderDetails.variants", { defaultValue: "Variants" })}:</h5>
                    <div className={styles.variantList}>
                      {item.variant_item.selections.map((selection, idx) => (
                        <div key={idx} className={styles.variantItem}>
                          <span className={styles.variantName}>{selection.variant}:</span>
                          <span className={styles.variantValue}>
                            {selection.value}
                            {selection.meta?.code && (
                              <span 
                                className={styles.colorSwatch}
                                style={{ backgroundColor: selection.meta.code }}
                                title={selection.meta.code}
                              ></span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.productPricing}>
                <div className={styles.priceInfo}>
                  <div className={styles.priceRow}>
                    <span>{t("orderDetails.quantity", { defaultValue: "Quantity" })}:</span>
                    <span className={styles.quantity}>{item.quantity}</span>
                  </div>
                  <div className={styles.priceRow}>
                    <span>{i18n.language === "ar" ? "السعر الأصلي" : "Original Price"}:</span>
                    <span className={styles.price}>
                      {item.price_before} {t("products.currency", { defaultValue: "EGP" })}
                    </span>
                  </div>
                  {item.discount_amount > 0 && (
                    <div className={styles.priceRow}>
                      <span>{t("orderDetails.discount", { defaultValue: "Discount" })}:</span>
                      <span className={styles.discount}>
                        {item.discount_amount} {t("products.currency", { defaultValue: "EGP" })}
                      </span>
                    </div>
                  )}
                  <div className={styles.priceRow}>
                    <span>{t("orderDetails.unitPrice", { defaultValue: "Unit Price After Discount" })}:</span>
                    <span className={styles.price}>
                      {item.price_after} {t("products.currency", { defaultValue: "EGP" })}
                    </span>
                  </div>
                 
                  <div className={styles.priceRow}>
                    <span>{t("orderDetails.subtotal", { defaultValue: "Subtotal" })}:</span>
                    <span className={styles.subtotal}>
                      {item.price_after * item.quantity} {t("products.currency", { defaultValue: "EGP" })}
                    </span>
                  </div>
                </div>
                
                {/* Return Button */}
                {order.status === "delivered" && !item.has_user_return && (
                  <div className={styles.returnButtonContainer}>
                    <button
                      className={styles.returnButton}
                      onClick={() => handleReturnClick(order, item)}
                      title={i18n.language === "ar" ? "طلب استرجاع" : "Return Item"}
                    >
                      <i className="bi bi-arrow-return-left"></i>
                      {i18n.language === "ar" ? "استرجاع" : "Return"}
                    </button>
                  </div>
                )}
                
                {order.status === "delivered" && item.has_user_return && (
                  <div className={styles.returnStatus}>
                    <span className={styles.returnRequested}>
                      <i className="bi bi-check-circle"></i>
                      {i18n.language === "ar" ? "تم طلب الاسترجاع" : "Return Requested"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.summarySection}>
        <div className={styles.summaryCard}>
          <h3>{t("orderDetails.orderSummary", { defaultValue: "Order Summary" })}</h3>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryRow}>
              <span>{t("orderDetails.subtotal", { defaultValue: "Subtotal" })}:</span>
              <span>{order.subtotal} {t("products.currency", { defaultValue: "EGP" })}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>{t("orderDetails.shipping", { defaultValue: "Shipping" })}:</span>
              <span>{order.shipping_price} {t("products.currency", { defaultValue: "EGP" })}</span>
            </div>
            {order.discount > 0 && (
              <div className={styles.summaryRow}>
                <span>{t("orderDetails.discount", { defaultValue: "Discount" })}:</span>
                <span className={styles.discountAmount}>
                  -{order.discount} {t("products.currency", { defaultValue: "EGP" })}
                </span>
              </div>
            )}
            {order.coupon && (
              <div className={styles.summaryRow}>
                <span>{t("orderDetails.coupon", { defaultValue: "Coupon" })} ({order.coupon.code}):</span>
                <span className={styles.discountAmount}>
                  -{order.coupon.amount} {t("products.currency", { defaultValue: "EGP" })}
                </span>
              </div>
            )}
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span>{t("orderDetails.total", { defaultValue: "Total" })}:</span>
              <span className={styles.totalAmount}>
                {order.total} {t("products.currency", { defaultValue: "EGP" })}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Return Modal */}
      {showReturnModal && selectedItem && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h5 className={styles.modalTitle}>
                <i className="bi bi-arrow-return-left"></i>
                {i18n.language === "ar" ? "طلب استرجاع المنتج" : "Return Product Request"}
              </h5>
              <button 
                type="button" 
                className={styles.modalCloseButton} 
                onClick={() => setShowReturnModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleReturnSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.alertInfo}>
                  <h6><i className="bi bi-info-circle"></i>{i18n.language === "ar" ? "تفاصيل المنتج" : "Product Details"}</h6>
                  <p><strong>{i18n.language === "ar" ? "المنتج:" : "Product:"}</strong> {selectedItem.item.name}</p>
                  <p><strong>{i18n.language === "ar" ? "الكمية المتاحة:" : "Available Quantity:"}</strong> {selectedItem.item.quantity}</p>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <i className="bi bi-hash"></i>
                      {i18n.language === "ar" ? "الكمية المراد استرجاعها" : "Return Quantity"}
                    </label>
                    <input
                      type="number"
                      className={styles.formControl}
                      min="1"
                      max={selectedItem.item.quantity}
                      value={returnForm.quantity}
                      onChange={(e) => handleReturnFormChange('quantity', e.target.value)}
                      placeholder={`Max: ${selectedItem.item.quantity}`}
                      required
                    />
                    <div className={styles.formText}>
                      <i className="bi bi-info-circle"></i>
                      {i18n.language === "ar" ? `أقصى كمية للاسترجاع: ${selectedItem.item.quantity}` : `Maximum returnable quantity: ${selectedItem.item.quantity}`}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <i className="bi bi-exclamation-triangle"></i>
                      {i18n.language === "ar" ? "سبب الاسترجاع" : "Return Reason"}
                    </label>
                    <select
                      className={styles.formControl}
                      value={returnForm.reason_code}
                      onChange={(e) => handleReturnFormChange('reason_code', e.target.value)}
                      required
                    >
                      <option value="">{i18n.language === "ar" ? "اختر السبب" : "Select Reason"}</option>
                      {reasonCodes.map((reason) => (
                        <option key={reason.value} value={reason.value}>
                          {reason.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {returnForm.reason_code === "8" && (
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <i className="bi bi-chat-text"></i>
                      {i18n.language === "ar" ? "اشرح السبب" : "Explain the Reason"}
                    </label>
                    <textarea
                      className={styles.formControl}
                      rows="3"
                      value={returnForm.reason_text}
                      onChange={(e) => handleReturnFormChange('reason_text', e.target.value)}
                      placeholder={i18n.language === "ar" ? "اكتب السبب هنا..." : "Write the reason here..."}
                      required
                    />
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <i className="bi bi-geo-alt"></i>
                    {i18n.language === "ar" ? "عنوان الاسترجاع" : "Return Address"}
                  </label>
                  <textarea
                    className={styles.formControl}
                    rows="3"
                    value={returnForm.return_address}
                    onChange={(e) => handleReturnFormChange('return_address', e.target.value)}
                    placeholder={i18n.language === "ar" ? "اكتب عنوان الاسترجاع..." : "Enter return address..."}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <i className="bi bi-telephone"></i>
                    {i18n.language === "ar" ? "رقم الهاتف" : "Phone Number"}
                  </label>
                  <input
                    type="tel"
                    className={styles.formControl}
                    value={returnForm.payout_wallet_phone}
                    onChange={(e) => {
                      // Only allow numbers
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      handleReturnFormChange('payout_wallet_phone', value);
                    }}
                    placeholder={i18n.language === "ar" ? "رقم الهاتف..." : "Phone number..."}
                    required
                  />
                  <div className={styles.formText}>
                    {i18n.language === "ar" ? "أرقام فقط" : "Numbers only"}
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button 
                  type="button" 
                  className={styles.btnSecondary} 
                  onClick={() => setShowReturnModal(false)}
                >
                  <i className="bi bi-x"></i>
                  {i18n.language === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button 
                  type="submit" 
                  className={styles.btnWarning}
                  disabled={returnLoading}
                >
                  {returnLoading ? (
                    <>
                      <span className={styles.spinner}></span>
                      {i18n.language === "ar" ? "جاري الإرسال..." : "Submitting..."}
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send"></i>
                      {i18n.language === "ar" ? "إرسال طلب الاسترجاع" : "Submit Return Request"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
