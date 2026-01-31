import React from "react";
import { useTranslation } from "react-i18next";
import "./Features.css";

const Features = () => {
  const { t } = useTranslation("global");

  const features = [
    {
      icon: "bi bi-truck",
      title: "features.fastDelivery.title",
      description: "features.fastDelivery.description",
      color: "#e13124",
    },
    {
      icon: "bi bi-shield-check",
      title: "features.qualityGuarantee.title",
      description: "features.qualityGuarantee.description",
      color: "#f76d17",
    },
    {
      icon: "bi bi-headset",
      title: "features.support.title",
      description: "features.support.description",
      color: "#e13124",
    },
  ];

  return (
    <div className="features-section">
      <div className="container">
        <div className="row">
          <h4 className="features-title text-center">{t("features.title")}</h4>
          {features.map((feature, index) => (
            <div key={index} className="col-lg-4 col-md-6 col-12 mb-4">
              <div
                className="feature-card"
                style={{ "--feature-color": feature.color }}
              >
                <div className="feature-icon-container">
                  <i className={feature.icon}></i>
                </div>
                <h3 className="feature-title">{t(feature.title)}</h3>
                <p className="feature-description">{t(feature.description)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
