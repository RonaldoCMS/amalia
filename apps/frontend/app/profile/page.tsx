'use client'

import { useEffect, useState, FormEvent, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useAuthContext } from '../context/AuthContext'
import { useProfile } from '../../hooks/useProfile'
import { Footer } from '../components/Footer'
import { AdBanner } from '../components/AdBanner'
import { useLanguage } from '../../i18n/LanguageProvider'
import { LOCALE_DATE_MAP } from '../../i18n/config'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

function InputField({
  label, type = 'text', value, onChange, placeholder, autoComplete,
}: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
}) {
  return (
    <div>
      <label className="block text-xs font-mono text-zinc-500 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 font-mono placeholder-zinc-700 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
      />
    </div>
  )
}

function Alert({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <p className={`text-xs font-mono p-3 rounded-lg border ${
      type === 'success'
        ? 'text-emerald-400 bg-emerald-400/5 border-emerald-400/20'
        : 'text-red-400 bg-red-400/5 border-red-400/20'
    }`}>
      {type === 'success' ? '✓ ' : '✗ '}{message}
    </p>
  )
}

export default function ProfilePage() {
  const { isAuthenticated, logout } = useAuthContext()
  const router = useRouter()
  const { profile, isLoading, updatePassword, deleteAccount, reload } = useProfile()
  const t = useTranslations('Profile')
  const { locale } = useLanguage()

  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoStatus, setPhotoStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwStatus, setPwStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [pwLoading, setPwLoading] = useState(false)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login')
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPwStatus({ type: 'error', msg: t('passwordMismatch') })
      return
    }
    if (newPassword.length < 6) {
      setPwStatus({ type: 'error', msg: t('passwordTooShort') })
      return
    }
    setPwLoading(true)
    setPwStatus(null)
    try {
      await updatePassword({ currentPassword, newPassword })
      setPwStatus({ type: 'success', msg: t('passwordSuccess') })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      setPwStatus({ type: 'error', msg: t('passwordError') })
    } finally {
      setPwLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    setDeleteError(null)
    try {
      await deleteAccount()
      logout()
      router.replace('/')
    } catch {
      setDeleteError(t('deleteError'))
      setDeleteLoading(false)
    }
  }

  const joinDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(LOCALE_DATE_MAP[locale] || 'it-IT', { day: '2-digit', month: 'long', year: 'numeric' })
    : null

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoPreview(URL.createObjectURL(file))
    setPhotoUploading(true)
    setPhotoStatus(null)
    try {
      const token = localStorage.getItem('token')
      const form = new FormData()
      form.append('photo', file)
      const res = await fetch(`/user/photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      if (!res.ok) throw new Error('Upload failed')
      setPhotoStatus({ type: 'success', msg: t('photoUpdated') })
    } catch {
      setPhotoStatus({ type: 'error', msg: t('photoError') })
      setPhotoPreview(null)
    } finally {
      setPhotoUploading(false)
    }
  }

  const currentPhotoUrl = photoPreview
    ? photoPreview
    : profile?.profilePhotoUrl
      ? `${profile.profilePhotoUrl}`
      : null

  return (
    <div className="min-h-screen bg-grid relative flex flex-col pb-16 sm:pb-0">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-cyan-500/3 to-transparent pointer-events-none" />

      <main className="relative z-10 max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6 flex-1">

        {/* Profile info + photo */}
        <section className="border border-zinc-800 rounded-xl p-6 bg-zinc-900/30">
          <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">{t('accountTitle')}</h2>
          {isLoading ? (
            <p className="text-xs text-zinc-600 font-mono">loading<span className="animate-blink">_</span></p>
          ) : (
            <div className="flex gap-6 items-start">
              {/* Photo */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group"
                  title={t('changePhoto')}
                >
                  {currentPhotoUrl ? (
                    <img
                      src={currentPhotoUrl}
                      alt="avatar"
                      className="w-16 h-16 rounded-full object-cover border border-zinc-700"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-2xl font-bold text-zinc-500 font-mono">
                      {profile?.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[10px] text-white font-mono">edit</span>
                  </div>
                </button>
                {photoUploading && <span className="text-[10px] text-zinc-500 font-mono">uploading...</span>}
                {photoStatus && (
                  <span className={`text-[9px] font-mono ${photoStatus.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {photoStatus.type === 'success' ? '✓' : '✗'} {photoStatus.msg}
                  </span>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>

              {/* Info */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-600 font-mono">username</span>
                  <span className="text-sm text-zinc-100 font-mono">{profile?.username}</span>
                </div>
                <div className="h-px bg-zinc-800" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-600 font-mono">email</span>
                  <span className="text-sm text-zinc-400 font-mono">{profile?.email ?? '—'}</span>
                </div>
                <div className="h-px bg-zinc-800" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-600 font-mono">{t('memberSince')}</span>
                  <span className="text-sm text-zinc-400 font-mono">{joinDate}</span>
                </div>
                <div className="h-px bg-zinc-800" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-600 font-mono">onboarding</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-mono ${profile?.onboardingCompleted ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {profile?.onboardingCompleted ? t('onboardingComplete') : t('onboardingIncomplete')}
                    </span>
                    <Link
                      href="/onboarding?edit=true"
                      className="text-xs font-mono text-zinc-600 hover:text-cyan-400 transition-colors underline underline-offset-2"
                    >
                      {t('editOnboarding')}
                    </Link>
                  </div>
                </div>
                <div className="h-px bg-zinc-800" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-600 font-mono">{t('session')}</span>
                  <button
                    onClick={() => { logout(); router.push('/') }}
                    className="text-xs font-mono text-zinc-500 hover:text-red-400 transition-colors border border-zinc-800 hover:border-red-400/30 rounded px-2.5 py-1"
                  >
                    {t('logoutButton')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Change password */}
        <section className="border border-zinc-800 rounded-xl p-6 bg-zinc-900/30">
          <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">{t('changePasswordTitle')}</h2>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <InputField
              label={t('currentPassword')}
              type="password"
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
            />
            <InputField
              label={t('newPassword')}
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
            />
            <InputField
              label={t('confirmPassword')}
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
            />
            {pwStatus && <Alert message={pwStatus.msg} type={pwStatus.type} />}
            <button
              type="submit"
              disabled={pwLoading || !currentPassword || !newPassword || !confirmPassword}
              className="w-full py-2.5 rounded-lg text-sm font-mono font-medium bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {pwLoading ? t('updatingPassword') : t('updatePassword')}
            </button>
          </form>
        </section>

        {/* Danger zone */}
        <section className="border border-red-400/20 rounded-xl p-6 bg-red-400/5">
          <h2 className="text-xs font-mono text-red-400/80 uppercase tracking-widest mb-1">{t('dangerZone')}</h2>
          <p className="text-xs text-zinc-500 font-mono mb-4">
            {t('dangerDescription')}
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 rounded-lg text-xs font-mono font-medium border border-red-400/30 text-red-400 bg-red-400/5 hover:bg-red-400/15 hover:border-red-400/50 transition-all"
          >
            {t('deleteAccount')}
          </button>
        </section>
      </main>

      <div className="relative z-10 max-w-4xl mx-auto w-full px-4 sm:px-6 pb-6">
        <AdBanner format="horizontal" />
      </div>

      <Footer />

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm border border-zinc-800 rounded-xl bg-zinc-950 p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-zinc-100 font-mono mb-2">
              <span className="text-red-400">!</span> {t('deleteConfirmTitle')}
            </h3>
            <p className="text-sm text-zinc-400 mb-6">
              {t('deleteConfirmText')}{' '}
              <span className="text-red-400 font-semibold">{t('deleteConfirmBold')}</span>.
            </p>
            {deleteError && <Alert message={deleteError} type="error" />}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteError(null) }}
                disabled={deleteLoading}
                className="flex-1 py-2 rounded-lg text-sm font-mono border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors disabled:opacity-40"
              >
                {t('deleteCancel')}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 py-2 rounded-lg text-sm font-mono font-medium border border-red-400/40 text-red-400 bg-red-400/10 hover:bg-red-400/20 transition-colors disabled:opacity-40"
              >
                {deleteLoading ? t('deleting') : t('deleteButton')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
