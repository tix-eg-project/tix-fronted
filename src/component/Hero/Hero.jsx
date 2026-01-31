import React from "react";
import { useTranslation } from "react-i18next";
import "./Hero.css";
import { Link } from "react-router-dom";

const Hero = () => {
  const { t } = useTranslation("global");

  return (
    <div className="hero hero-gradient">
      <div className="hero-content">
        <h3 className="hero-title">{t("hero.welcome")}</h3>
        <small className="hero-sub">{t("hero.discover")}</small>
        <Link to="/" className="hero-btn">
          {t("hero.shopNow")}
        </Link>
      </div>
    </div>
  );
};

export default Hero;
