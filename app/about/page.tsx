import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { Users, Target, Award, Globe } from 'lucide-react'
import dictionaries from '@/lib/i18n/dictionaries'

async function getLang(): Promise<'ar' | 'en'> {
  const cookieStore = await cookies()
  return cookieStore.get('lang')?.value === 'en' ? 'en' : 'ar'
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang()
  const d = dictionaries.about[lang]
  return {
    title: d.metaTitle,
    description: d.metaDescription,
  }
}

export default async function AboutPage() {
  const lang = await getLang()
  const t = dictionaries.about[lang]

  const cards = [
    { icon: Target, title: t.visionTitle, desc: t.visionDesc },
    { icon: Award, title: t.missionTitle, desc: t.missionDesc },
    { icon: Users, title: t.teamTitle, desc: t.teamDesc },
    { icon: Globe, title: t.coverageTitle, desc: t.coverageDesc },
  ]

  return (
    <div className="min-h-screen bg-white">
      <main>
        {/* Hero Banner */}
        <section className="bg-gradient-to-l from-dark to-dark-light text-white py-16">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-4">{t.heroTitle}</h1>
            <p className="text-xl text-gray-200">
              {t.heroSubtitle}
            </p>
          </div>
        </section>

        {/* Cards */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {cards.map((item) => (
              <div key={item.title} className="border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow text-center">
                <item.icon className="w-12 h-12 text-dark mx-auto mb-4" />
                <h3 className="text-xl font-bold text-black mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
