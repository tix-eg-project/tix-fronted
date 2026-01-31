import React from "react";
import "../FliterPageHead/FliterPageHead.css";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function FliterPageHead({ services, flitercategory }) {
  const { t, i18n } = useTranslation("global");
  let navigate = useNavigate()
  return (
    <div className="breadcrumb">
      <div className="container">
        <p  style={{border:"none"}} className="mt-2">
         <span style={{cursor:"pointer"}}  onClick={()=> navigate("/")}> {t("navbar.home")}</span> /{" "}
         
          <span onClick={()=> navigate(-1)}  className="breadcrumb-item">{flitercategory}</span>
        </p>
      </div>
    </div>
  );
}
