"use client"
import { Truck, ShieldCheck, Headphones, CreditCard } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

export default function Features() {
  const { t } = useLanguage()

  const features = [
    {
      icon: Truck,
      title: t("home.featureShippingTitle"),
      description: t("home.featureShippingDesc"),
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: ShieldCheck,
      title: t("home.featurePaymentTitle"),
      description: t("home.featurePaymentDesc"),
      color: "bg-green-50 text-green-600",
    },
    {
      icon: CreditCard,
      title: t("home.featureCodTitle"),
      description: t("home.featureCodDesc"),
      color: "bg-purple-50 text-purple-600",
    },
    {
      icon: Headphones,
      title: t("home.featureSupportTitle"),
      description: t("home.featureSupportDesc"),
      color: "bg-orange-50 text-orange-600",
    },
  ]

  return (
    <section className="py-16 border-y border-gray-100 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x-0 md:divide-x rtl:md:divide-x-reverse divide-gray-100">
          {features.map((feature, idx) => (
            <div key={idx} className="flex flex-col md:flex-row items-center md:items-start text-center md:text-start gap-4 px-4">
              <div className={`flex-shrink-0 w-12 h-12 rounded-2xl ${feature.color} flex items-center justify-center shadow-sm`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm md:text-base text-gray-900">{feature.title}</h3>
                <p className="text-gray-500 text-[11px] md:text-xs mt-0.5">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
