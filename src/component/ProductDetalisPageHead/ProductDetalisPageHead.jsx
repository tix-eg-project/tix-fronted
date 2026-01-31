import React from "react";
import "../ProductDetalisPageHead/ProductDetalisPageHead.css";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function ProductDetalisPageHead({
  services,
  flitercategory,
  Products,
}) {
  const { t, i18n } = useTranslation("global");
  let navigate = useNavigate()
  return (
    <div className="breadcrumb">
      <div className="container">
        <button  style={{border:"none"}} className="mt-2 ">
               <span  onClick={()=> navigate("/")} >{t("navbar.home")} /{" "}</span>
          <span className="">{flitercategory}</span>/{" "}
          <span className="breadcrumb-text">{Products}</span>
        </button>
      </div>
    </div>
  );
}
