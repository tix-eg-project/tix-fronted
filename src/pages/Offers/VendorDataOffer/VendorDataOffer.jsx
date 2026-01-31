


import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import ProductCard from "../../../component/UI/ProductCard";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function VendorDataOffer() {
  const [products, setProducts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [offers, setOffers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(6);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const BannerId = searchParams.get("BannerId");
const {i18n} = useTranslation()

////console.log({offers});
////console.log({products});

  // 📌 Get Data from API
  const fetchData = async () => {
    try {
      const res = await axios.get(
        `https://admin.tix-eg.com/api/vendor/${BannerId}/profile`
      );
      if (res.data.status) {
        setProfile(res.data.data.profile);
        setProducts(res.data.data.products);
        setOffers(res.data.data.offers);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 📌 Pagination Logic
  const indexOfLastProduct = currentPage * perPage;
  const indexOfFirstProduct = indexOfLastProduct - perPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(products.length / perPage);

  // 📌 CRUD Operations
  const handleDelete = (id) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleAdd = (newProduct) => {
    setProducts([newProduct, ...products]);
  };

  const handleUpdate = (id, updatedProduct) => {
    setProducts(products.map((p) => (p.id === id ? updatedProduct : p)));
  };

  return (
    <div className="container py-5">
      {/* Profile Info */}
      {/* {profile && (
        <motion.div
          className="card text-center mb-5"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="card-body">
            <img
              src={profile.image}
              alt={profile.company_name}
              className="rounded-circle mx-auto d-block mb-3"
              style={{ width: "100px", height: "100px", objectFit: "cover" }}
            />
            <h2 className="card-title h4 fw-bold">{profile.company_name}</h2>
            <p className="text-muted">{profile.description}</p>
          </div>
        </motion.div>
      )} */}

       {profile && (
        <div className="card text-center  mb-5 border-0">
          <div className="card-body">
            <img
              src={profile.image}
              alt={profile.company_name}
              className="rounded-circle border border-3 border-primary mb-3"
              style={{ width: "120px", height: "120px", objectFit: "cover" }}
            />
            <h2 className="fw-bold">{profile.company_name}</h2>
            <p className="text-muted">{profile.name}</p>
            <p>{profile.description}</p>
            <div className="row mt-4">
              <div className="col">
                <h4 className="fw-bold text-primary">{products.length}</h4>
                <p className="text-muted">
                  {i18n.language === "ar" ? "المنتجات" : "Products"}
                </p>
              </div>
              <div className="col">
                <h4 className="fw-bold text-success">{offers.length}</h4>
                <p className="text-muted">
                  {i18n.language === "ar" ? "العروض" : "Offers"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="row g-4">
        {currentProducts.map((product, i) => (
          <motion.div
            key={product.id}
            className="col-md-6 col-lg-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ scale: 1.03 }}
          >
            <div className="card shadow-sm h-100">
              <ProductCard
                item={product}
                onDelete={() => handleDelete(product.id)}
                onUpdate={(updated) => handleUpdate(product.id, updated)}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          className="d-flex justify-content-center mt-4 gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={`btn ${
                currentPage === index + 1
                  ? "btn-primary"
                  : "btn-outline-secondary"
              }`}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </motion.div>
      )}

      {/* Offers Section */}
      {offers.length > 0 && (
        <motion.div
          className="card mt-5 shadow-sm"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="card-body">
            <h3 className="h5 fw-bold text-black mb-3"> {i18n.language === "ar" ? "العروض المتاحة" : "Available offers"}</h3>
             
            <ul className="list-unstyled">
              {offers.map((offer, i) => (
                <motion.li
                  key={offer.id}
                  className="mb-2"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <span className="fw-bold">{offer.name}</span> -{" "}
                  <span className="text-success fw-bold">
                    {offer.amount_value}%
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
}







// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   Heart,
//   ShoppingCart,
//   Eye,
//   Star,
//   Percent,
//   Calendar,
//   Gift,
// } from "lucide-react";
//  import ProductCard from "../../../component/UI/ProductCard";
// import { useTranslation } from "react-i18next";

// export default function VendorDataOffer() {
//   const [products, setProducts] = useState([]);
//   const [profile, setProfile] = useState(null);
//   const [offers, setOffers] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [perPage] = useState(6);
// let {i18n} = useTranslation()
//   // 📌 Get BannerId from URL
//   const urlParams = new URLSearchParams(window.location.search);
//   const BannerId = urlParams.get("BannerId") || "4";

//   // 📌 Fetch Data from API
//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(
//         `https://admin.tix-eg.com/api/vendor/${BannerId}/profile`
//       );
//       ////console.log({res});
      
//       if (res.data.status) {
//         setProfile(res.data.data.profile);
//         setProducts(res.data.data.products);
//         setOffers(res.data.data.offers);
//       }
//     } catch (error) {
//       console.error("❌ Error fetching data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [BannerId]);

//   // 📌 Pagination Logic
//   const indexOfLastProduct = currentPage * perPage;
//   const indexOfFirstProduct = indexOfLastProduct - perPage;
//   const currentProducts = products.slice(
//     indexOfFirstProduct,
//     indexOfLastProduct
//   );
//   const totalPages = Math.ceil(products.length / perPage);

//   // 📌 Loading Screen
//   if (loading) {
//     return (
//       <div className="d-flex vh-100 justify-content-center align-items-center bg-light">
//         <div className="spinner-border text-primary" role="status"></div>
//         <span className="ms-3 fw-medium">{i18n.language=="ar"? "جاري التحميل..."  :"Loading...."}</span>
//       </div>
//     );
//   }

//   return (
//     <div className="container py-5">
//       {/* Profile Section */}
//       {profile && (
//         <div className="card text-center shadow mb-5 border-0">
//           <div className="card-body">
//             <img
//               src={profile.image}
//               alt={profile.company_name}
//               className="rounded-circle border border-3 border-primary mb-3"
//               style={{ width: "120px", height: "120px", objectFit: "cover" }}
//             />
//             <h2 className="fw-bold">{profile.company_name}</h2>
//             <p className="text-muted">{profile.name}</p>
//             <p>{profile.description}</p>
//             <div className="row mt-4">
//               <div className="col">
//                 <h4 className="fw-bold text-primary">{products.length}</h4>
//                 <p className="text-muted">{i18n.language=="ar"?  "المنتجات" :"Products"}</p>
//               </div>
//               <div className="col">
//                 <h4 className="fw-bold text-success">{offers.length}</h4>
//                 <p className="text-muted">{i18n.language=="ar" ? "العروض" :"Offers"}</p>
//               </div>
//               {/* <div className="col">
//                 <h4 className="fw-bold text-warning">4.8</h4>
//                 <p className="text-muted">التقييم</p>
//               </div> */}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Offers Section */}
//       {offers.length > 0 && (
//         <div className="card shadow border-0 mb-5">
//           <div className="card-body bg-gradient text-white rounded">
//             <div className="d-flex align-items-center mb-3">
//               <Gift className="me-2" size={24} />
//               <h3 className="fw-bold mb-0">{i18n.language=="ar" ?  "العروض المتاحة":"Available offers"}</h3>
//             </div>
//             {offers.map((offer) => (
//               <div
//                 key={offer.id}
//                 className="d-flex justify-content-between align-items-center bg-dark bg-opacity-25 p-3 rounded mb-2"
//               >
//                 <div>
//                   <h5 className="fw-semibold">{offer.name}</h5>
//                   <small>
//                     <Calendar size={14} className="me-1" />
//                     {new Date(offer.start_date).toLocaleDateString("ar-EG")} -{" "}
//                     {new Date(offer.end_date).toLocaleDateString("ar-EG")}
//                   </small>
//                 </div>
//                 <div className="text-end">
//                   <span className="fs-4 fw-bold">%{offer.amount_value}</span>
//                   <div>{i18n.language=="ar"?"discount" : "خصم"}</div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Products Section */}
//       <h3 className="fw-bold text-center mb-4">{i18n.language=="ar"? "منتجاتنا المميزة" :"Our featured products"}</h3>
//       <div className="row">
//         {currentProducts.map((product) => (
//           <ProductCard key={product.id} product={product} />
//         ))}
//       </div>

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <nav className="d-flex justify-content-center mt-4">
//           <ul className="pagination">
//             <li className={`page-item ${currentPage === 1 && "disabled"}`}>
//               <button
//                 className="page-link"
//                 onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
//               >
//                 {i18n.language=="ar"? "السابق" :"Prev"}
//               </button>
//             </li>
//             {[...Array(totalPages)].map((_, index) => (
//               <li
//                 key={index}
//                 className={`page-item ${
//                   currentPage === index + 1 ? "active" : ""
//                 }`}
//               >
//                 <button
//                   className="page-link"
//                   onClick={() => setCurrentPage(index + 1)}
//                 >
//                   {index + 1}
//                 </button>
//               </li>
//             ))}
//             <li
//               className={`page-item ${
//                 currentPage === totalPages && "disabled"
//               }`}
//             >
//               <button
//                 className="page-link"
//                 onClick={() =>
//                   setCurrentPage(Math.min(totalPages, currentPage + 1))
//                 }
//               >
//                 {i18n.language=="en"?"Next" :"التالي"}
//               </button>
//             </li>
//           </ul>
//         </nav>
//       )}
//     </div>
//   );
// }



// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   Heart,
//   ShoppingCart,
//   Eye,
//   Star,
//   Percent,
//   Calendar,
//   Gift,
// } from "lucide-react";
// import ProductCard from "../../../component/UI/ProductCard";
// import { useTranslation } from "react-i18next";

// export default function VendorDataOffer() {
//   const [products, setProducts] = useState([]);
//   const [profile, setProfile] = useState(null);
//   const [offers, setOffers] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [perPage] = useState(6);
//   let { i18n } = useTranslation();

//   // 📌 Get BannerId from URL
//   const urlParams = new URLSearchParams(window.location.search);
//   const BannerId = urlParams.get("BannerId") || "4";

//   // 📌 Fetch Data from API
//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(
//         `https://admin.tix-eg.com/api/vendor/${BannerId}/profile`
//       );
//       ////console.log({ res });

//       if (res.data.status) {
//         setProfile(res.data.data.profile);
//         setProducts(res.data.data.products);
//         setOffers(res.data.data.offers);
//       }
//     } catch (error) {
//       console.error("❌ Error fetching data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [BannerId]);

//   // 📌 Pagination Logic
//   const indexOfLastProduct = currentPage * perPage;
//   const indexOfFirstProduct = indexOfLastProduct - perPage;
//   const currentProducts = products.slice(
//     indexOfFirstProduct,
//     indexOfLastProduct
//   );
//   const totalPages = Math.ceil(products.length / perPage);

//   // 📌 Loading Screen
//   if (loading) {
//     return (
//       <div className="d-flex vh-100 justify-content-center align-items-center bg-light">
//         <div className="spinner-border text-primary" role="status"></div>
//         <span className="ms-3 fw-medium">
//           {i18n.language === "ar" ? "جاري التحميل..." : "Loading..."}
//         </span>
//       </div>
//     );
//   }

//   return (
//     <div className="container py-5">
//       {/* Profile Section */}
    //   {profile && (
    //     <div className="card text-center shadow mb-5 border-0">
    //       <div className="card-body">
    //         <img
    //           src={profile.image}
    //           alt={profile.company_name}
    //           className="rounded-circle border border-3 border-primary mb-3"
    //           style={{ width: "120px", height: "120px", objectFit: "cover" }}
    //         />
    //         <h2 className="fw-bold">{profile.company_name}</h2>
    //         <p className="text-muted">{profile.name}</p>
    //         <p>{profile.description}</p>
    //         <div className="row mt-4">
    //           <div className="col">
    //             <h4 className="fw-bold text-primary">{products.length}</h4>
    //             <p className="text-muted">
    //               {i18n.language === "ar" ? "المنتجات" : "Products"}
    //             </p>
    //           </div>
    //           <div className="col">
    //             <h4 className="fw-bold text-success">{offers.length}</h4>
    //             <p className="text-muted">
    //               {i18n.language === "ar" ? "العروض" : "Offers"}
    //             </p>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   )}

//       {/* Offers Section */}
//       {offers.length > 0 && (
//         <div className="card shadow border-0 mb-5">
//           <div className="card-body bg-gradient text-white rounded">
//             <div className="d-flex align-items-center mb-3">
//               <Gift className="me-2" size={24} />
//               <h3 className="fw-bold mb-0">
//                 {i18n.language === "ar" ? "العروض المتاحة" : "Available offers"}
//               </h3>
//             </div>
//             {offers.map((offer) => (
//               <div
//                 key={offer.id}
//                 className="d-flex justify-content-between align-items-center bg-dark bg-opacity-25 p-3 rounded mb-2"
//               >
//                 <div>
//                   <h5 className="fw-semibold">{offer.name}</h5>
//                   <small>
//                     <Calendar size={14} className="me-1" />
//                     {new Date(offer.start_date).toLocaleDateString(
//                       i18n.language === "ar" ? "ar-EG" : "en-US"
//                     )}{" "}
//                     -{" "}
//                     {new Date(offer.end_date).toLocaleDateString(
//                       i18n.language === "ar" ? "ar-EG" : "en-US"
//                     )}
//                   </small>
//                 </div>
//                 <div className="text-end">
//                   <span className="fs-4 fw-bold">%{offer.amount_value}</span>
//                   <div>{i18n.language === "ar" ? "خصم" : "Discount"}</div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Products Section */}
//       <h3 className="fw-bold text-center mb-4">
//         {i18n.language === "ar" ? "منتجاتنا المميزة" : "Our featured products"}
//       </h3>
//       <div className="row">
//         {currentProducts.map((product) => (
//           <ProductCard key={product.id} product={product} />
//         ))}
//       </div>

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <nav className="d-flex justify-content-center mt-4">
//           <ul className="pagination">
//             <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
//               <button
//                 className="page-link"
//                 onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
//               >
//                 {i18n.language === "ar" ? "السابق" : "Prev"}
//               </button>
//             </li>
//             {[...Array(totalPages)].map((_, index) => (
//               <li
//                 key={index}
//                 className={`page-item ${
//                   currentPage === index + 1 ? "active" : ""
//                 }`}
//               >
//                 <button
//                   className="page-link"
//                   onClick={() => setCurrentPage(index + 1)}
//                 >
//                   {index + 1}
//                 </button>
//               </li>
//             ))}
//             <li
//               className={`page-item ${
//                 currentPage === totalPages ? "disabled" : ""
//               }`}
//             >
//               <button
//                 className="page-link"
//                 onClick={() =>
//                   setCurrentPage(Math.min(totalPages, currentPage + 1))
//                 }
//               >
//                 {i18n.language === "en" ? "Next" : "التالي"}
//               </button>
//             </li>
//           </ul>
//         </nav>
//       )}
//     </div>
//   );
// }
