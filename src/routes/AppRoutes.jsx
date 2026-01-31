import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Home from "../pages/Home/Home";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";


import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import FilterProducts from "../pages/FilterProducts/FilterProducts";
import ProductsDetalis from "../pages/ProductsDetalis/ProductsDetalis";
import AboutUS from "../pages/AboutUS/AboutUS";
import ContactUS from "../pages/ContactUS/ContactUS";
import Createaccount from "../pages/Createaccount/Createaccount";
import ResetPassword from "../pages/ResetPassword/ResetPassword";
import OtpVerifyEmail from "../pages/OtpVerifyEmail/OtpVerifyEmail";
import ChangePassword from "../pages/ChangePassword/ChangePassword";
import IndividualProfile from "../pages/IndividualProfile/IndividualProfile";
import Cart from "../pages/Cart/Cart";
import Favorites from "../pages/Favorites/Favorites";
import Checkout from "../pages/Checkout/Checkout";
import Profile from "../pages/Profile/Profile";
import OtpForgetPassword from "../pages/OtpForgetPassword/OtpForgetPassword";
import Offers from "../pages/Offers/Offers";
import ChatApp from "../pages/Chat/Chat";
import axios from "axios";
import AllProducts from "../pages/AllProducts/AllProducts";
import OrdersList from "../pages/Orders/Orders";
import OrderDetails from "../pages/OrderDetails/OrderDetails";
// import SellerProfile from "../pages/SellerProfile/SellerProfile";
import ProtectedRoute from "./ProtectedRoute";
import VendorDataOffer from "../pages/Offers/VendorDataOffer/VendorDataOffer";
import Terms from "../pages/Terms/Terms";
import Privacy from "../pages/Terms/Privacy";
import ReturnPolicy from "../pages/Terms/ReturnPolicy";
import NewOTP from "../pages/NewOTP/NewOTP";


export default function Applayout() {
  const location = useLocation();
  const { i18n } = useTranslation();
  let [favLength , setFavlength] = useState(null)

  ////console.log({favLength});

    let GetAllFavourite= async()=>{
    await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/favorites`,{headers:{
        Accept: "application/json",
            "Accept-Language": i18n.language,
             "Authorization":`Bearer ${localStorage.getItem("token")}`
    }}).then(res=>{
      ////console.log(res);
      setFavlength(res.data.data.length)
      
    }).catch(err=>{
      ////console.log(err);
      
    })
  }


  useEffect(()=>{
    if(localStorage.getItem("token") !=null){
      GetAllFavourite()
    }
  },[favLength , localStorage.getItem("token") , i18n.language])
  
  
  // Handle direction change based on language
  useEffect(() => {
    const dir = i18n.language === "ar" ? "rtl" : "ltr";
     if(localStorage.getItem("token") !=null){
      GetAllFavourite()
    }
  
    document.documentElement.setAttribute("dir", dir);
  }, [i18n.language]);

  const hideNavbarFooterPaths = [
    "/login",
    "/register",
    "/OTP",
    "/otp",
    "/verify-account",
    "/otpforgetpassword",
    "/changepassword",
    "/createaccount",
    "/resetpassword",
    "/NewOtp",
  ];
  const shouldHideNavbarFooter = hideNavbarFooterPaths.includes(
    location.pathname
  );

  return (
    <>
      {!shouldHideNavbarFooter && <Navbar  favLength={favLength}/>}
      <Routes>
        <Route path="/" element={<Home setFavlength={setFavlength} />} />
        <Route path="/filterproducts" element={<FilterProducts setFavlength={setFavlength} />} />
        <Route path="/products/offers" element={<Offers setFavlength={setFavlength} />} />
        <Route path="/productdetails/:productId" element={<ProtectedRoute> <ProductsDetalis  setFavlength={setFavlength} />  </ProtectedRoute> } />
        <Route path="/cart" element={ <ProtectedRoute> <Cart />  </ProtectedRoute> } />
        <Route path="/favorites" element={<Favorites  setFavlength={setFavlength}/>} />
        <Route path="/checkout" element={ <ProtectedRoute> <Checkout />  </ProtectedRoute> } />
        <Route path="/profile" element={<Profile />} />
        <Route path="/aboutus" element={<AboutUS />} />
        <Route path="/contactus" element={<ContactUS />} />
        <Route path="/individualprofile" element={<IndividualProfile />} />
        <Route path="/category/:categoryKey" element={<FilterProducts  setFavlength={setFavlength}/>} />
        {/* <Route path="/otp" element={<OTP />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/createaccount" element={<Createaccount />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
        <Route path="/otp" element={<OtpVerifyEmail />} />
        <Route path="/NewOtp" element={<NewOTP />} />
        <Route path="/otpforgetpassword" element={<OtpForgetPassword />} />
        <Route path="/changepassword" element={<ChangePassword />} />
        <Route path="/chatting" element={<ChatApp />} />
        <Route path="/all-products" element={<AllProducts />} />
        <Route path="/all-orders" element={<ProtectedRoute> <OrdersList /> </ProtectedRoute> } />
        <Route path="/order-details/:orderId" element={ <ProtectedRoute> <OrderDetails />  </ProtectedRoute> } />
        {/* <Route path="/seller-profile/:sellerId" element={ <ProtectedRoute>  <SellerProfile /> </ProtectedRoute>} /> */}
        <Route path="/Banner/offers" element={<VendorDataOffer/>} />
        <Route path="/terms" element={<Terms/>} />
        <Route path="/policy" element={<Privacy/>} />
        <Route path="/return-policy" element={<ReturnPolicy/>} />
        
        {/* <Route path="/otp-reset" element={<OTPReset />} /> */}
        {/* <Route path="/verify-account" element={<VerifyAccount />} /> */}
        {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
        {/* <Route path="/change-password" element={<ChangePassword />} />  */}
      </Routes>
      {!shouldHideNavbarFooter && <Footer />}
    </>
  );
}
