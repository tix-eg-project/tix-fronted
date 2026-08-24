'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { MapPin, Plus, Pencil, Trash2, Star, X, Save, Loader2, Home, Briefcase, ChevronDown, Search } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '@/lib/api'
import type { ShippingCity } from '@/utils/Types/common'

interface Address {
  id: number
  label: string
  name: string
  phone: string
  city_id?: number | null
  city_name?: string | null
  address: string
  is_default: boolean
}

const EMPTY_FORM = {
  label: '',
  name: '',
  phone: '',
  address: '',
  is_default: false,
}

const LABEL_SUGGESTIONS = ['المنزل', 'العمل', 'العائلة', 'آخر']

export default function AddressesPage() {
  const { state: authState } = useAuth()
  const { t } = useLanguage()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [cities, setCities] = useState<ShippingCity[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [selectedCity, setSelectedCity] = useState<ShippingCity | null>(null)
  const [cityOpen, setCityOpen] = useState(false)
  const [citySearch, setCitySearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [settingDefaultId, setSettingDefaultId] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const cityRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      window.location.href = '/login?redirect=/account/addresses'
    }
  }, [authState.isLoading, authState.isAuthenticated])

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await api.get('/addresses')
      const data = res.data?.data || res.data || []
      setAddresses(Array.isArray(data) ? data : [])
    } catch {
      toast.error(t('account.loadAddressesError'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authState.isAuthenticated) return
    fetchAddresses()
    api.get('/shipping/cities').then(res => {
      const list = res.data?.status
        ? (Array.isArray(res.data.data) ? res.data.data : [])
        : []
      setCities(list)
    }).catch(() => {})
  }, [authState.isAuthenticated, fetchAddresses])

  // close city dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setCityOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function openAdd() {
    setEditId(null)
    setForm(EMPTY_FORM)
    setSelectedCity(null)
    setCitySearch('')
    setShowModal(true)
  }

  function openEdit(addr: Address) {
    setEditId(addr.id)
    setForm({
      label: addr.label || '',
      name: addr.name || '',
      phone: addr.phone || '',
      address: addr.address || '',
      is_default: addr.is_default || false,
    })
    const city = addr.city_id
      ? cities.find(c => c.id === addr.city_id) || null
      : null
    setSelectedCity(city)
    setCitySearch('')
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditId(null)
    setForm(EMPTY_FORM)
    setSelectedCity(null)
    setCitySearch('')
    setCityOpen(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.label.trim() || !form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      toast.error(t('account.fillRequiredFields'))
      return
    }
    setSaving(true)
    try {
      const payload = {
        label: form.label,
        name: form.name,
        phone: form.phone,
        city_id: selectedCity?.id ?? null,
        city_name: selectedCity?.name ?? null,
        address: form.address,
        is_default: form.is_default,
      }
      if (editId) {
        await api.put(`/addresses/${editId}`, payload)
        toast.success(t('account.addressUpdated'))
      } else {
        await api.post('/addresses', payload)
        toast.success(t('account.addressAdded'))
      }
      closeModal()
      await fetchAddresses()
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    try {
      await api.delete(`/addresses/${id}`)
      toast.success(t('account.addressDeleted'))
      setAddresses(prev => prev.filter(a => a.id !== id))
    } catch {
      toast.error(t('account.deleteAddressError'))
    } finally {
      setDeletingId(null)
      setConfirmDeleteId(null)
    }
  }

  async function handleSetDefault(id: number) {
    setSettingDefaultId(id)
    try {
      await api.post(`/addresses/${id}/set-default`)
      toast.success(t('account.defaultAddressSet'))
      setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id })))
    } catch {
      toast.error(t('account.setDefaultError'))
    } finally {
      setSettingDefaultId(null)
    }
  }

  const filteredCities = cities.filter(c =>
    c.name.toLowerCase().includes(citySearch.toLowerCase())
  )

  if (authState.isLoading || loading) {
    return (
      <div className="card p-6 flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{t('account.myAddresses')}</h2>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 !py-2 !px-4 text-sm">
          <Plus className="w-4 h-4" />
          {t('account.addAddress')}
        </button>
      </div>

      {/* Empty state */}
      {addresses.length === 0 && (
        <div className="card p-10 flex flex-col items-center text-center text-text-muted gap-3">
          <MapPin className="w-12 h-12 text-text-faint" />
          <p className="font-medium">{t('account.noAddressesSaved')}</p>
          <p className="text-sm">{t('account.addAddressHint')}</p>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2 !py-2 !px-5 text-sm mt-2">
            <Plus className="w-4 h-4" />
            {t('account.addNewAddress')}
          </button>
        </div>
      )}

      {/* Address cards */}
      <div className="grid gap-3">
        {addresses.map(addr => (
          <div
            key={addr.id}
            className={`card p-4 border-2 transition-colors ${
              addr.is_default ? 'border-primary/40 bg-primary-light/30' : 'border-transparent'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  addr.is_default ? 'bg-primary text-white' : 'bg-surface-2 text-text-muted'
                }`}>
                  {addr.label === 'العمل' ? <Briefcase className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{addr.label}</span>
                    {addr.is_default && (
                      <span className="inline-flex items-center gap-1 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3 fill-white" />
                        {t('account.default')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-text mt-0.5">{addr.name}</p>
                  <p className="text-sm text-text-muted">{addr.phone}</p>
                  <p className="text-sm text-text mt-1 leading-relaxed">
                    {addr.address}
                    {addr.city_name && ` — ${addr.city_name}`}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {!addr.is_default && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    disabled={settingDefaultId === addr.id}
                    title={t('account.setAsDefault')}
                    className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary-light transition-colors"
                  >
                    {settingDefaultId === addr.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Star className="w-4 h-4" />}
                  </button>
                )}
                <button
                  onClick={() => openEdit(addr)}
                  title={t('common.edit')}
                  className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary-light transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setConfirmDeleteId(addr.id)}
                  title={t('common.delete')}
                  className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirm dialog */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="card p-6 max-w-sm w-full text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5 text-error" />
            </div>
            <div>
              <p className="font-semibold">{t('account.deleteAddressTitle')}</p>
              <p className="text-sm text-text-muted mt-1">{t('account.deleteAddressConfirm')}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDeleteId(null)} className="flex-1 btn-outline !py-2 text-sm">
                {t('common.cancel')}
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={deletingId === confirmDeleteId}
                className="flex-1 bg-error text-white rounded-lg py-2 text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center"
              >
                {deletingId === confirmDeleteId ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="card w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-divider sticky top-0 bg-surface z-10">
              <h3 className="font-bold text-base">{editId ? t('account.editAddress') : t('account.addNewAddress')}</h3>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {/* Label */}
              <div>
                <label className="text-xs font-medium mb-1.5 block">
                  {t('account.addressLabel')} <span className="text-error">*</span>
                </label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {LABEL_SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, label: s }))}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        form.label === s
                          ? 'bg-primary text-white border-primary'
                          : 'border-divider text-text-muted hover:border-primary hover:text-primary'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={form.label}
                  onChange={e => setForm(prev => ({ ...prev, label: e.target.value }))}
                  placeholder={t('account.customLabelPlaceholder')}
                  className="input-field text-sm"
                  maxLength={100}
                />
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-medium mb-1 block">
                  {t('account.recipientName')} <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('auth.fullNamePlaceholder')}
                  className="input-field text-sm"
                  maxLength={255}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-medium mb-1 block">
                  {t('account.phone')} <span className="text-error">*</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(prev => ({ ...prev, phone: e.target.value.replace(/[^0-9+]/g, '') }))}
                  placeholder="01xxxxxxxxx"
                  className="input-field text-sm"
                  dir="ltr"
                  maxLength={20}
                />
              </div>

              {/* City dropdown */}
              <div ref={cityRef}>
                <label className="text-xs font-medium mb-1 block">{t('account.governorate')}</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCityOpen(v => !v)}
                    className="input-field text-sm flex items-center justify-between w-full"
                  >
                    <span className={selectedCity ? 'text-text' : 'text-text-faint'}>
                      {selectedCity ? selectedCity.name : t('account.selectGovernorate')}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${cityOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {cityOpen && (
                    <div className="absolute top-full start-0 end-0 mt-1 bg-surface border border-divider rounded-lg shadow-lg z-50 overflow-hidden">
                      <div className="p-2 border-b border-divider">
                        <div className="relative">
                          <Search className="absolute start-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint" />
                          <input
                            type="text"
                            value={citySearch}
                            onChange={e => setCitySearch(e.target.value)}
                            placeholder={t('common.search')}
                            className="w-full h-9 border border-divider rounded text-sm outline-none ps-8 pe-3"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredCities.length === 0 && (
                          <p className="text-center text-text-muted text-sm py-4">{t('common.noResults')}</p>
                        )}
                        {filteredCities.map(city => (
                          <button
                            key={city.id}
                            type="button"
                            onClick={() => { setSelectedCity(city); setCityOpen(false); setCitySearch('') }}
                            className={`w-full text-start px-4 py-2.5 text-sm hover:bg-surface-2 flex justify-between items-center ${
                              selectedCity?.id === city.id ? 'bg-primary-light text-primary font-medium' : ''
                            }`}
                          >
                            <span>{city.name}</span>
                          </button>
                        ))}
                      </div>
                      {selectedCity && (
                        <div className="p-2 border-t border-divider">
                          <button
                            type="button"
                            onClick={() => { setSelectedCity(null); setCityOpen(false) }}
                            className="w-full text-center text-xs text-text-muted hover:text-error py-1"
                          >
                            {t('account.clearSelection')}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-xs font-medium mb-1 block">
                  {t('account.detailedAddress')} <span className="text-error">*</span>
                </label>
                <textarea
                  value={form.address}
                  onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder={t('account.addressPlaceholder')}
                  className="input-field text-sm resize-none"
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-text-faint text-end mt-0.5">{form.address.length}/500</p>
              </div>

              {/* Is Default */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={e => setForm(prev => ({ ...prev, is_default: e.target.checked }))}
                  className="w-4 h-4 accent-primary rounded"
                />
                <span className="text-sm">{t('account.setAsDefaultAddress')}</span>
              </label>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={closeModal} className="flex-1 btn-outline !py-2.5 text-sm">
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 btn-primary !py-2.5 text-sm flex items-center justify-center gap-2"
                >
                  {saving
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><Save className="w-4 h-4" />{editId ? t('account.saveEdits') : t('account.addAddress')}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
