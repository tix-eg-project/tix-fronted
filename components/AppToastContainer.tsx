"use client";
import { ToastContainer } from "react-toastify";
import { useLanguage } from "@/context/LanguageContext";

export default function AppToastContainer() {
  const { dir } = useLanguage();

  return (
    <ToastContainer
      position={dir === "rtl" ? "top-left" : "top-right"}
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={dir === "rtl"}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
  );
}
