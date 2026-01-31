





import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoIosHeartEmpty, IoIosHeart } from 'react-icons/io';
import axios from "axios";
import { ProductImageGallery } from '../../pages/ProductDIscountSection/ProductDIscountSection';
import { toast } from 'react-toastify';
import { useTranslation } from "react-i18next";

// ====================== ProductCard Component ======================
export default function ProductCard({ 
  item , 
  getProductHaveDiscount = () => {}, 
  getFav = () => {}, 
  infavoritesPage = false ,
  fav = false
}) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(item?.is_fav || infavoritesPage);
  const [token, setToken] = useState(null);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token'); 
    setToken(storedToken);
  }, [i18n.language]);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    if (isLoadingFavorite) return;

    setIsLoadingFavorite(true);
    
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/favorites/toggle`,
        { product_id:item?.id },
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": i18n.language,
            "Authorization": `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        const newFavoriteState = !isFavorite;
        setIsFavorite(newFavoriteState);
        
        toast.success(newFavoriteState 
          ? (isRTL ? "تمت الإضافة إلى المفضلة" : "Added to favourites") 
          : (isRTL ? "تمت الإزالة من المفضلة" : "Removed from favourites")
        );
        
        getProductHaveDiscount();
        getFav();
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error(error.response?.data?.message || (isRTL ? "فشل في تحديث المفضلة" : "Failed to update favorites"));
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  return (
    <>
      <motion.div
        className="product_card border rounded-4 overflow-hidden position-relative bg-white shadow-sm"
        key={item.id}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ type: "spring", stiffness: 300 }}
        whileHover={{ y: -5, transition: { type: "spring", stiffness: 400 } }}
      >
        <Link to={`/productdetails/${item?.id}`}>
          <ProductImageGallery
            images={item?.images}
            productName={item?.name}
          />
        </Link>
        
        {item?.discount > 0 && (
          <motion.div
            className="position-absolute top-0 start-0 bg-danger text-white px-3 py-1 fw-bold"
            style={{ borderRadius: "0 0 15px 0", fontSize: "14px" }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {item?.discount}%
          </motion.div>
        )}

     
        <motion.div 
          className="p-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.p 
            className="line-height fw-bold mb-1"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {item?.name}
          </motion.p>
          {item?.category && item?.category.length > 0 && (
          <motion.div 
            className='d-flex gap-2 '
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <small style={{ borderRadius:"20px", width:"fit-content" , fontSize:"10px", padding:"5px"}} className="mb-2 bg-danger main-color d-block text-white fw-bold">
              {item?.category}
            </small>
          
           
          </motion.div>
          )}
         
            

          <motion.div 
            className="text-sm d-flex justify-content-between align-items-center"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div>
              <span className="fw-bold mx-1 main-color">
                {item?.price_after} {isRTL ? "ج.م" : "EGP"}
                <span className="p-2 text-decoration-line-through text-muted">
                  {item?.price_before} {isRTL ? "ج.م" : "EGP"}
                </span>
              </span>
            </div>
          </motion.div>
{item?.short_description && item?.short_description.length > 0 && (
          <small style={{ borderRadius:"20px", width:"fit-content"  , fontSize:"10px", padding:"5px"}} className="mb-2  main-color d-block text-dark fw-bold">
              {item?.short_description && item?.short_description.length > 0 ? item?.short_description : ""}
            </small>
            )}
            {item?.brand && item?.brand.length > 0 && (
          <small style={{ borderRadius:"20px", width:"fit-content" , fontSize:"10px", padding:"5px"}} className="mb-2  bg-secondary main-color d-block text-white fw-bold">
              {item?.brand && item?.brand.length > 0 ? item?.brand : ""}
            </small>
            )}
            {item?.company && item?.company.length > 0 && ( 

           <motion.div 
            className="d-inline-block mb-1 rates"
            style={{fontSize:"12px"}}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
          {item.company !=null ? item.company:""}
          </motion.div>
            )}
          <motion.div 
            className="d-flex  justify-content-center align-items-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="my-6 w-100">
              <motion.div
                whileHover={{ y: -1  }}
                whileTap={{ scale: 0.98 }}
              
              >
                {/* {fav && (
                  <motion.button 
                    onClick={toggleFavorite}
                    className="d-flex mt-2 justify-content-center align-items-center rounded-pill bg-danger text-white fw-bold"
                    style={{ 
                      border: "none", 
                      top: "10px", 
                      right: "10px", 
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      zIndex: 10
                    }}
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.9)" }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                  <div className=''>
                      {isFavorite || infavoritesPage ? (
                      <div className='d-flex btn   text-white justify-content-center align-items-center'>
                        <IoIosHeart className="text-white fs-5" /> 
                        {isRTL ? "إزالة من المفضلة" : "Remove from favourites"}
                      </div>
                    ) : (
                      <div className='d-flex mt-2 btn bg-light text-danger justify-content-center align-items-center'>
                        <IoIosHeartEmpty className="text-danger fs-5" /> 
                        {isRTL ? "إضافة إلى المفضلة" : "Add to favourites"}
                      </div>
                    )}
                  </div>
                  </motion.button>
                )} */}
                    {fav && (
              <motion.button 
                onClick={toggleFavorite}
                className="btn w-100 py-2 fw-semibold"
                style={{ 
                  border: "none", 
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  borderRadius: "12px",
                  fontSize: "14px"
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                {isFavorite || infavoritesPage ? (
                  <div 
                    className='d-flex align-items-center justify-content-center gap-2 text-white'
                    style={{
                      background: "linear-gradient(135deg, #dc3545 0%, #c82333 100%)",
                      borderRadius: "12px",
                      padding: "8px 16px"
                    }}
                  >
                    <IoIosHeart className="fs-5" /> 
                    <span>{isRTL ? "إزالة من المفضلة" : "Remove from favourites"}</span>
                  </div>
                ) : (
                  <div 
                    className='d-flex align-items-center justify-content-center gap-2 text-danger'
                    style={{
                      background: "rgba(220, 53, 69, 0.1)",
                      border: "2px solid rgba(220, 53, 69, 0.2)",
                      borderRadius: "12px",
                      padding: "8px 16px"
                    }}
                  >
                    <IoIosHeartEmpty className="fs-5" /> 
                    <span>{isRTL ? "إضافة إلى المفضلة" : "Add to favourites"}</span>
                  </div>
                )}
              </motion.button>
            )}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}



