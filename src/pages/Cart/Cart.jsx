



import React, { useEffect, useState } from "react";
import {
  Tag,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  FiShoppingBag,
  FiTrash2,
  FiArrowRight,
  FiPlus,
  FiMinus
} from "react-icons/fi";
import { FaRegSadTear } from "react-icons/fa";
import latop from "../../assests/imgs/22.svg";
import "./Cart.css";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { apiRequest } from "../../Redux/Apis/apiRequest";

// 🛒 Cart Component
export default function Cart() {
  const { t, i18n } = useTranslation("global");
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sumbitinCart, setSumbitinCart] = useState(false);
  ////console.log({sumbitinCart});
  
  let dispatch = useDispatch();
  let { CartSummery , carts} = useSelector((state) => state.api);
////console.log({cartItems});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 🔹 Get Cart Data
  let getAllProductinCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/cart`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.status && response.data.data?.data) {
        const transformedItems = response.data.data.data.map((item) => ({
          id: item.id,
          productId: item.product.id,
          name: item.product.name,
          price:
            item.product.variant_item?.price_after || item.product.price_after,
          originalPrice:
            item.product.variant_item?.price_before ||
            item.product.price_before,
          discount: item.product.discount,
          quantity: item.quantity,
          image:
            item.product.image || item.product.images?.[0] || latop,
          images: item.product.images || [],
          variant_item: item.product.variant_item || null,
          selections: item.product.variant_item?.selections || [],
        }));
        setCartItems(transformedItems);
      }
      setError(null);
    } catch (err) {
      setError(
        t("cart.error", { defaultValue: "حدث خطأ في تحميل سلة المشتريات" })
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Update Quantity
  const updateQuantityOnServer = async (cartId, newQuantity) => {
    try {
      let updateItemFromCart = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/cart/${cartId}`,
        { quantity: newQuantity },
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (updateItemFromCart.status === 200) {
        toast.success(updateItemFromCart.data.message);
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
      }
    } catch (err) {
      ////console.log("Error updating quantity:", err);
    }
  };

  // 🔹 Remove Item
  const removeItemFromServer = async (cartId) => {
    try {
      let deleteItemFromCart = await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/api/cart/${cartId}`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (deleteItemFromCart.status === 200) {
        toast.success(deleteItemFromCart.data.message);
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
        
 dispatch(apiRequest({
        url: "api/cart",
        entity: "carts",
        headers: {
          "Accept-Language": i18n.language,
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      }));

      }
    } catch (err) {
      ////console.log("Error removing item:", err);
    }
  };

  useEffect(() => {
    getAllProductinCart();

    dispatch(apiRequest({
        url: "api/cart",
        entity: "carts",
        headers: {
          "Accept-Language": i18n.language,
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      }));

    return () => {
      setSumbitinCart(false);
    
    }
  }, [i18n.language]);

  const removeItem = async (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
    await removeItemFromServer(id);
  };

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
    await updateQuantityOnServer(id, newQuantity);
  };

  const renderVariantSelections = (selections) => {
    if (!selections || selections.length === 0) return null;
    return (
      <div className="variant-selections">
        {selections.map((selection, index) => (
          <div key={index} className="variant-item">
            <span className="variant-label">{selection.variant}:</span>
            <span className="variant-value">{selection.value}</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <motion.div className="cart-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="container text-center py-5">
          <div className="spinner-border text-dark mb-3" />
          <p>{t("cart.loading", { defaultValue: "جاري تحميل سلة المشتريات..." })}</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div className="cart-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="container text-center py-5">
          <p className="text-danger">{error}</p>
          <button onClick={getAllProductinCart} className="btn btn-dark">
            {t("cart.retry", { defaultValue: "إعادة المحاولة" })}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="cart-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="container py-4">
        <div className="cart-header d-flex justify-content-between align-items-center mb-4">
          <h1 className="cart-title fw-bold d-flex align-items-center">
            <FiShoppingBag className="mx-2" />
            {t("cart.title", { defaultValue: "سلة المشتريات" })}
            <span className="badge bg-dark text-center d-flex align-items-center mx-2">{cartItems.length}</span>
          </h1>
    

{cartItems.length > 0 && (
  <div className="d-flex flex-column align-items-center align-items-md-end ">
    <Link
      to="/checkout"
      className="btn btn-dark d-flex align-items-center"
    >
      {t("cart.continueShopping", { defaultValue: "المتابعة للدفع" })}
      <FiArrowRight className="mx-2" />
    </Link>
  </div>
)}

           {/* <Link
            to={CartSummery?.data?.data?.shipping_zone ? "/checkout" : "#"}
            className={`btn btn-dark d-flex align-items-center ${!CartSummery?.data?.data?.shipping_zone || sumbitinCart==true ? "disabled" : ""}`}
          >
            {t("cart.continueShopping", { defaultValue: "المتابعة للدفع" })}
            <FiArrowRight className="ms-2" />
          </Link> */}
        </div>

        <AnimatePresence>
          {cartItems.length === 0 ? (
            <motion.div
              className="text-center py-5"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <FaRegSadTear size={40} className="mb-3 text-muted" />
              <h4>{t("cart.emptyTitle", { defaultValue: "سلة المشتريات فارغة" })}</h4>
              <p className="text-muted">{t("cart.emptyMessage", { defaultValue: "لم تقم بإضافة أي منتجات بعد" })}</p>
              <Link to="/" className="btn btn-dark">
                {t("cart.shopNow", { defaultValue: "تصفح المنتجات" })}
              </Link>
            </motion.div>
          ) : (
            <div className="row">
              <div className="col-lg-8">
                {cartItems.map((item) => (
                  <motion.div
                    className="card mb-3 shadow-sm border-0"
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="card-body d-flex align-items-center">
                      <Link to={`/productdetails/${item.productId}`}>
                      <img src={item.image} alt={item.name} className="me-3 rounded" style={{ width: "80px", height: "80px", objectFit: "cover" }} />
                      </Link>
                      <div className="flex-grow-1">
                        <h6 className="fw-bold">{item.name}</h6>
                        {renderVariantSelections(item.selections)}
                        <div className="d-flex align-items-center mt-2">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="btn btn-sm btn-outline-dark me-2" disabled={item.quantity <= 1}><FiMinus /></button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="btn btn-sm btn-outline-dark ms-2"><FiPlus /></button>
                        </div>
                      </div>
                      <div className="text-end mx-2 mt-2">
                        <p className="mb-1 fw-bold">{item.price * item.quantity} {t("cart.currency", { defaultValue: "جنيه" })}</p>
                        
                      </div>
                      <button onClick={() => removeItem(item.id)} className="btn btn-sm btn-outline-danger ms-3"><FiTrash2 /></button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="col-lg-4">
                <ZoneandCopoun  setSumbitinCart={setSumbitinCart}/>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}


const ZoneandCopoun = ({setSumbitinCart}) => {
  const { t, i18n } = useTranslation("global");

  const [couponCode, setCouponCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponError, setCouponError] = useState("");

  const dispatch = useDispatch();
  const { CartSummery } = useSelector((state) => state.api);

  const handleApply = async () => {
    const formData = new FormData();
    setIsSubmitting(true);
   
    setCouponError("");

    if (couponCode.trim())
      formData.append("coupon", couponCode.trim().toUpperCase());

    try {
      const response = await dispatch(
        apiRequest({
          url: "api/summary",
          entity: "CartSummery",
          method: "POST",
          data: formData,
          headers: {
            "Accept-Language": i18n.language,
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
      );

      if (response.payload.success) {
         setSumbitinCart(true);
        toast.success(response.payload.message);
      } else {
        setCouponError(response.payload.message || "Failed to apply");
      }
    } catch (error) {
      setCouponError("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveCoupon = async () => {
    if (!CartSummery?.data?.data?.coupon?.code) return;
    
    setIsSubmitting(true);
    setCouponError("");

    try {
      const response = await dispatch(
        apiRequest({
          url: "api/coupon",
          entity: "CartSummery",
          method: "DELETE",
          data: { coupon: CartSummery.data.data.coupon.code },
          headers: {
            "Accept-Language": i18n.language,
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
      );

      if (response.payload.success) {
        setCouponCode("");
        setSumbitinCart(true);
        // toast.success(response.payload.message || (i18n.language === "ar" ? "تم حذف الكوبون بنجاح" : "Coupon removed successfully"));
      } else {
        setCouponError(response.payload.message || "Failed to remove coupon");
      }
    } catch (error) {
      setCouponError(i18n.language === "ar" ? "حدث خطأ أثناء حذف الكوبون" : "An error occurred while removing coupon");
    } finally {
      setIsSubmitting(false);
    }
  };
  ////console.log({cartSummery: CartSummery});

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <h5 className="fw-bold mb-3">
          {t("checkout.orderSummary", { defaultValue: "ملخص الطلب" })}
        </h5>

        {/* Coupon */}
        <div className="mb-3">
          <label className="form-label fw-bold">
            <Tag className="me-2" />{" "}
            {i18n.language === "ar" ? "كوبون الخصم" : " Discount Coupon"}
          </label>
          <div className="input-group">
            <input
              type="text"
              className={`form-control ${couponError ? "is-invalid" : ""}`}
              placeholder={i18n.language === "ar" ? "كود الكوبون" : " Coupon Code"}
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value);
                setCouponError("");
              }}
            />
            {couponCode && (
              <button
                type="button"
                className="btn btn-outline-danger mx-2 rounded btn-sm"
                onClick={() => {
                  setCouponCode("");
                  setCouponError("");
                }}
                title={i18n.language === "ar" ? "مسح الكوبون" : "Clear Coupon"}
              >
                <X size={18} />
              </button>
            )}
          </div>
          {couponError && <div className="invalid-feedback">{couponError}</div>}
        </div>

        {/* Apply Button */}
        <button
          className="btn btn-dark w-100 mt-3"
          onClick={handleApply}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? i18n.language === "ar" ? "جارٍ التطبيق..." : " Applying..."
            : i18n.language === "ar" ? "تطبيق" : " Apply" }
        </button>

        {/* Summary (يظهر فقط بعد ما تيجي الداتا من الـ API) */}
        {CartSummery?.data?.data && (
          <div className="mt-4">
            <div className="d-flex justify-content-between mb-2">
              <span>{i18n.language=="ar"? "المجموع الفرعي" :"Sub Total"}</span>
              <span>{CartSummery.data.data.subtotal} EGP</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>{i18n.language=="ar" ?  "خصم الكوبون"  : "Coupon Discount"}</span>
              <div className="d-flex align-items-center">
                <span className="text-success me-2">-{CartSummery.data.data.discount} EGP</span>
                {CartSummery?.data?.data?.coupon?.code && (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={handleRemoveCoupon}
                    disabled={isSubmitting}
                    title={i18n.language === "ar" ? "حذف الكوبون" : "Remove Coupon"}
                  >
                    {isSubmitting ? (
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      <FiTrash2 size={14} />
                    )}
                  </button>
                )}
              </div>
            </div>
            {CartSummery.data.data.shipping_zone && (
              <div className="d-flex justify-content-between mb-2">
                <span>{i18n.language=="ar" ? "قيمة الشحن":"Shipping Price"}</span>
                <span>{CartSummery.data.data.shipping_zone.price} EGP</span>
              </div>
            )}
            <hr />
            <div className="d-flex justify-content-between fw-bold">
              <span>{t("checkout.total", { defaultValue: "الإجمالي الكلي" })}</span>
              <span>{CartSummery.data.data.total} EGP</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

