'use client'
import { useEffect, useState } from 'react'
import { ShieldCheck, MailCheck, MailX, RotateCw, ArrowRight, ArrowLeft } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import type { PendingVerification } from '@/utils/Types/auth'

/** Matches the API's per-address limit (5 a minute) with room to spare. */
const RESEND_COOLDOWN_SECONDS = 60

/**
 * The "enter the code we emailed you" screen, shared by sign-up and by a
 * login whose email was never confirmed. A correct code signs the customer
 * in (onVerified); "resend" asks for a new code after a short cooldown, so a
 * code that expired or never arrived is not a dead end.
 */
export default function EmailVerificationStep({
  pending,
  onVerified,
  onBack,
}: {
  pending: PendingVerification
  onVerified: () => void
  onBack?: () => void
}) {
  const { t, dir } = useLanguage()
  const { verifyEmail, resendVerificationCode } = useAuth()
  const [code, setCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [mailFailed, setMailFailed] = useState(!pending.emailSent)
  const [cooldown, setCooldown] = useState(pending.emailSent ? RESEND_COOLDOWN_SECONDS : 0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6 || verifying) return
    setVerifying(true)
    try {
      await verifyEmail(pending.email, code)
      onVerified()
    } catch (error: any) {
      toast.error(error.message || t('auth.invalidCode'))
      setVerifying(false)
    }
  }

  const onResend = async () => {
    if (cooldown > 0 || resending) return
    setResending(true)
    try {
      const sent = await resendVerificationCode(pending.email)
      setMailFailed(!sent)
      if (sent) {
        toast.success(t('auth.resendCodeSuccess'))
        setCode('')
        setCooldown(RESEND_COOLDOWN_SECONDS)
      } else {
        toast.error(t('auth.codeNotSent'))
      }
    } catch (error: any) {
      toast.error(error.message || t('auth.resendCodeError'))
    } finally {
      setResending(false)
    }
  }

  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex flex-col items-center text-center gap-2 mb-2">
        {/* Never "sent to ..." when it was not: the customer would wait for a
            mail that is not coming instead of pressing resend. */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${mailFailed ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
          {mailFailed ? <MailX className="w-6 h-6" /> : <MailCheck className="w-6 h-6" />}
        </div>
        <h2 className="text-lg font-bold">{t('auth.verifyEmailTitle')}</h2>
        <p className="text-sm text-text-muted">
          {mailFailed ? t('auth.codeNotSentTo') : t('auth.enterCodeSentTo')}{' '}
          <strong dir="ltr" className="text-text">{pending.email}</strong>
        </p>
      </div>

      {mailFailed ? (
        <p className="text-xs rounded-lg bg-amber-50 text-amber-800 px-3 py-2">{t('auth.codeNotSent')}</p>
      ) : (
        <p className="text-xs rounded-lg bg-gray-50 text-text-muted px-3 py-2">{t('auth.checkSpam')}</p>
      )}

      <div>
        <label className="text-sm font-medium mb-1.5 block">{t('auth.verificationCode')}</label>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="input-field text-center tracking-[0.5em] text-xl font-semibold"
          placeholder="••••••"
          dir="ltr"
          autoFocus
          required
        />
      </div>

      <button
        type="submit"
        disabled={verifying || code.length !== 6}
        className="btn-primary w-full !py-3.5 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {verifying ? (
          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          <>
            <ShieldCheck className="w-5 h-5" />
            {t('auth.verifyAndContinue')}
          </>
        )}
      </button>

      <div className="flex items-center justify-between text-sm">
        {onBack ? (
          <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-text-muted hover:text-text">
            <BackIcon className="w-4 h-4" />
            {t('auth.changeEmail')}
          </button>
        ) : <span />}
        <button
          type="button"
          onClick={onResend}
          disabled={cooldown > 0 || resending}
          className="inline-flex items-center gap-1 font-medium text-dark hover:underline disabled:text-text-faint disabled:no-underline disabled:cursor-not-allowed"
        >
          <RotateCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
          {cooldown > 0 ? t('auth.resendIn', { seconds: cooldown }) : t('auth.resendCode')}
        </button>
      </div>
    </form>
  )
}
