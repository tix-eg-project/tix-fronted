import React, { useEffect, Suspense, lazy } from "react";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { ToastContainer } from "react-toastify";
import ScrollToTop from "./component/ScrollToTop/ScrollToTop";
import './App.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import  logo from './assests/imgs/logo.svg';
// Lazy load AppRoutes for better performance
const AppRoutes = lazy(() => import("./routes/AppRoutes"));

function App() {
  useEffect(() => {
    // Initialize AOS with performance optimizations
    AOS.init({ 
      duration: 600,
      once: true, // Only animate once
      offset: 100,
      easing: 'ease-out-cubic'
    });
  }, []);

  return (
    <>
      <BrowserRouter>
        <Suspense fallback={<div style={{ 
          display: 'flex', 
          justifyContent: 'center', 

          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px',
          color: '#666'
        }}>

          <div className="text-center">
        <img src={logo}  style={{width: '100px', height: '100px'}} alt="logo" />
        <p className="mt-3 text-dark fw-bold">Loading...</p>
            
            
            </div>
          
          {/* Loading... */}
          
          
          </div>}>
          <AppRoutes />
        </Suspense>
      </BrowserRouter>
      <ToastContainer 
        autoClose={2000}
        position="top-right"
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <ScrollToTop />
    </>
  );
}

export default App;
