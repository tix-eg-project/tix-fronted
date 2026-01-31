import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "./IndividualProfile.css";

export default function IndividualProfile() {
  const { t, i18n } = useTranslation("global");
  const [activeTab, setActiveTab] = useState("profile");
  const isRTL = i18n.language === "ar";

  return (
    <>
      <div className="breadcrumb">
        <div className="container">
          <h4 className="mt-2">
            {t("navbar.home")} /{" "}
            <span style={{ color: "#e13124" }}>{t("navbar.Profile")}</span>
          </h4>
        </div>
      </div>

      <div className="container profile-settings-container">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3">
            <div className="profile-settings-sidebar">
              <div className="profile-settings-title">
                {t("settings.title")}
              </div>
              <div
                className="profile-settings-tabs"
                style={{ textAlign: isRTL ? "right" : "left" }}
              >
                <button
                  className={`profile-settings-tab-btn${
                    activeTab === "profile" ? " active" : ""
                  }`}
                  onClick={() => setActiveTab("profile")}
                  style={{ textAlign: isRTL ? "right" : "left" }}
                >
                  {t("settings.profileTab")}
                </button>
                <button
                  className={`profile-settings-tab-btn${
                    activeTab === "notifications" ? " active" : ""
                  }`}
                  onClick={() => setActiveTab("notifications")}
                  style={{ textAlign: isRTL ? "right" : "left" }}
                >
                  {t("settings.notificationsTab")}
                </button>
              </div>
            </div>
          </div>
          {/* Main Content */}
          <div className="col-md-9">
            <div className="profile-settings-content">
              {activeTab === "profile" && (
                <div className="profile-settings-profile-tab">
                  <div className="profile-settings-avatar-wrapper">
                    <img
                      src="/avatar.webp"
                      alt="avatar"
                      className="profile-settings-avatar"
                    />
                  </div>
                  <form className="profile-settings-form">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="profile-settings-label">
                          {t("settings.name")}
                        </label>
                        <input
                          type="text"
                          className="form-control profile-settings-input"
                          placeholder={t("settings.namePlaceholder")}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="profile-settings-label">
                          {t("settings.age")}
                        </label>
                        <input
                          type="number"
                          className="form-control profile-settings-input"
                          placeholder={t("settings.agePlaceholder")}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="profile-settings-label">
                          {t("settings.email")}
                        </label>
                        <input
                          type="email"
                          className="form-control profile-settings-input"
                          placeholder={t("settings.emailPlaceholder")}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="profile-settings-label">
                          {t("settings.phone")}
                        </label>
                        <input
                          type="text"
                          className="form-control profile-settings-input"
                          placeholder={t("settings.phonePlaceholder")}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="profile-settings-label">
                          {t("settings.jobTitle")}
                        </label>
                        <input
                          type="text"
                          className="form-control profile-settings-input"
                          placeholder={t("settings.jobTitlePlaceholder")}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="profile-settings-label">
                          {t("settings.accountType")}
                        </label>
                        <select className="form-control profile-settings-input">
                          <option>{t("settings.accountTypeIndividual")}</option>
                          <option>{t("settings.accountTypeCompany")}</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="profile-settings-label">
                          {t("settings.bio")}
                        </label>
                        <textarea
                          className="form-control profile-settings-input"
                          rows="3"
                          placeholder={t("settings.bioPlaceholder")}
                        ></textarea>
                      </div>
                      <div className="col-12 text-end">
                        <button
                          type="submit"
                          className="profile-settings-save-btn"
                        >
                          {t("settings.saveBtn")}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
              {activeTab === "notifications" && (
                <div className="profile-settings-notifications-tab">
                  <form
                    className="profile-settings-form"
                    style={{ maxWidth: 500, margin: "0 auto" }}
                  >
                    <div className="mb-3">
                      <label className="profile-settings-label">
                        {t("settings.notificationsEmail")}
                      </label>
                      <input
                        type="email"
                        className="form-control profile-settings-input"
                        placeholder={t(
                          "settings.notificationsEmailPlaceholder"
                        )}
                      />
                    </div>
                    <div className="mb-3">
                      <div
                        className="profile-settings-notify-desc"
                        style={{ color: "#e13124", fontWeight: 600 }}
                      >
                        {t("settings.notificationsDesc")}
                      </div>
                    </div>
                    <div className="text-end">
                      <button
                        type="submit"
                        className="profile-settings-save-btn"
                      >
                        {t("settings.saveBtn")}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
