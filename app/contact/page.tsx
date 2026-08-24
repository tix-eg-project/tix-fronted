import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react'
import dictionaries from '@/lib/i18n/dictionaries'

async function getLang(): Promise<'ar' | 'en'> {
  const cookieStore = await cookies()
  return cookieStore.get('lang')?.value === 'en' ? 'en' : 'ar'
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang()
  const d = dictionaries.contact[lang]
  return {
    title: d.metaTitle,
    description: d.metaDescription,
  }
}

export default async function ContactPage() {
  const lang = await getLang()
  const t = dictionaries.contact[lang]

  return (
    <div className="min-h-screen bg-white">
      <main>
        {/* Hero Banner */}
        <section className="bg-gradient-to-l from-dark to-dark-light text-white py-16">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-4">{t.heroTitle}</h1>
            <p className="text-xl text-gray-200">{t.heroSubtitle}</p>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Phone, title: t.phoneLabel, value: '+20 123 456 7890', href: 'tel:+201234567890' },
              { icon: Mail, title: t.emailLabel, value: 'info@tix-eg.com', href: 'mailto:info@tix-eg.com' },
              { icon: MapPin, title: t.addressLabel, value: t.addressValue, href: '#' },
            ].map((item) => (
              <a
                key={item.title}
                href={item.href}
                className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
              >
                <item.icon className="w-12 h-12 text-dark mx-auto mb-4" />
                <h3 className="text-lg font-bold text-black mb-2">{item.title}</h3>
                <p className="text-black font-semibold mb-2" dir="ltr">
                  {item.value}
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* Contact Form */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-white p-8 rounded-lg max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-black mb-6 flex items-center gap-2">
                <Send className="w-6 h-6 text-dark" />
                {t.sendMessageTitle}
              </h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.nameLabel}</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark focus:border-transparent"
                      placeholder={t.namePlaceholder}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.emailFieldLabel}</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark focus:border-transparent"
                      placeholder="email@example.com"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.subjectLabel}</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark focus:border-transparent"
                    placeholder={t.subjectPlaceholder}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.messageLabel}</label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark focus:border-transparent"
                    rows={5}
                    placeholder={t.messagePlaceholder}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-dark text-white py-3 rounded-lg hover:bg-dark-light transition-colors font-bold text-lg"
                >
                  {t.sendButton}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
