'use client'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { User, Mail, Phone, Save, Camera, AtSign, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '@/lib/api'

export default function ProfilePage() {
  const { state: authState, updateUser } = useAuth()
  const { t } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (authState.user) {
      setForm({
        name: authState.user.name || '',
        username: authState.user.username || '',
        email: authState.user.email || '',
        phone: authState.user.phone || '',
      })
      const userImg = authState.user.image_url || authState.user.image || null
      if (userImg) {
        setImagePreview(userImg)
      }
    }
  }, [authState.user])

  useEffect(() => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      window.location.href = '/login?redirect=/account'
    }
  }, [authState.isLoading, authState.isAuthenticated])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صالح')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب ألا يتجاوز 5 ميغابايت')
      return
    }

    setImageFile(file)
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('username', form.username)
      formData.append('email', form.email)
      formData.append('phone', form.phone)
      if (imageFile) {
        formData.append('image', imageFile)
      }

      const res = await api.post('/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (res.data.status) {
        const returnedData = res.data.data
        updateUser(returnedData || { ...form, image: imagePreview || undefined })
        toast.success(t('account.savedChanges') || 'تم حفظ التغييرات بنجاح')
      }
    } catch (error: any) {
      const validationErrors = error.response?.data?.data
      if (validationErrors && typeof validationErrors === 'object') {
        const firstKey = Object.keys(validationErrors)[0]
        const firstError = validationErrors[firstKey]
        toast.error(Array.isArray(firstError) ? firstError[0] : firstError)
      } else {
        toast.error(error.response?.data?.message || t('account.saveError') || 'حدث خطأ أثناء حفظ التعديلات')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card p-6">
      <h2 className="text-lg font-bold mb-5">{t('account.personalData') || 'البيانات الشخصية'}</h2>

      {/* Profile Avatar Section */}
      <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100">
        <div className="relative group">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-primary/20 flex items-center justify-center">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt={form.name || 'User Avatar'}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-gray-400" />
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 end-0 bg-primary text-white p-1.5 rounded-full shadow-md hover:bg-primary-dark transition-all"
            title="تغيير الصورة"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        <div>
          <h3 className="font-semibold text-gray-900">{form.name || 'المستخدم'}</h3>
          {form.username && (
            <p className="text-sm text-primary font-mono" dir="ltr">@{form.username}</p>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-primary hover:underline mt-1 block"
          >
            تغيير الصورة الشخصية
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4 max-w-lg">
        {/* Name */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">{t('account.name') || 'الاسم'}</label>
          <div className="relative">
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="input-field ps-4 pe-10"
            />
            <User className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-faint" />
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">اسم المستخدم (Username)</label>
          <div className="relative">
            <input
              type="text"
              placeholder="username"
              value={form.username}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  username: e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''),
                }))
              }
              className="input-field ps-4 pe-10 font-mono"
              dir="ltr"
            />
            <AtSign className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-faint" />
          </div>
          <p className="text-xs text-gray-500 mt-1">حروف إنجليزية وأرقام ونقاط فقط</p>
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">{t('account.email') || 'البريد الإلكتروني'}</label>
          <div className="relative">
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="input-field ps-4 pe-10"
              dir="ltr"
            />
            <Mail className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-faint" />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">{t('account.phone') || 'رقم الهاتف'}</label>
          <div className="relative">
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  phone: e.target.value.replace(/[^0-9+]/g, ''),
                }))
              }
              className="input-field ps-4 pe-10"
              dir="ltr"
            />
            <Phone className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-faint" />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t('account.saving') || 'جاري الحفظ...'}</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{t('account.saveChanges') || 'حفظ التعديلات'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
