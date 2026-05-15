'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAdmin } from '../../../hooks/useAdmin'
import { RoleBadge } from '../../components/RoleBadge'

export default function AdminUsersPage() {
  const t = useTranslations('Admin')
  const router = useRouter()
  const { users, totalUsers, isLoading, loadUsers } = useAdmin()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadUsers({ page, limit: 20, search: search || undefined })
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    setPage(1)
    loadUsers({ page: 1, limit: 20, search: search || undefined })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('users')}</h1>

      <div className="flex gap-2 mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder={t('searchUsers')}
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          {t('search')}
        </button>
      </div>

      {isLoading ? (
        <div className="text-gray-500">{t('loading')}</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm text-gray-500">
                <th className="px-4 py-3">{t('username')}</th>
                <th className="px-4 py-3">{t('role')}</th>
                <th className="px-4 py-3">{t('status')}</th>
                <th className="px-4 py-3">{t('joinDate')}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {u.profilePhotoUrl ? (
                        <img src={u.profilePhotoUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-sm">{u.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-4 py-3">
                    {u.bannedUntil && new Date(u.bannedUntil) > new Date() ? (
                      <span className="text-xs bg-red-100 text-red-700 rounded-full px-2 py-0.5">{t('banned')}</span>
                    ) : u.isMuted ? (
                      <span className="text-xs bg-yellow-100 text-yellow-700 rounded-full px-2 py-0.5">{t('muted')}</span>
                    ) : (
                      <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5">{t('active')}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => router.push(`/admin/users/${u.id}`)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {t('details')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalUsers > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50"
          >
            {t('prev')}
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-600">
            {page} / {Math.ceil(totalUsers / 20)}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(totalUsers / 20)}
            className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50"
          >
            {t('next')}
          </button>
        </div>
      )}
    </div>
  )
}
