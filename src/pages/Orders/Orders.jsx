

import React, { useEffect, useState, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import Pagination from "../../components/Pagination";
import "./Orders.css";

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  
  // Comment states
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [commentForm, setCommentForm] = useState({
    rating: 0,
    comment: '',
    order_id: ''
  });
  const [commentLoading, setCommentLoading] = useState(false);
  
  // Pagination states (orders)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [ordersPerPage] = useState(5);
  
  const { t, i18n } = useTranslation("global");
  const isRTL = i18n.language === "ar";

  // Fetch orders with pagination
  const fetchOrders = useCallback(async (page = 1) => {
    const token = localStorage.getItem("token");
    
    // Check if user is logged in
    if (!token) {
      setError("unauthorized");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/orders?page=${page}&per_page=${ordersPerPage}`, {
        headers: {
          Accept: "application/json",
          "Accept-Language": i18n.language,
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("token");
        setError("unauthorized");
        return;
      }

      const data = await response.json();
      if (data && data.data) {
        setOrders(data.data);
        
        // Handle pagination from separate pagination object
        if (data.pagination) {
          setTotalPages(data.pagination.last_page || 1);
          setTotalOrders(data.pagination.total || 0);
          setCurrentPage(data.pagination.current_page || 1);
          
          
        } else {
          // Fallback for old API structure
        setTotalPages(data.last_page || 1);
        setTotalOrders(data.total || 0);
        setCurrentPage(data.current_page || 1);
        
          // console.log('API Response (old format):', data);
        }
      } else {
        setOrders([]);
        setTotalPages(1);
        setTotalOrders(0);
        setCurrentPage(1);
      }
      setError(null);
    } catch (err) {
      console.error(err);
      setError("network");
    } finally {
      setLoading(false);
    }
  }, [i18n.language, ordersPerPage]);


  useEffect(() => {
      fetchOrders(currentPage);
  }, [fetchOrders, currentPage]);

  // Reason codes for return
  const reasonCodes = [
    { value: 1, label: isRTL ? "غيرت رأيي" : "Changed Mind" },
    { value: 2, label: isRTL ? "خطأ في طلبي" : "Order Mistake" },
    { value: 3, label: isRTL ? "عثرت على سعر أفضل" : "Found Better Price" },
    { value: 4, label: isRTL ? "عيوب في المنتج" : "Product Defect" },
    { value: 5, label: isRTL ? "تم إرسال سلعة خاطئة لي" : "Wrong Item Sent" },
    { value: 6, label: isRTL ? "وصول تالف" : "Damaged in Transit" },
    { value: 7, label: isRTL ? "مقاس خاطئ" : "Wrong Size" },
    { value: 8, label: isRTL ? "أخرى" : "Other" }
  ];

  // Get status display text
  const getStatusDisplay = (status) => {
    const statusMap = {
      'confirmed': isRTL ? 'تم التأكيد' : 'Confirmed',
      'pending_payment': isRTL ? 'في انتظار الدفع' : 'Pending Payment',
      'pending': isRTL ? 'في الانتظار' : 'Pending',
      'delivered': isRTL ? 'تم التوصيل' : 'Delivered',
      'تم التوصيل': isRTL ? 'تم التوصيل' : 'Delivered',
      'cancelled': isRTL ? 'ملغي' : 'Cancelled',
      'refunded': isRTL ? 'مسترد' : 'Refunded'
    };
    return statusMap[status] || status;
  };

  // Get payment status display text
  const getPaymentStatusDisplay = (status) => {
    const paymentMap = {
      'paid': isRTL ? 'مدفوع' : 'Paid',
      'pending': isRTL ? 'في انتظار الدفع' : 'Pending',
      'failed': isRTL ? 'فشل الدفع' : 'Failed',
      'refunded': isRTL ? 'مسترد' : 'Refunded'
    };
    return paymentMap[status] || status;
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
      toast.error(isRTL ? "يرجى اختيار سبب الاسترجاع" : "Please select a return reason");
      return;
    }
    
    if (returnForm.reason_code === "8" && !returnForm.reason_text.trim()) {
      toast.error(isRTL ? "يرجى كتابة سبب الاسترجاع" : "Please write the return reason");
      return;
    }
    
    if (!returnForm.return_address.trim()) {
      toast.error(isRTL ? "يرجى كتابة عنوان الاسترجاع" : "Please enter return address");
      return;
    }
    
    if (!returnForm.payout_wallet_phone.trim()) {
      toast.error(isRTL ? "يرجى كتابة رقم الهاتف" : "Please enter phone number");
      return;
    }

    // Phone validation (numbers only)
    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(returnForm.payout_wallet_phone)) {
      toast.error(isRTL ? "رقم الهاتف يجب أن يحتوي على أرقام فقط" : "Phone number should contain only numbers");
      return;
    }

    if (returnForm.quantity < 1) {
      toast.error(isRTL ? "الكمية يجب أن تكون أكبر من صفر" : "Quantity must be greater than zero");
      return;
    }

    if (returnForm.quantity > selectedItem.item.quantity) {
      toast.error(isRTL ? `لا يمكن استرجاع أكثر من ${selectedItem.item.quantity} قطعة` : `Cannot return more than ${selectedItem.item.quantity} items`);
      return;
    }

    try {
      setReturnLoading(true);
      // console.log({selectedItem});
      
      
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
        toast.success(isRTL ? "تم إرسال طلب الاسترجاع بنجاح" : "Return request submitted successfully");
        setShowReturnModal(false);
        // Refresh orders
        window.location.reload();
      } else {
        toast.error(response.data.message || (isRTL ? "حدث خطأ في إرسال طلب الاسترجاع" : "Error submitting return request"));
      }
    } catch (error) {
      console.error('Return error:', error);
      toast.error(error.response?.data?.message || (isRTL ? "حدث خطأ في إرسال طلب الاسترجاع" : "Error submitting return request"));
    } finally {
      setReturnLoading(false);
    }
  }, [returnForm, selectedItem, i18n.language, isRTL]);

  // Handle form input changes
  const handleReturnFormChange = useCallback((field, value) => {
    setReturnForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handle comment button click
  const handleCommentClick = useCallback((order) => {
    setSelectedOrder(order);
    setCommentForm({
      rating: 0,
      comment: '',
      order_id: order.id
    });
    setShowCommentModal(true);
  }, []);

  // Handle comment form submission
  const handleCommentSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validation
    if (!commentForm.rating || commentForm.rating < 1 || commentForm.rating > 5) {
      toast.error(isRTL ? "يرجى اختيار تقييم من 1 إلى 5" : "Please select a rating from 1 to 5");
      return;
    }
    
    if (!commentForm.comment.trim()) {
      toast.error(isRTL ? "يرجى كتابة تعليق" : "Please write a comment");
      return;
    }

    try {
      setCommentLoading(true);
      
      const formData = new FormData();
      formData.append('rating', parseInt(commentForm.rating));
      formData.append('comment', commentForm.comment);
      formData.append('order_id', parseInt(commentForm.order_id));

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/comments`,
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
        toast.success(isRTL ? "تم إرسال التعليق بنجاح" : "Comment submitted successfully");
        setShowCommentModal(false);
        // Refresh orders
        fetchOrders(currentPage);
      } else {
        toast.error(response.data.message || (isRTL ? "حدث خطأ في إرسال التعليق" : "Error submitting comment"));
      }
    } catch (error) {
      console.error('Comment error:', error);
      toast.error(error.response?.data?.message || (isRTL ? "حدث خطأ في إرسال التعليق" : "Error submitting comment"));
    } finally {
      setCommentLoading(false);
    }
  }, [commentForm, i18n.language, isRTL, fetchOrders, currentPage]);

  // Handle comment form input changes
  const handleCommentFormChange = useCallback((field, value) => {
    setCommentForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handle page change (orders)
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchOrders(page);
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="container my-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">{t("common.loading", { defaultValue: "جاري التحميل..." })}</p>
        </div>
      </div>
    );
  }

  // Handle unauthorized access
  if (error === "unauthorized") {
    return (
      <div className="container my-4">
        <div className="text-center">
          <div className="alert alert-warning" role="alert">
            <h4 className="alert-heading">{t("orders.loginRequired", { defaultValue: "تسجيل الدخول مطلوب" })}</h4>
            <p>{t("orders.loginRequiredMessage", { defaultValue: "يجب عليك تسجيل الدخول لعرض طلباتك" })}</p>
            <hr />
            <div className="d-flex justify-content-center gap-3">
              <Link to="/login" className="btn btn-primary">
                {t("auth.login", { defaultValue: "تسجيل الدخول" })}
              </Link>
              <Link to="/register" className="btn btn-outline-primary">
                {t("auth.register", { defaultValue: "إنشاء حساب" })}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle network error
  if (error === "network") {
    return (
      <div className="container my-4">
        <div className="text-center">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">{t("common.error", { defaultValue: "خطأ" })}</h4>
            <p>{t("orders.networkError", { defaultValue: "حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى" })}</p>
            <button 
              className="btn btn-outline-danger"
              onClick={() => window.location.reload()}
            >
              {t("common.retry", { defaultValue: "إعادة المحاولة" })}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container-fluid my-4" dir={isRTL ? "rtl" : "ltr"}>
      <div className="row justify-content-center">
        <div className="col-12 ">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-secondary text-white text-center py-4">
              <h2 className="mb-0 fw-bold">
                <i className="bi bi-bag mx-3"></i>
                {t("orders.title")}
              </h2>
            </div>
            

            <div className="card-body container p-4">
                  {orders.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-4">
                    <i className="bi bi-cart-x text-muted" style={{ fontSize: '4rem' }}></i>
                  </div>
                  <h4 className="text-muted mb-3">{t("orders.noOrders", { defaultValue: "لا توجد طلبات بعد" })}</h4>
                  <p className="text-muted mb-4">{t("orders.noOrdersMessage", { defaultValue: "لم تقم بإنشاء أي طلبات حتى الآن" })}</p>
                  <Link to="/" className="btn btn-primary btn-lg">
                    <i className="bi bi-bag mx-2"></i>
                    {t("orders.startShopping", { defaultValue: "ابدأ التسوق" })}
                  </Link>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="card mb-4 shadow-sm border-0">
                    <div className="card-header bg-dark text-white">
                      <div className="row align-items-center">
                        <div className="col-md-6">
                          <h5 className="mb-1">
                            <i className="bi bi-receipt mx-2"></i>
                            {t("orders.orderNumber")} #{order.id}
                          </h5>
                          <small className="d-block">
                            <i className="bi bi-calendar mx-1"></i>
                            {new Date(order.created_at).toLocaleDateString(i18n.language)}{" "}
                            {new Date(order.created_at).toLocaleTimeString(i18n.language)}
                          </small>
                          <small className="d-block">
                            <i className="bi bi-box mx-1"></i>
                            {order.items.length} {order.items.length === 1 ? (isRTL ? 'عنصر' : 'item') : (isRTL ? 'عناصر' : 'items')}
                          </small>
                        </div>
                        <div className="col-md-6 text-md-end">
                          <div className="d-flex flex-wrap justify-content-md-end gap-3">
                            <div className="custom-badge status-badge">
                              <div className="badge-icon">
                                <i className="bi bi-info-circle pt-1"></i>
                              </div>
                              <div className="badge-content">
                                <span className="badge-label">{t("orders.status")}</span>
                                <span className="badge-value">{getStatusDisplay(order.status)}</span>
                              </div>
                            </div>
                            <div className="custom-badge payment-badge">
                              <div className="badge-icon">
                                <i className="bi bi-credit-card pt-1"></i>
                              </div>
                              <div className="badge-content">
                                <span className="badge-label">Payment</span>
                                <span className="badge-value">{getPaymentStatusDisplay(order.payment_status)}</span>
                              </div>
                            </div>
                            {order.delivered_at && (
                              <div className="custom-badge delivery-badge">
                                <div className="badge-icon">
                                  <i className="bi bi-truck"></i>
                                </div>
                                <div className="badge-content">
                                  <span className="badge-label">Delivery</span>
                                  <span className="badge-value">{order.delivered_at}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead className="table-light">
                            <tr>
                              <th><i className="bi bi-box mx-2"></i>{t("orders.product")}</th>
                              <th><i className="bi bi-list mx-2"></i>{t("orders.variants")}</th>
                              <th><i className="bi bi-currency-dollar mx-2"></i>{t("orders.price")}</th>
                              <th><i className="bi bi-hash mx-2"></i>{t("orders.qty")}</th>
                              <th><i className="bi bi-calculator mx-2"></i>{t("orders.subtotal")}</th>
                              <th><i className="bi bi-arrow-return-left mx-2"></i>{t("orders.actions")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map((item, idx) => (
                              <tr key={idx}>
                                <td className="align-middle">
                                  <div className="fw-semibold">{item.name}</div>
                                </td>
                                <td className="align-middle">
                                  {item.variant_item ? (
                                    <div className="variants-container">
                                      {item.variant_item.selections.map((s, i) => (
                                        <div key={i} className="variant-item">
                                          <div className="variant-badge">
                                            <span className="variant-icon">
                                              {s.variant === 'Color' ? 'COLOR' : 
                                               s.variant === 'Storage' ? 'STORAGE' : 
                                               s.variant === 'RAM' ? 'RAM' : 
                                               s.variant === 'Size' ? 'SIZE' : 
                                               s.variant === 'Owner' ? 'OWNER' : 
                                               s.variant === 'Weight' ? 'WEIGHT' : 
                                               s.variant.toUpperCase()}
                                            </span>
                                          </div>
                                          <span className="variant-text">{s.value}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="no-variants">
                                      <span className="text-muted">No variants</span>
                                    </div>
                                  )}
                                </td>
                                <td className="align-middle">
                                  <span className="fw-bold text-success">
                                    {item.price_after} {t("products.currency")}
                                  </span>
                                </td>
                                <td className="align-middle text-center">
                                  <div className="custom-badge quantity-badge ">
                                    <div className="badge-icon ">
                                      <i className="bi bi-hash pt-1"></i>
                                    </div>
                                    <div className="badge-content  ">
                                      <span className="badge-value">{item.quantity}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="align-middle">
                                  <span className="fw-bold text-success">
                                    {item.price_after * item.quantity} {t("products.currency")}
                                  </span>
                                </td>
                                <td className="align-middle text-center">
                                  {(order.status === "تم التوصيل" || order.status === "delivered") && !item.has_user_return && (
                                    <button
                                      className="btn btn-outline-warning btn-sm"
                                      onClick={() => handleReturnClick(order, item)}
                                      title={isRTL ? "طلب استرجاع" : "Return Item"}
                                    >
                                      <i className="bi bi-arrow-return-left mx-1"></i>
                                      {isRTL ? "استرجاع" : "Return"}
                                    </button>
                                  )}
                                  {(order.status === "تم التوصيل" || order.status === "delivered") && item.has_user_return && (
                                    <span className=" text-dark">
                                      <i className="bi bi-check-circle mx-1"></i>
                                      {isRTL ? "تم طلب الاسترجاع" : "Return Requested"}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                        <div className="fw-bold fs-5">
                          <i className="bi bi-receipt mx-2"></i>
                          {t("orders.total")}: 
                          <span className="text-success ms-2">
                            {order.total} {t("products.currency")}
                          </span>
                        </div>
                        <div className="d-flex gap-2">
                          <Link 
                            to={`/order-details/${order.id}`}
                            className="btn btn-outline-primary"
                          >
                            <i className="bi bi-eye mx-1"></i>
                            {t("orders.viewDetails", { defaultValue: "View Details" })}
                          </Link>
                          {(order.status === "تم التوصيل" || order.status === "delivered") && (
                            <button
                              className="btn btn-outline-success"
                              onClick={() => handleCommentClick(order)}
                              title={isRTL ? "إضافة تعليق وتقييم" : "Add Comment & Rating"}
                            >
                              <i className="bi bi-star mx-1"></i>
                              {isRTL ? "تقييم" : "Rate & Comment"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
                  {/* Pagination */}
                  {orders.length > 0 && totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      totalItems={totalOrders}
                      itemsPerPage={ordersPerPage}
                      showInfo={true}
                    />
                  )}

            </div>

            </div>
          </div>
        </div>
      </div>

      {/* Return Modal */}
      {showReturnModal && selectedItem && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark w-100 w-md-auto">
                <h5 className="modal-title w-100 w-md-auto">
                  <i className="bi bi-arrow-return-left mx-2"></i>
                  {isRTL ? "طلب استرجاع المنتج" : "Return Product Request"}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowReturnModal(false)}
                ></button>
              </div>
              <form onSubmit={handleReturnSubmit}>
                <div className="modal-body">
                  <div className="alert alert-info">
                    <h6><i className="bi bi-info-circle mx-2"></i>{isRTL ? "تفاصيل المنتج" : "Product Details"}</h6>
                    <p className="mb-1"><strong>{isRTL ? "المنتج:" : "Product:"}</strong> {selectedItem.item.name}</p>
                    <p className="mb-0"><strong>{isRTL ? "الكمية المتاحة:" : "Available Quantity:"}</strong> {selectedItem.item.quantity}</p>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        <i className="bi bi-hash mx-1"></i>
                        {isRTL ? "الكمية المراد استرجاعها" : "Return Quantity"}
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        max={selectedItem.item.quantity}
                        value={returnForm.quantity}
                        onChange={(e) => handleReturnFormChange('quantity', e.target.value)}
                        placeholder={`Max: ${selectedItem.item.quantity}`}
                        required
                      />
                      <div className="form-text">
                        <i className="bi bi-info-circle me-1"></i>
                        {isRTL ? `أقصى كمية للاسترجاع: ${selectedItem.item.quantity}` : `Maximum returnable quantity: ${selectedItem.item.quantity}`}
                      </div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        <i className="bi bi-exclamation-triangle mx-1"></i>
                        {isRTL ? "سبب الاسترجاع" : "Return Reason"}
                      </label>
                      <select
                        className="form-select"
                        value={returnForm.reason_code}
                        onChange={(e) => handleReturnFormChange('reason_code', e.target.value)}
                        required
                      >
                        <option value="">{isRTL ? "اختر السبب" : "Select Reason"}</option>
                        {reasonCodes.map((reason) => (
                          <option key={reason.value} value={reason.value}>
                            {reason.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {returnForm.reason_code === "8" && (
                      <div className="col-12 mb-3">
                        <label className="form-label">
                          <i className="bi bi-chat-text mx-1"></i>
                          {isRTL ? "اشرح السبب" : "Explain the Reason"}
                        </label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={returnForm.reason_text}
                          onChange={(e) => handleReturnFormChange('reason_text', e.target.value)}
                          placeholder={isRTL ? "اكتب السبب هنا..." : "Write the reason here..."}
                          required
                        />
                        <div className="form-text">
                          <i className="bi bi-info-circle me-1"></i>
                          {isRTL ? "يرجى كتابة سبب الاسترجاع بالتفصيل" : "Please write the return reason in detail"}
                        </div>
                      </div>
                    )}

                    <div className="col-12 mb-3">
                      <label className="form-label">
                        <i className="bi bi-geo-alt mx-1"></i>
                        {isRTL ? "عنوان الاسترجاع" : "Return Address"}
                      </label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={returnForm.return_address}
                        onChange={(e) => handleReturnFormChange('return_address', e.target.value)}
                        placeholder={isRTL ? "اكتب عنوان الاسترجاع..." : "Enter return address..."}
                        required
                      />
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label">
                        <i className="bi bi-telephone mx-1"></i>
                        {isRTL ? "رقم الهاتف" : "Phone Number"}
                      </label>
                      <input
                        type="tel"
                        className={`form-control ${isRTL ? 'rtl-input text-end' : ''}`}
                        value={returnForm.payout_wallet_phone}
                        onChange={(e) => {
                          // Only allow numbers
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          handleReturnFormChange('payout_wallet_phone', value);
                        }}
                        placeholder={isRTL ? "رقم الهاتف..." : "Phone number..."}
                        required
                      />
                      <div className="form-text">
                        {isRTL ? "أرقام فقط" : "Numbers only"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowReturnModal(false)}
                  >
                    <i className="bi bi-x mx-1"></i>
                    {isRTL ? "إلغاء" : "Cancel"}
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-warning"
                    disabled={returnLoading}
                  >
                    {returnLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm mx-2" role="status"></span>
                        {isRTL ? "جاري الإرسال..." : "Submitting..."}
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send mx-1"></i>
                        {isRTL ? "إرسال طلب الاسترجاع" : "Submit Return Request"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && selectedOrder && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-success text-white w-100 w-md-auto">
                <h5 className="modal-title w-100 w-md-auto">
                  <i className="bi bi-star mx-2"></i>
                  {isRTL ? "تقييم الطلب" : "Rate & Comment Order"}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowCommentModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCommentSubmit}>
                <div className="modal-body">
                  <div className="alert alert-info">
                    <h6><i className="bi bi-info-circle mx-2"></i>{isRTL ? "تفاصيل الطلب" : "Order Details"}</h6>
                    <p className="mb-1"><strong>{isRTL ? "رقم الطلب:" : "Order Number:"}</strong> #{selectedOrder.id}</p>
                    <p className="mb-0"><strong>{isRTL ? "المجموع:" : "Total:"}</strong> {selectedOrder.total} {t("products.currency")}</p>
                  </div>

                  <div className="row">
                    <div className="col-12 mb-3">
                      <label className="form-label">
                        <i className="bi bi-star mx-1"></i>
                        {isRTL ? "التقييم" : "Rating"}
                        <span className="text-danger ms-1">*</span>
                      </label>
                      <div className="d-flex align-items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`btn btn-sm p-0 border-0 bg-transparent ${commentForm.rating >= star ? 'text-warning' : 'text-muted'}`}
                            onClick={() => handleCommentFormChange('rating', star)}
                            style={{ fontSize: '20px' }}
                            title={`${star} ${star === 1 ? (isRTL ? 'نجمة' : 'star') : (isRTL ? 'نجوم' : 'stars')}`}
                          >
                            <i className="bi bi-star-fill"></i>
                          </button>
                        ))}
                        {commentForm.rating > 0 && (
                          <span className="ms-2 text-muted">
                            {/* ({commentForm.rating}/5) */}
                          </span>
                        )}
                      </div>
                      <div className="form-text">
                        <i className="bi bi-info-circle me-1"></i>
                        {isRTL ? "انقر على النجوم لتقييم الطلب" : "Click on stars to rate the order"}
                      </div>
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label">
                        <i className="bi bi-chat-text mx-1"></i>
                        {isRTL ? "التعليق" : "Comment"}
                        <span className="text-danger ms-1">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        rows="5"
                        value={commentForm.comment}
                        onChange={(e) => handleCommentFormChange('comment', e.target.value)}
                        placeholder={isRTL ? "اكتب تعليقك هنا..." : "Write your comment here..."}
                        required
                      />
                      <div className="form-text">
                        <i className="bi bi-info-circle me-1"></i>
                        {isRTL ? "شاركنا رأيك حول تجربتك مع هذا الطلب" : "Share your experience with this order"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowCommentModal(false)}
                  >
                    <i className="bi bi-x mx-1"></i>
                    {isRTL ? "إلغاء" : "Cancel"}
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-success"
                    disabled={commentLoading || !commentForm.rating || !commentForm.comment.trim()}
                  >
                    {commentLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm mx-2" role="status"></span>
                        {isRTL ? "جاري الإرسال..." : "Submitting..."}
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send mx-1"></i>
                        {isRTL ? "إرسال التعليق" : "Submit Comment"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(OrdersList);
