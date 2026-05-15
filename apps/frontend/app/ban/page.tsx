'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuthContext } from '../context/AuthContext'

export default function BanPage() {
  const { banInfo, logout } = useAuthContext()
  const router = useRouter()
  const t = useTranslations('Ban')

  const handleLogout = () => {
    logout()
    router.replace('/')
  }

  const formattedDate =
    banInfo?.bannedUntil
      ? new Date(banInfo.bannedUntil).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : null

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-900 border border-red-800 rounded-2xl p-8 text-center shadow-2xl">
        <div className="text-6xl mb-6">🚫</div>

        <h1 className="text-2xl font-bold text-red-400 mb-3">{t('title')}</h1>
        <p className="text-gray-400 mb-6 text-sm leading-relaxed">{t('subtitle')}</p>

        {banInfo?.banReason && (
          <div className="bg-gray-800 rounded-xl px-4 py-3 mb-4 text-left">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t('reason')}</p>
            <p className="text-gray-200 text-sm">{banInfo.banReason}</p>
          </div>
        )}

        <div className="bg-gray-800 rounded-xl px-4 py-3 mb-8 text-left">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            {banInfo?.permanent ? t('permanent') : t('expiry')}
          </p>
          {!banInfo?.permanent && formattedDate && (
            <p className="text-gray-200 text-sm">{formattedDate}</p>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-700 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          {t('logout')}
        </button>
      </div>
    </div>
  )
}
