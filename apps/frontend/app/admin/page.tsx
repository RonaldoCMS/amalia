'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAdmin } from '../../hooks/useAdmin'
import { useModeration } from '../../hooks/useModeration'

export default function AdminDashboard() {
  const t = useTranslations('Admin')
  const { stats, isLoading: statsLoading, loadStats } = useAdmin()
  const { reports, totalReports, isLoading: reportsLoading, loadReports } = useModeration()

  useEffect(() => {
    loadStats()
    loadReports({ status: 'pending', limit: 5 })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('dashboard')}</h1>

      {/* Stats grid */}
      {statsLoading ? (
        <div className="text-gray-500">{t('loading')}</div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: t('totalUsers'), value: stats.totalUsers },
            { label: t('totalPosts'), value: stats.totalPosts },
            { label: t('totalDuels'), value: stats.totalDuels },
            { label: t('pendingReports'), value: stats.pendingReports, highlight: stats.pendingReports > 0 },
            { label: t('activeBans'), value: stats.activeBans },
          ].map((s, i) => (
            <div key={i} className={`bg-white rounded-xl p-4 shadow-sm border ${s.highlight ? 'border-red-300' : 'border-gray-200'}`}>
              <div className="text-sm text-gray-500">{s.label}</div>
              <div className={`text-2xl font-bold ${s.highlight ? 'text-red-600' : 'text-gray-900'}`}>{s.value}</div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Recent pending reports */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="font-semibold text-lg mb-4">{t('recentPendingReports')}</h2>
        {reportsLoading ? (
          <div className="text-gray-500">{t('loading')}</div>
        ) : reports.length === 0 ? (
          <div className="text-gray-400 text-sm">{t('noReports')}</div>
        ) : (
          <div className="space-y-3">
            {reports.map(r => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <span className="text-sm font-medium">{r.reporter.username}</span>
                  <span className="text-gray-400 mx-2">&rarr;</span>
                  <span className="text-sm">{r.targetType}</span>
                  <span className="ml-2 text-xs text-gray-500 bg-gray-100 rounded px-1.5 py-0.5">{r.reason}</span>
                </div>
                <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
