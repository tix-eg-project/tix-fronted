'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { User, Mail, Phone, Save } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '@/lib/api'

export default function ProfilePage() {
  const { state: authState, updateUser } = useAuth()
  const { t } = useLanguage()
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (authState.user) {
      setForm({
        name: authState.user.name || '',
        email: authState.user.email || '',
        phone: authState.user.phone || '',
      })
    }
  }, [authState.user])

  useEffect(() => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      window.location.href = '/login?redirect=/account'
    }
  }, [authState.isLoading, authState.isAuthenticated])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.put('/profile', form)
      if (res.data.status) {
        updateUser(form)
        toast.success(t('account.savedChanges'))
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('account.saveError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card p-6">
      <h2 className="text-lg font-bold mb-5">{t('account.personalData')}</h2>
      <form onSubmit={handleSave} className="space-y-4 max-w-lg">
        <div>
          <label className="text-sm font-medium mb-1.5 block">{t('account.name')}</label>
          <div className="relative">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              className="input-field ps-4 pe-10"
            />
            <User className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-faint" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">{t('account.email')}</label>
          <div className="relative">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
              className="input-field ps-4 pe-10"
              dir="ltr"
            />
            <Mail className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-faint" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">{t('account.phone')}</label>
          <div className="relative">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value.replace(/[^0-9]/g, '') }))}
              className="input-field ps-4 pe-10"
              dir="ltr"
            />
            <Phone className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-faint" />
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? t('account.saving') : t('account.saveChanges')}
        </button>
      </form>
    </div>
  )
}
