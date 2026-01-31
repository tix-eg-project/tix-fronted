import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FiHeart, FiShoppingBag, FiTrash2, FiArrowRight } from "react-icons/fi";
import { FaRegSadTear, FaHeart } from "react-icons/fa";

import "./Favorites.css";
import axios from "axios";
import ProductCard from "../../component/UI/ProductCard";

export default function Favorites({setFavlength}) {
  const { t , i18n} = useTranslation("global");
  const [favorites, setFavorites] = useState([]);

  let GetAllFavourite= async()=>{
    await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/favorites`,{headers:{
         Accept: "application/json",
            "Accept-Language": i18n.language,
             "Authorization":`Bearer ${localStorage.getItem("token")}`
    }}).then(res=>{
      ////console.log(res);
      setFavorites(res.data.data)
      setFavlength(res.data.data.length)
      
    }).catch(err=>{
      ////console.log(err);
      
    })
  }


  useEffect(()=>{
    GetAllFavourite()
  },[])

 

  

  return (
    <motion.div 
      className="favorites-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="container">
        <div className="favorites-header">
          <h1 className="favorites-title">
            <FiHeart className="favorites-icon" />
            {t("favorites.title", { defaultValue: "قائمة الأمنيات" })}
            <span className="favorites-count">{favorites.length}</span>
          </h1>
          
         
        </div> 

        <AnimatePresence>
          {favorites.length === 0 ? (
            <motion.div
              className="empty-favorites"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <FaRegSadTear className="empty-icon" />
              <h2>{t("favorites.emptyTitle", { defaultValue: "قائمة الأمنيات فارغة" })}</h2>
              <p>
                {t("favorites.emptyMessage", {
                  defaultValue: "لم تقم بإضافة أي منتجات إلى قائمة الأمنيات الخاصة بك بعد",
                })}
              </p>
              <Link to="/" className="btn btn-dark">
                {t("favorites.shopNow", { defaultValue: "تصفح المنتجات" })}
              </Link>
            </motion.div>
          ) : (
            <div className="favorites-grid">
              {favorites.map((item) => (
               <ProductCard  fav={true} key={item.id} item={item} infavoritesPage={true} getProductHaveDiscount={GetAllFavourite}/>
              ))}
            </div>
          )}
        </AnimatePresence>

      
      </div>
    </motion.div>
  );
}