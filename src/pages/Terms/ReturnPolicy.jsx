import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

export default function ReturnPolicy() {
  const { i18n, t } = useTranslation();
  const [policy, setPolicy] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/return-policy`,
          {
            headers: {
              Accept: "application/json",
              "Accept-Language": i18n.language,
            },
          }
        );

        if (res.data.status && res.data.data?.content) {
          // ✅ Replace \r\n or \n with <br /> so HTML shows line breaks
          const formattedContent = res.data.data.content
            .replace(/\\r\\n/g, "<br />")
            .replace(/\r\n/g, "<br />")
            .replace(/\n/g, "<br />");

          setPolicy(formattedContent);
        }
      } catch (err) {
        console.error("Error fetching return policy:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, [i18n.language]);

  return (
    <div className="terms-page container mx-auto px-4 py-5">
      <h1 className="text-2xl font-bold mb-4">
        {i18n.language === "ar" ? "سياسة الاسترجاع" : "Return Policy"}
      </h1>

      {loading ? (
        <p>{t("loading")}</p>
      ) : (
        <div
          className="terms-content leading-relaxed p-3"
          style={{
            fontSize: "16px",
            lineHeight: "1.8",
            color: "#333",
            direction: i18n.language === "ar" ? "rtl" : "ltr",
            textAlign: i18n.language === "ar" ? "right" : "left",
          }}
          dangerouslySetInnerHTML={{ __html: policy }}
        ></div>
      )}
    </div>
  );
}
