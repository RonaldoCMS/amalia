'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useAuthContext } from '../context/AuthContext'
import { ROLE_HIERARCHY } from '@amalia/shared'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { token, userRole } = useAuthContext()
  const t = useTranslations('Admin')

  useEffect(() => {
    if (!token) {
      router.replace('/login')
      return
    }
    const level = ROLE_HIERARCHY[userRole] ?? 0
    if (level < 1) {
      router.replace('/feed')
    }
  }, [token, userRole, router])

  const level = ROLE_HIERARCHY[userRole] ?? 0
  if (level < 1) return null

  const links = [
    { href: '/admin', label: t('dashboard'), min: 1 },
    { href: '/admin/reports', label: t('reports'), min: 1 },
    { href: '/admin/users', label: t('users'), min: 2 },
    { href: '/admin/logs', label: t('logs'), min: 1 },
    { href: '/admin/stats', label: t('stats'), min: 2 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <aside className="w-56 min-h-screen bg-white border-r border-gray-200 p-4 sticky top-0">
          <h2 className="text-lg font-bold mb-6 text-gray-900">{t('adminPanel')}</h2>
          <nav className="space-y-1">
            {links.filter(l => level >= l.min).map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
