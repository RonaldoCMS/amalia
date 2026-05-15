'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useModeration } from '../../../hooks/useModeration'

export default function LogsPage() {
  const t = useTranslations('Admin')
  const { logs, totalLogs, isLoading, loadLogs } = useModeration()
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadLogs({ page, limit: 20 })
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('logs')}</h1>

      {isLoading ? (
        <div className="text-gray-500">{t('loading')}</div>
      ) : logs.length === 0 ? (
        <div className="text-gray-400 text-center py-12">{t('noLogs')}</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm text-gray-500">
                <th className="px-4 py-3">{t('moderator')}</th>
                <th className="px-4 py-3">{t('action')}</th>
                <th className="px-4 py-3">{t('target')}</th>
                <th className="px-4 py-3">{t('date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map(l => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{l.moderator.username}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-0.5">{l.action}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{l.targetUser?.username ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(l.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalLogs > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50"
          >
            {t('prev')}
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-600">
            {page} / {Math.ceil(totalLogs / 20)}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(totalLogs / 20)}
            className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50"
          >
            {t('next')}
          </button>
        </div>
      )}
    </div>
  )
}
