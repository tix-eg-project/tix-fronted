import React from "react";
import "../PageHead/PageHead.css";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function PageHead({ header }) {
  const { t, i18n } = useTranslation("global");
  let navigate = useNavigate()
  return (
    <div className="breadcrumb">
      <div className="container">
      <button style={{border:"none"}} className="mt-2">
         <span  onClick={()=> navigate("/")} >{t("navbar.home")} /{" "}</span>
      
          <button  onClick={()=> navigate(-1)} style={{ color: "#e13124" }}>{header}</button>
        </button>
      </div>
    </div>
  );
}
