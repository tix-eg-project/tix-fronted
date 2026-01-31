import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import "bootstrap-icons/font/bootstrap-icons.css";
import {
  FiEdit,
  FiUser,
  FiShoppingBag,
  FiLogOut,
} from "react-icons/fi";
import latop from "../../assests/imgs/22.svg";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination";

import "./Profile.css";

const Profile = () => {
  const { t, i18n } = useTranslation("global");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orders");
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  // Returns state
  const [returnsList, setReturnsList] = useState([]);
  const [returnsLoading, setReturnsLoading] = useState(false);
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
  const [orderComments, setOrderComments] = useState({}); // Store comments for each order { orderId: [comments] }
  const [commentsLoading, setCommentsLoading] = useState({}); // Loading state for each order
  
  // Pagination states (orders)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [ordersPerPage] = useState(5);
  // Pagination states (returns)
  const [returnsPage, setReturnsPage] = useState(1);
  const [returnsTotalPages, setReturnsTotalPages] = useState(1);
  const [returnsTotalItems, setReturnsTotalItems] = useState(0);
  const [returnsPerPage] = useState(10);
  const [profileData, setProfileData] = useState({
    id: null,
    name: "",
    email: "",
    phone: "",
    address: "",
    image: "",
    avatar: latop,
  });
  const [tempProfileData, setTempProfileData] = useState({ ...profileData });

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

  // Get status display text
  const getStatusDisplay = (status) => {
    const statusMap = {
      'confirmed': i18n.language === "ar" ? 'تم التأكيد' : 'Confirmed',
      'pending_payment': i18n.language === "ar" ? 'في انتظار الدفع' : 'Pending Payment',
      'pending': i18n.language === "ar" ? 'في الانتظار' : 'Pending',
      'delivered': i18n.language === "ar" ? 'تم التوصيل' : 'Delivered',
      'Delivered': i18n.language === "ar" ? 'تم التوصيل' : 'Delivered',
      'تم التوصيل': i18n.language === "ar" ? 'تم التوصيل' : 'Delivered',
      'cancelled': i18n.language === "ar" ? 'ملغي' : 'Cancelled',
      'refunded': i18n.language === "ar" ? 'مسترد' : 'Refunded'
    };
    return statusMap[status] || status;
  };

  // Get payment status display text
  const getPaymentStatusDisplay = (status) => {
    const paymentMap = {
      'paid': i18n.language === "ar" ? 'مدفوع' : 'Paid',
      'pending': i18n.language === "ar" ? 'في انتظار الدفع' : 'Pending',
      'failed': i18n.language === "ar" ? 'فشل الدفع' : 'Failed',
      'refunded': i18n.language === "ar" ? 'مسترد' : 'Refunded'
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
      toast.error(i18n.language === "ar" ? "يرجى اختيار سبب الاسترجاع" : "Please select a return reason");
      return;
    }
    
    if (returnForm.reason_code === 8 && !returnForm.reason_text.trim()) {
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
      formData.append('reason_text', returnForm.reason_code === 8 ? returnForm.reason_text : '');
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
        // Refresh orders
        fetchOrdersData();
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

  // Fetch comments for an order
  const fetchOrderComments = useCallback(async (orderId) => {
    try {
      setCommentsLoading(prev => ({ ...prev, [orderId]: true }));
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/orders/${orderId}/comments`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status && response.data.data) {
        setOrderComments(prev => ({
          ...prev,
          [orderId]: response.data.data
        }));
      } else {
        setOrderComments(prev => ({
          ...prev,
          [orderId]: []
        }));
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setOrderComments(prev => ({
        ...prev,
        [orderId]: []
      }));
    } finally {
      setCommentsLoading(prev => ({ ...prev, [orderId]: false }));
    }
  }, [i18n.language]);

  // Handle comment form submission
  const handleCommentSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validation
    if (!commentForm.rating || commentForm.rating < 1 || commentForm.rating > 5) {
      toast.error(i18n.language === "ar" ? "يرجى اختيار تقييم من 1 إلى 5" : "Please select a rating from 1 to 5");
      return;
    }
    
    if (!commentForm.comment.trim()) {
      toast.error(i18n.language === "ar" ? "يرجى كتابة تعليق" : "Please write a comment");
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
        toast.success(i18n.language === "ar" ? "تم إرسال التعليق بنجاح" : "Comment submitted successfully");
        setShowCommentModal(false);
        // Refresh orders and comments
        fetchOrdersData(currentPage);
        if (commentForm.order_id) {
          fetchOrderComments(commentForm.order_id);
        }
      } else {
        toast.error(response.data.message || (i18n.language === "ar" ? "حدث خطأ في إرسال التعليق" : "Error submitting comment"));
      }
    } catch (error) {
      console.error('Comment error:', error);
      toast.error(error.response?.data?.message || (i18n.language === "ar" ? "حدث خطأ في إرسال التعليق" : "Error submitting comment"));
    } finally {
      setCommentLoading(false);
    }
  }, [commentForm, i18n.language, currentPage, fetchOrderComments]);

  // Handle comment form input changes
  const handleCommentFormChange = useCallback((field, value) => {
    setCommentForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Fetch profile data from API
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("يجب تسجيل الدخول أولاً");
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/profile`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === true) {
        const userData = response.data.data;
        setProfileData({
          id: userData.id,
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          address: userData.address || "",
          image: userData.image || "",
          avatar: (userData.image && userData.image !== null && userData.image !== "") 
            ? userData.image 
            : latop,
        });
        setTempProfileData({
          id: userData.id,
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          address: userData.address || "",
          image: userData.image || "",
          avatar: (userData.image && userData.image !== null && userData.image !== "") 
            ? userData.image 
            : latop,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("حدث خطأ في تحميل بيانات الملف الشخصي");
    } finally {
      setLoading(false);
    }
  };

  const updateProfileData = async () => {
    try {
      // ✅ Validation
      if (!tempProfileData.name.trim()) {
        toast.error("الاسم مطلوب", { position: "top-right", rtl: true });
        return;
      }

      if (!tempProfileData.email.trim()) {
        toast.error("البريد الإلكتروني مطلوب", { position: "top-right", rtl: true });
        return;
      }

      // ✅ Regex check للبريد
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(tempProfileData.email)) {
        toast.error("البريد الإلكتروني غير صحيح", { position: "top-right", rtl: true });
        return;
      }

      if (!tempProfileData.phone.trim()) {
        toast.error("رقم الهاتف مطلوب", { position: "top-right", rtl: true });
        return;
      }

      // ✅ Regex check للهاتف (أرقام فقط وبحد أدنى 6 أرقام)
      const phoneRegex = /^[0-9]{6,15}$/;
      if (!phoneRegex.test(tempProfileData.phone)) {
        toast.error("رقم الهاتف غير صحيح", { position: "top-right", rtl: true });
        return;
      }

      if (!tempProfileData.address.trim()) {
        toast.error("العنوان مطلوب", { position: "top-right", rtl: true });
        return;
      }

      setUpdating(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("يجب تسجيل الدخول أولاً");
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', tempProfileData.name);
      formData.append('email', tempProfileData.email);
      formData.append('phone', tempProfileData.phone);
      formData.append('address', tempProfileData.address);
      
      // Add image if it's a file (new upload)
      if (tempProfileData.image instanceof File) {
        formData.append('image', tempProfileData.image);
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/profile`,
        formData,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.status === true) {
        // Update profile data with the response
        const updatedData = response.data.data;
        const newProfileData = {
          ...tempProfileData,
          image: updatedData.image || tempProfileData.image,
          avatar: (updatedData.image && updatedData.image !== null && updatedData.image !== "") 
            ? updatedData.image 
            : latop,
        };
        
        setProfileData(newProfileData);
        setTempProfileData(newProfileData);
        setEditMode(false);
        toast.success("تم تحديث الملف الشخصي بنجاح", { position: "top-right", rtl: true });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("حدث خطأ في تحديث الملف الشخصي", { position: "top-right", rtl: true });
    } finally {
      setUpdating(false);
    }
  };

  // Fetch orders data with pagination
  const fetchOrdersData = async (page = 1) => {
    try {
      setOrdersLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("يجب تسجيل الدخول أولاً");
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/orders?page=${page}&per_page=${ordersPerPage}`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.data) {
        setOrders(response.data.data);
        
        // Fetch comments for each order
        response.data.data.forEach(order => {
          fetchOrderComments(order.id);
        });
        
        // Handle pagination from separate pagination object
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.last_page || 1);
          setTotalOrders(response.data.pagination.total || 0);
          setCurrentPage(response.data.pagination.current_page || page);
          
          // console.log('Profile Orders API Response:', response.data);
          // console.log('Profile Orders Pagination:', response.data.pagination);
        } else {
          // Fallback for old API structure
          setTotalPages(response.data.last_page || 1);
          setTotalOrders(response.data.total || 0);
          setCurrentPage(response.data.current_page || 1);
          
          // console.log('Profile Orders API Response (Old):', response.data);
        }
      } else {
        setOrders([]);
        setTotalPages(1);
        setTotalOrders(0);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("حدث خطأ في تحميل الطلبات");
      setOrders([]);
      setTotalPages(1);
      setTotalOrders(0);
      setCurrentPage(1);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch returns data with pagination
  const fetchReturnsData = async (page = 1) => {
    try {
      setReturnsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("يجب تسجيل الدخول أولاً");
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/returns?page=${page}&per_page=${returnsPerPage}`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.data) {
        setReturnsList(response.data.data);
        
        // Handle pagination from separate pagination object
        if (response.data.pagination) {
          setReturnsTotalPages(response.data.pagination.last_page || 1);
          setReturnsTotalItems(response.data.pagination.total || 0);
          setReturnsPage(response.data.pagination.current_page || page);
          
          // console.log('Profile Returns API Response:', response.data);
          // console.log('Profile Returns Pagination:', response.data.pagination);
        } else {
          // Fallback for old API structure
          const pagination = response.data.pagination || {};
          setReturnsTotalPages(pagination.last_page || 1);
          setReturnsTotalItems(pagination.total || response.data.data.length || 0);
          setReturnsPage(pagination.current_page || page);
        }
      } else {
        setReturnsList([]);
        setReturnsTotalPages(1);
        setReturnsTotalItems(0);
        setReturnsPage(1);
      }
    } catch (error) {
      console.error("Error fetching returns:", error);
      toast.error("حدث خطأ في تحميل الطلبات المسترجعة");
      setReturnsList([]);
      setReturnsTotalPages(1);
      setReturnsTotalItems(0);
      setReturnsPage(1);
    } finally {
      setReturnsLoading(false);
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/logout`,
          {},
          {
            headers: {
              Accept: "application/json",
              "Accept-Language": i18n.language,
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage and redirect regardless of API response
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Show success message
      toast.success(t("topnav.logoutSuccess"));
      // Wait a bit for toast to show, then redirect to home page
      setTimeout(() => {
        navigate("/");
      }, 1500);
    }
  };

  // Load profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, [i18n.language]);

  // Handle page change (orders)
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchOrdersData(page);
  };

  // Handle page change (returns)
  const handleReturnsPageChange = (page) => {
    setReturnsPage(page);
    fetchReturnsData(page);
  };

  // Load orders when orders tab is active
  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrdersData(currentPage);
    }
    if (activeTab === "returns") {
      fetchReturnsData(returnsPage);
    }
  }, [activeTab, i18n.language]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempProfileData({ ...tempProfileData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTempProfileData({
          ...tempProfileData,
          image: file,
          avatar: e.target.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfileChanges = () => {
    updateProfileData();
  };

  const cancelEdit = () => {
    setTempProfileData({ 
      ...profileData,
      avatar: (profileData.image && profileData.image !== null && profileData.image !== "") 
        ? profileData.image 
        : latop
    });
    setEditMode(false);
  };

  if (loading) {
    return (
      <div className="profile-dashboard">
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">{t("common.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-dashboard">
      <div className="p-1 p-md-5">
        <div className="profile-header">
          <h1>{t("profile.title")}</h1>
          <p>{t("profile.welcome")}</p>
        </div>

        <div className="profile-layout">
          <aside className="profile-sidebar">
            <div className="profile-card">
              <div className="avatar-container">
                <img
                  src={profileData.avatar}
                  alt="Profile"
                  className="profile-avatar"
                />
              </div>
              <h3>{profileData.name || "المستخدم"}</h3>
              <p>{profileData.email || "لا يوجد بريد إلكتروني"}</p>
            </div>

            <nav className="profile-nav">
              <ul>
                <li
                  className={activeTab === "info" ? "active" : ""}
                  onClick={() => setActiveTab("info")}
                >
                  <FiUser />
                  {t("profile.info")}
                </li>
                <li
                  className={activeTab === "orders" ? "active" : ""}
                  onClick={() => setActiveTab("orders")}
                >
                  <FiShoppingBag />
                  {t("profile.orders")}
                </li>
                <li
                  className={activeTab === "returns" ? "active" : ""}
                  onClick={() => setActiveTab("returns")}
                >
                  <i className="bi bi-arrow-return-left"></i>
                  {t("profile.returns", { defaultValue: "الطلبات المسترجعة" })}
                </li>
                <li
                  className={activeTab === "logout" ? "active" : ""}
                  onClick={() => setActiveTab("logout")}
                >
                  <FiLogOut />
                  {t("navbar.logout")}
                </li>
              </ul>
            </nav>
          </aside>

          <main className="profile-content">
            {activeTab === "info" && (
              <div className="tab-content">
                <h2>
                  <FiUser />
                  {t("profile.info")}
                </h2>
                {editMode ? (
                  <div className="profile-form">
                    <div className="form-group">
                      <label>الصورة الشخصية</label>
                      <div className="image-upload-container">
                        <img
                          src={tempProfileData.avatar}
                          alt="Profile Preview"
                          className="profile-preview-image"
                          style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", marginBottom: "10px" }}
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>{t("profile.name")}</label>
                      <input
                        type="text"
                        name="name"
                        value={tempProfileData.name}
                        onChange={handleInputChange}
                        placeholder={t("profile.name")}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t("profile.email")}</label>
                      <input
                        type="email"
                        name="email"
                        value={tempProfileData.email}
                        onChange={handleInputChange}
                        placeholder={t("profile.email")}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t("profile.phone")}</label>
                      <input
                        type="tel"
                        name="phone"
                        value={tempProfileData.phone}
                        onChange={handleInputChange}
                        placeholder={t("profile.phone")}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t("profile.address")}</label>
                      <textarea
                        name="address"
                        value={tempProfileData.address}
                        onChange={handleInputChange}
                        placeholder={t("profile.address")}
                        rows="3"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div className="form-actions">
                      <button
                        className="btn bg-black text-white"
                        onClick={saveProfileChanges}
                        disabled={updating}
                      >
                        {updating ? t("common.loading") : t("profile.save")}
                      </button>
                      <button
                        className="btn btn-outline"
                        onClick={cancelEdit}
                        disabled={updating}
                      >
                        {t("profile.cancel")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="profile-info">
                    <div className="info-row">
                      <span className="info-label">{t("profile.name")}:</span>
                      <span className="info-value">{profileData.name || "غير محدد"}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">{t("profile.email")}:</span>
                      <span className="info-value">{profileData.email || "غير محدد"}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">{t("profile.phone")}:</span>
                      <span className="info-value">{profileData.phone || "غير محدد"}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">{t("profile.address")}:</span>
                      <span className="info-value">{profileData.address || "غير محدد"}</span>
                    </div>
                    <button
                      className="btn bg-black text-white"
                      onClick={() => setEditMode(true)}
                      style={{ marginTop: "20px" }}
                    >
                      <FiEdit />
                      {t("profile.editProfile")}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "orders" && (
              <div className="tab-content">
                <div className="card-header  text-white text-center py-4 mb-4">
                  <h2 className="mb-0 fw-bold">
                    <i className="bi bi-bag mx-3"></i>
                    {t("profile.orders")}
                  </h2>
                </div>
                
                {ordersLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">{t("common.loading")}</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="mb-4">
                      <i className="bi bi-cart-x text-muted" style={{ fontSize: '4rem' }}></i>
                    </div>
                    <h4 className="text-muted mb-3">{t("profile.noOrders", { defaultValue: "لا توجد طلبات بعد" })}</h4>
                    <p className="text-muted mb-4">{t("profile.noOrdersMessage", { defaultValue: "لم تقم بإنشاء أي طلبات حتى الآن" })}</p>
                    <button 
                      className="btn btn-primary btn-lg"
                      onClick={() => navigate("/")}
                    >
                      <i className="bi bi-bag mx-2"></i>
                      {t("profile.startShopping", { defaultValue: "ابدأ التسوق" })}
                    </button>
                  </div>
                ) : (
                  <div className="orders-container">
                    {orders.map((order) => (
                      <div key={order.id} className="card mb-4 shadow-sm border-0">
                        <div className="card-header bg-dark text-white">
                          <div className="row align-items-center">
                            <div className="col-md-6">
                              <h5 className="mb-1">
                                <i className="bi bi-receipt mx-2"></i>
                                {t("orders.orderNumber", { defaultValue: "طلب رقم" })} #{order.id}
                              </h5>
                              <small className="d-block">
                                <i className="bi bi-calendar mx-1"></i>
                                {new Date(order.created_at).toLocaleDateString(i18n.language)}{" "}
                                {new Date(order.created_at).toLocaleTimeString(i18n.language)}
                              </small>
                              <small className="d-block">
                                <i className="bi bi-box mx-1"></i>
                                {order.items.length} {order.items.length === 1 ? (i18n.language === "ar" ? 'عنصر' : 'item') : (i18n.language === "ar" ? 'عناصر' : 'items')}
                              </small>
                            </div>
                            <div className="col-md-6 text-md-end">
                              <div className="d-flex flex-wrap justify-content-md-end gap-3">
                                <div className="custom-badge status-badge">
                                  <div className="badge-icon">
                                    <i className="bi bi-info-circle pt-1"></i>
                                  </div>
                                  <div className="badge-content">
                                    <span className="badge-label">{t("orders.status", { defaultValue: "الحالة" })}</span>
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
                                  <th><i className="bi bi-box mx-2"></i>{t("orders.product", { defaultValue: "المنتج" })}</th>
                                  <th><i className="bi bi-list mx-2"></i>{t("orders.variants", { defaultValue: "المتغيرات" })}</th>
                                  <th><i className="bi bi-currency-dollar mx-2"></i>{t("orders.price", { defaultValue: "السعر" })}</th>
                                  <th><i className="bi bi-hash mx-2"></i>{t("orders.qty", { defaultValue: "الكمية" })}</th>
                                  <th><i className="bi bi-calculator mx-2"></i>{t("orders.subtotal", { defaultValue: "المجموع" })}</th>
                                  <th><i className="bi bi-arrow-return-left mx-2"></i>{t("orders.actions", { defaultValue: "الإجراءات" })}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.items?.map((item, idx) => (
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
                                      <span className="fw-bold text-dark">
                                        {item.price_after} {t("products.currency", { defaultValue: "جنيه" })}
                                      </span>
                                    </td>
                                    <td className="align-middle text-center">
                                      <div className="custom-badge quantity-badge">
                                        <div className="badge-icon">
                                          <i className="bi bi-hash pt-1"></i>
                                        </div>
                                        <div className="badge-content">
                                          <span className="badge-value">{item.quantity}</span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="align-middle">
                                      <span className="fw-bold text-dark">
                                        {item.price_after * item.quantity} {t("products.currency", { defaultValue: "جنيه" })}
                                      </span>
                                    </td>
                                    <td className="align-middle text-center">
                                      {(order.status === "تم التوصيل" || order.status === "delivered") && !item.has_user_return && (
                                        <button
                                          className="btn btn-outline-warning btn-sm"
                                          onClick={() => handleReturnClick(order, item)}
                                          title={i18n.language === "ar" ? "طلب استرجاع" : "Return Item"}
                                        >
                                          <i className="bi bi-arrow-return-left mx-1"></i>
                                          {i18n.language === "ar" ? "استرجاع" : "Return"}
                                        </button>
                                      )}
                                      {(order.status === "تم التوصيل" || order.status === "delivered") && item.has_user_return && (
                                        <span className="text-dark">
                                          <i className="bi bi-check-circle mx-1"></i>
                                          {i18n.language === "ar" ? "تم طلب الاسترجاع" : "Return Requested"}
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
                              {t("orders.total", { defaultValue: "المجموع" })}: 
                              <span className="text-dark ms-2">
                                {order.total} {t("products.currency", { defaultValue: "جنيه" })}
                              </span>
                            </div>
                            <div className="d-flex gap-2">
                              <button 
                                className="btn btn-outline-primary"
                                onClick={() => navigate(`/order-details/${order.id}`)}
                              >
                                <i className="bi bi-eye mx-1"></i>
                                {t("orders.viewDetails", { defaultValue: "عرض التفاصيل" })}
                              </button>
                              {(order.status === "تم التوصيل" || order.status === "delivered" || order.status === "Delivered") && (
                                <button
                                  className="btn btn-outline-success"
                                  onClick={() => handleCommentClick(order)}
                                  title={i18n.language === "ar" ? "إضافة تعليق وتقييم" : "Add Comment & Rating"}
                                >
                                  <i className="bi bi-star mx-1"></i>
                                  {i18n.language === "ar" ? "تقييم" : "Rate & Comment"}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Comments Section */}
                          {orderComments[order.id] && orderComments[order.id].length > 0 && (
                            <div className="mt-4 pt-3 border-top">
                              <h6 className="mb-3">
                                <i className="bi bi-chat-dots mx-2"></i>
                                {i18n.language === "ar" ? "التعليقات" : "Comments"}
                              </h6>
                              <div className="comments-list">
                                {orderComments[order.id].map((comment, idx) => (
                                  <div key={idx} className="card mb-3 border-0 bg-light">
                                    <div className="card-body">
                                      <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div>
                                          <strong className="d-block">
                                            <i className="bi bi-person-circle mx-1"></i>
                                            {comment.user}
                                          </strong>
                                          <small className="text-muted">
                                            <i className="bi bi-calendar mx-1"></i>
                                            {comment.created_at}
                                          </small>
                                        </div>
                                        <div className="d-flex align-items-center">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <i
                                              key={star}
                                              className={`bi ${star <= parseInt(comment.rating) ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}
                                              style={{ fontSize: '1rem' }}
                                            ></i>
                                          ))}
                                        </div>
                                      </div>
                                      <p className="mb-0 mt-2">{comment.comment}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {commentsLoading[order.id] && (
                            <div className="mt-4 pt-3 border-top text-center">
                              <div className="spinner-border spinner-border-sm text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
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
            )}

            {activeTab === "returns" && (
              <div className="tab-content">
                <div className="card-header  text-white text-center py-4 mb-4">
                  <h2 className="mb-0 fw-bold">
                    <i className="bi bi-arrow-return-left mx-3"></i>
                    {t("profile.returns", { defaultValue: "الطلبات المسترجعة" })}
                  </h2>
                </div>

                {returnsLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">{t("common.loading")}</p>
                  </div>
                ) : returnsList.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="mb-4">
                      <i className="bi bi-inbox text-muted" style={{ fontSize: '4rem' }}></i>
                    </div>
                    <h4 className="text-muted mb-3">{t("profile.noReturns", { defaultValue: "لا توجد طلبات استرجاع" })}</h4>
                    <p className="text-muted mb-4">{t("profile.noReturnsMessage", { defaultValue: "لم تقم بإنشاء أي طلبات استرجاع" })}</p>
                  </div>
                ) : (
                  <div className="orders-container">
                    {returnsList.map((ret) => (
                      <div key={ret.id} className="card mb-4 shadow-sm border-0">
                        <div className="card-header bg-dark text-white">
                          <div className="row align-items-center">
                            <div className="col-md-6">
                              <h5 className="mb-1">
                                <i className="bi bi-receipt mx-2"></i>
                                {t("orders.orderNumber", { defaultValue: "طلب رقم" })} #{ret.order?.id}
                              </h5>
                              <small>
                                <i className="bi bi-calendar mx-1"></i>
                                {new Date(ret.created_at).toLocaleDateString(i18n.language)}{" "}
                                {new Date(ret.created_at).toLocaleTimeString(i18n.language)}
                              </small>
                            </div>
                            <div className="col-md-6 text-md-end">
                              <div className="d-flex flex-wrap justify-content-md-end gap-3">
                                <div className="custom-badge status-badge">
                                  <div className="badge-icon">
                                    <i className="bi bi-info-circle pt-1"></i>
                                  </div>
                                  <div className="badge-content">
                                    <span className="badge-label">{t("orders.status", { defaultValue: "الحالة" })}</span>
                                    <span className="badge-value">{ret.status_label}</span>
                                  </div>
                                </div>
                                <div className="custom-badge status-badge">
                                  <div className="badge-icon">
                                    <i className="bi bi-hash pt-1"></i>
                                  </div>
                                  <div className="badge-content">
                                    <span className="badge-label">ID</span>
                                    <span className="badge-value">{ret.id}</span>
                                  </div>
                                </div>
                                <div className="custom-badge payment-badge">
                                  <div className="badge-icon">
                                    <i className="bi bi-cash-coin pt-1"></i>
                                  </div>
                                  <div className="badge-content">
                                    <span className="badge-label">{t("orders.total", { defaultValue: "المجموع" })}</span>
                                    <span className="badge-value">{ret.refunds?.total ?? 0}</span>
                                  </div>
                                </div>
                                {ret.approved_at && (
                                  <div className="custom-badge delivery-badge">
                                    <div className="badge-icon">
                                      <i className="bi bi-check2-circle"></i>
                                    </div>
                                    <div className="badge-content">
                                      <span className="badge-label">{t("orders.approved")}</span>
                                      <span className="badge-value">{ret?.approved_at}</span>
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
                                  <th><i className="bi bi-box mx-2"></i>{t("orders.product", { defaultValue: "المنتج" })}</th>
                                  <th><i className="bi bi-card-text mx-2"></i>{t("orders.reason", { defaultValue: "السبب" })}</th>
                                  <th><i className="bi bi-hash mx-2"></i>{t("orders.qty", { defaultValue: "الكمية" })}</th>
                                  <th><i className="bi bi-currency-dollar mx-2"></i>{t("orders.price", { defaultValue: "السعر بعد" })}</th>
                                  <th><i className="bi bi-currency-exchange mx-2"></i>{t("orders.priceBefore", { defaultValue: "السعر قبل" })}</th>
                                  <th><i className="bi bi-calculator mx-2"></i>{t("orders.subtotal", { defaultValue: "المجموع" })}</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="align-middle">
                                    <div className="d-flex align-items-center gap-3">
                                      {ret.item?.product_image && (
                                        <img src={ret.item.product_image} alt={ret.item?.product_name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
                                      )}
                                      <div>
                                        <div className="fw-semibold">{ret.item?.product_name}</div>
                                        {/* {ret.item?.variant && (
                                          <small className="text-muted">{ret.item.variant}</small>
                                        )} */}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="align-middle">{ret.reason_label}</td>
                                  <td className="align-middle">
                                    <div className="custom-badge quantity-badge">
                                      <div className="badge-icon">
                                        <i className="bi bi-hash pt-1"></i>
                                      </div>
                                      <div className="badge-content">
                                        <span className="badge-value">{ret.quantity}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="align-middle">
                                    <span className="fw-bold text-dark">{ret.item?.price_after}</span>
                                  </td>
                                  <td className="align-middle">
                                    <span className="text-muted">{ret.item?.price_before}</span>
                                  </td>
                                  <td className="align-middle">
                                    <span className="fw-bold text-dark">{(ret.item?.price_after ?? 0) * (ret.quantity ?? 0)}</span>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          {/* Extra details: refunds breakdown, order and item meta */}
                          <div className="row g-3 mt-3">
                            <div className="col-md-6">
                              <div className="card border-0 bg-light">
                                <div className="card-body py-3">
                                  <h6 className="mb-3"><i className="bi bi-cash-coin mx-1"></i>{t("orders.refunds", { defaultValue: "تفاصيل المبالغ" })}</h6>
                                  <div className="d-flex flex-wrap gap-2">
                                    <span className="  text-dark">{t("orders.total", { defaultValue: "الإجمالي" })}: {ret.refunds?.total ?? 0}</span>
                                    <span className="  text-dark">{t("orders.shipping", { defaultValue: "المستقطع" })}: {ret.refunds?.shipping ?? 0}</span>
                                    <span className="  text-dark">{t("orders.subtotal", { defaultValue: "المجموع" })}: {ret.refunds?.subtotal ?? 0}</span>
                                  </div>
                                  {/* <div className="d-flex flex-column small text-muted">
                                    <span>{i18n.language === "ar" ? "تاريخ استرداد المبلغ" : "Refunded Date "}: {ret.refunded_at ?? '-'}</span>
                                    
                                  </div> */}

                                </div>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="card border-0 bg-light">
                                <div className="card-body py-3">
                                  <h6 className="mb-3"><i className="bi bi-clock-history mx-1"></i>{t("orders.timestamps", { defaultValue: "التواريخ" })}</h6>
                                  <div className="d-flex flex-column small text-muted">
                                    <span>{t("orders.createdAt", { defaultValue: "تم الإنشاء" })}: {ret.created_at}</span>
                                    <span>{t("orders.approvedAt", { defaultValue: "تاريخ الموافقة" })}: {ret.approved_at ?? '-'}</span>
                                    <span>{i18n.language === "ar" ? "تاريخ استرداد المبلغ" : "Refunded Date "}: {ret.refunded_at ?? '-'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="card border-0 bg-light">
                                <div className="card-body py-3">
                                  <h6 className="mb-3"><i className="bi bi-receipt mx-1"></i>{t("orders.order", { defaultValue: "الطلب" })}</h6>
                                  <div className="d-flex flex-wrap gap-2 small">
                                    {/* <span className=" text-dark"> {ret.order?.id ?? '-'} ID</span> */}
                                    <span className=" text-dark">{t("orders.total", { defaultValue: "الإجمالي" })}: {ret.order?.total ?? '-'}</span>
                                    <span className=" text-dark">{t("orders.delivery", { defaultValue: "التسليم" })}: {ret.received_at ?? '-'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="card border-0 bg-light">
                                <div className="card-body py-3">
                                  <h6 className="mb-3"><i className="bi bi-box-seam mx-1"></i>{t("orders.item", { defaultValue: "العنصر" })}</h6>
                                  <div className="d-flex flex-wrap gap-2 small">
                                    <span className=" text-dark">Item ID: {ret.item?.id ?? '-'}</span>
                                    <span className=" text-dark">Product ID: {ret.item?.product_id ?? '-'}</span>
                                    <span className=" text-dark">{t("orders.orderedQty", { defaultValue: " الكمية المسترجعة " })}: {ret.quantity ?? '-'}</span>
                                    {ret.vendor && (
                                      <span className=" text-dark">{i18n.language === "ar" ? "المورد" : "Vendor"}: {ret.vendor.name}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {returnsList.length > 0 && returnsTotalPages > 1 && (
                  <Pagination
                    currentPage={returnsPage}
                    totalPages={returnsTotalPages}
                    onPageChange={handleReturnsPageChange}
                    totalItems={returnsTotalItems}
                    itemsPerPage={returnsPerPage}
                    showInfo={true}
                  />
                )}
              </div>
            )}

            {activeTab === "logout" && (
              <div className="tab-content">
                <h2>
                  <FiLogOut />
                  {t("navbar.logout")}
                </h2>
                <div className="logout-content">
                  <div className="alert alert-warning" role="alert">
                    <h4 className="alert-heading">تأكيد تسجيل الخروج</h4>
                    <p>هل أنت متأكد من أنك تريد تسجيل الخروج من حسابك؟</p>
                    <hr />
                    <div className="d-flex justify-content-center gap-3">
                      <button
                        className="btn btn-danger"
                        onClick={handleLogout}
                      >
                        <FiLogOut />
                        {t("navbar.logout")}
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => setActiveTab("info")}
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Return Modal */}
      {showReturnModal && selectedItem && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title w-100 w-md-auto">
                  <i className="bi bi-arrow-return-left mx-2"></i>
                  {i18n.language === "ar" ? "طلب استرجاع المنتج" : "Return Product Request"}
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
                    <h6><i className="bi bi-info-circle mx-2"></i>{i18n.language === "ar" ? "تفاصيل المنتج" : "Product Details"}</h6>
                    <p className="mb-1"><strong>{i18n.language === "ar" ? "المنتج:" : "Product:"}</strong> {selectedItem.item.name}</p>
                    <p className="mb-0"><strong>{i18n.language === "ar" ? "الكمية المتاحة:" : "Available Quantity:"}</strong> {selectedItem.item.quantity}</p>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        <i className="bi bi-hash mx-1"></i>
                        {i18n.language === "ar" ? "الكمية المراد استرجاعها" : "Return Quantity"}
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
                        {i18n.language === "ar" ? `أقصى كمية للاسترجاع: ${selectedItem.item.quantity}` : `Maximum returnable quantity: ${selectedItem.item.quantity}`}
                      </div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        <i className="bi bi-exclamation-triangle mx-1"></i>
                        {i18n.language === "ar" ? "سبب الاسترجاع" : "Return Reason"}
                      </label>
                      <select
                        className="form-select"
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

                    {returnForm.reason_code === "8" && (
                      <div className="col-12 mb-3">
                        <label className="form-label">
                          <i className="bi bi-chat-text mx-1"></i>
                          {i18n.language === "ar" ? "اشرح السبب" : "Explain the Reason"}
                        </label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={returnForm.reason_text}
                          onChange={(e) => handleReturnFormChange('reason_text', e.target.value)}
                          placeholder={i18n.language === "ar" ? "اكتب السبب هنا..." : "Write the reason here..."}
                          required
                        />
                        <div className="form-text">
                          <i className="bi bi-info-circle me-1"></i>
                          {i18n.language === "ar" ? "يرجى كتابة سبب الاسترجاع بالتفصيل" : "Please write the return reason in detail"}
                        </div>
                      </div>
                    )}

                    <div className="col-12 mb-3">
                      <label className="form-label">
                        <i className="bi bi-geo-alt mx-1"></i>
                        {i18n.language === "ar" ? "عنوان الاسترجاع" : "Return Address"}
                      </label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={returnForm.return_address}
                        onChange={(e) => handleReturnFormChange('return_address', e.target.value)}
                        placeholder={i18n.language === "ar" ? "اكتب عنوان الاسترجاع..." : "Enter return address..."}
                        required
                      />
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label">
                        <i className="bi bi-telephone mx-1"></i>
                        {i18n.language === "ar" ? "رقم الهاتف" : "Phone Number"}
                      </label>
                      <input
                        type="tel"
                        className={`form-control ${i18n.language === "ar" ? 'rtl-input text-end' : ''}`}
                        value={returnForm.payout_wallet_phone}
                        onChange={(e) => {
                          // Only allow numbers
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          handleReturnFormChange('payout_wallet_phone', value);
                        }}
                        placeholder={i18n.language === "ar" ? "رقم الهاتف..." : "Phone number..."}
                        required
                      />
                      <div className="form-text">
                        {i18n.language === "ar" ? "أرقام فقط" : "Numbers only"}
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
                    {i18n.language === "ar" ? "إلغاء" : "Cancel"}
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-warning"
                    disabled={returnLoading}
                  >
                    {returnLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm mx-2" role="status"></span>
                        {i18n.language === "ar" ? "جاري الإرسال..." : "Submitting..."}
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send mx-1"></i>
                        {i18n.language === "ar" ? "إرسال طلب الاسترجاع" : "Submit Return Request"}
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
                  {i18n.language === "ar" ? "تقييم الطلب" : "Rate & Comment Order"}
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
                    <h6><i className="bi bi-info-circle mx-2"></i>{i18n.language === "ar" ? "تفاصيل الطلب" : "Order Details"}</h6>
                    <p className="mb-1"><strong>{i18n.language === "ar" ? "رقم الطلب:" : "Order Number:"}</strong> #{selectedOrder.id}</p>
                    <p className="mb-0"><strong>{i18n.language === "ar" ? "المجموع:" : "Total:"}</strong> {selectedOrder.total} {t("products.currency", { defaultValue: "جنيه" })}</p>
                  </div>

                  <div className="row">
                    <div className="col-12 mb-3">
                      <label className="form-label">
                        <i className="bi bi-star mx-1"></i>
                        {i18n.language === "ar" ? "التقييم" : "Rating"}
                        <span className="text-danger ms-1">*</span>
                      </label>
                      <div className="d-flex align-items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`btn btn-sm p-0 border-0 bg-transparent ${commentForm.rating >= star ? 'text-warning' : 'text-muted'}`}
                            onClick={() => handleCommentFormChange('rating', star)}
                            style={{ fontSize: '15px' , width: '30px', height: '30px' , borderRadius: '50%' }}
                            title={`${star} ${star === 1 ? (i18n.language === "ar" ? 'نجمة' : 'star') : (i18n.language === "ar" ? 'نجوم' : 'stars')}`}
                          >
                            <i className="bi bi-star-fill"></i>
                          </button>
                        ))}
                        {commentForm.rating > 0 && (
                          <span className="ms-2 text-muted">
                            ({commentForm.rating}/5)
                          </span>
                        )}
                      </div>
                      <div className="form-text">
                        <i className="bi bi-info-circle me-1"></i>
                        {i18n.language === "ar" ? "انقر على النجوم لتقييم الطلب" : "Click on stars to rate the order"}
                      </div>
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label">
                        <i className="bi bi-chat-text mx-1"></i>
                        {i18n.language === "ar" ? "التعليق" : "Comment"}
                        <span className="text-danger ms-1">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        rows="5"
                        value={commentForm.comment}
                        onChange={(e) => handleCommentFormChange('comment', e.target.value)}
                        placeholder={i18n.language === "ar" ? "اكتب تعليقك هنا..." : "Write your comment here..."}
                        required
                      />
                      <div className="form-text">
                        <i className="bi bi-info-circle me-1"></i>
                        {i18n.language === "ar" ? "شاركنا رأيك حول تجربتك مع هذا الطلب" : "Share your experience with this order"}
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
                    {i18n.language === "ar" ? "إلغاء" : "Cancel"}
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-success"
                    disabled={commentLoading || !commentForm.rating || !commentForm.comment.trim()}
                  >
                    {commentLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm mx-2" role="status"></span>
                        {i18n.language === "ar" ? "جاري الإرسال..." : "Submitting..."}
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send mx-1"></i>
                        {i18n.language === "ar" ? "إرسال التعليق" : "Submit Comment"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
