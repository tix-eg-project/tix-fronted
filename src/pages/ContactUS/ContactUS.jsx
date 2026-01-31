



import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./ContactUS.css";
import PageHead from "../../component/PageHead/PageHead";
import { FaMapMarkerAlt, FaPhoneAlt, FaClock, FaWhatsapp } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { apiRequest } from "../../Redux/Apis/apiRequest";
import { IoMailOpen } from "react-icons/io5";
import { data } from "react-router-dom";
import { toast } from "react-toastify";

export default function ContactUS() {
  const { t, i18n } = useTranslation("global");
  const isRTL = i18n.language === "ar";


    useEffect(() => {
    window.scrollTo(0,0)
  }, []);

  let dispatch = useDispatch();
  let { stayTouch } = useSelector((state) => state.api);
  ////console.log({ stayTouch });

  useEffect(() => {
    dispatch(
      apiRequest({
        url: "api/stay-in-touch",
        entity: "stayTouch",
        method: "GET",
        headers: {
          "Accept-Language": i18n.language,
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
    );
  }, [dispatch, i18n.language]);

 
const handleSubmit = (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const values = Object.fromEntries(formData.entries());

  // ✅ Validation
  if (!values.full_name.trim()) {
    toast.error(i18n.language === "ar" ? "من فضلك أدخل الاسم الكامل" : "Please enter your full name");
    return;
  }

  if (!values.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    toast.error(i18n.language === "ar" ? "من فضلك أدخل بريد إلكتروني صحيح" : "Please enter a valid email");
    return;
  }

  // 📱 التحقق من رقم موبايل مصري
  const egyptPhoneRegex = /^01[0-2,5]{1}[0-9]{8}$/;
  if (!values.phone.trim() || !egyptPhoneRegex.test(values.phone)) {
    toast.error(i18n.language === "ar" ? "من فضلك أدخل رقم هاتف مصري صحيح" : "Please enter a valid Egyptian phone number");
    return;
  }

  if (!values.subject.trim()) {
    toast.error(i18n.language === "ar" ? "من فضلك أدخل الموضوع" : "Please enter a subject");
    return;
  }

  if (!values.message.trim()) {
    toast.error(i18n.language === "ar" ? "من فضلك أدخل الرسالة" : "Please enter a message");
    return;
  }

  // ✅ لو كله تمام
  dispatch(apiRequest({
    url: "api/contact-us",
    method: "POST",
    entity: "contactus",
    data: formData
  }));

  ////console.log("Form Values:", values);
};

  return (
    <>
      <PageHead header={t("navbar.contactUs")} />

      <section className="contact-section" dir={isRTL ? "ltr" : "ltr"}>
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="contact-form">
             <h4 className={isRTL ? "text-end" : "text-start"}>
  {t("contactPage.customRequest")}
</h4>

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-lg-6">
                      <input
                        type="text"
                        name="full_name"
                        className="form-control"
                        placeholder={i18n.language == "ar" ? "الاسم الكامل" : "Full Name"}
                        // dir={isRTL ? "rtl" : "ltr"}
                        style={{ textAlign: isRTL ? "right" : "left" }}
                      />
                    </div>
                    <div className="col-lg-6">
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        placeholder={t("contactPage.email")}
                        // dir={isRTL ? "rtl" : "ltr"}
                        // style={{ textAlign: isRTL ? "right" : "left" }}
                      />
                    </div>
                    <div className="col-lg-6">
                      <input
                        type="tel"
                        name="phone"
                        className="form-control"
                        placeholder={t("contactPage.phone")}
                        dir={isRTL ? "rtl" : "ltr"}
                        style={{ textAlign: isRTL ? "right" : "left" }}
                      />
                    </div>
                    <div className="col-lg-6">
                      <input
                        type="text"
                        name="subject"
                        className="form-control"
                        placeholder={t("contactPage.subject")}
                        dir={isRTL ? "rtl" : "ltr"}
                        style={{ textAlign: isRTL ? "right" : "left" }}
                      />
                    </div>
                    <div className="col-lg-12">
                      <textarea
                        name="message"
                        className="form-control"
                        placeholder={t("contactPage.message")}
                        dir={isRTL ? "rtl" : "ltr"}
                        style={{ textAlign: isRTL ? "right" : "left" }}
                      ></textarea>
                    </div>
                  </div>
                  <button type="submit">{t("contactPage.submit")}</button>
                </form>

              </div>
            </div>
            <div className="col-lg-4">
              <div className="contact-info">
                <h6 className="text-center">{t("contactPage.stayInTouch")}</h6>
                <p className="d-flex align-items-center gap-2">
                  <FaMapMarkerAlt className="contact-icon" />
                  <a
                    target="_blank"
                    rel="noreferrer"
                     href={stayTouch?.data?.data[0]?.map_link}
                    className="text-muted"
                    style={{ fontSize: "14px" }}
                  >
                    {stayTouch?.data?.data[0]?.address[0]}
                  </a>
                </p>
                {stayTouch?.data?.data[0]?.phones?.map((number, index) => (
                  <p key={index} className="d-flex align-items-center gap-2">
                    <FaPhoneAlt className="contact-icon" />
                    {number}
                  </p>
                ))}
                <p className="d-flex align-items-center gap-2">
                  <FaClock className="contact-icon" />
                  {stayTouch?.data?.data[0]?.work_hours}
                </p>
                <p>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={stayTouch?.data?.data[0]?.whatsapp_link}
                    className="d-flex text-muted align-items-center gap-2"
                  >
                    <FaWhatsapp className="contact-icon" />
                    {i18n.language === "ar" ? "واتساب" : "WhatsApp"}
                  </a>
                </p>
                <p>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={stayTouch?.data?.data[0]?.web_link[0]}
                    className="d-flex text-muted align-items-center gap-2"
                  >
                    <FaClock className="contact-icon" />
                    {i18n.language === "ar" ? "ويب" : "Web Link"}
                  </a>
                </p>
              
                <p dir="ltr">
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={stayTouch?.data?.data[0]?.email}
                    className="d-flex text-muted align-items-center gap-2"
                  >
                    <IoMailOpen className="contact-icon" />
                    {stayTouch?.data?.data[0]?.email}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}



