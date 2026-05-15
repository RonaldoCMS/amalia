'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAdmin } from '../../../hooks/useAdmin'

export default function StatsPage() {
  const t = useTranslations('Admin')
  const { stats, trends, isLoading, loadStats, loadTrends } = useAdmin()

  useEffect(() => {
    loadStats()
    loadTrends()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('stats')}</h1>

      {isLoading ? (
        <div className="text-gray-500">{t('loading')}</div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: t('totalUsers'), value: stats.totalUsers },
              { label: t('totalPosts'), value: stats.totalPosts },
              { label: t('totalDuels'), value: stats.totalDuels },
              { label: t('totalChallenges'), value: stats.totalChallenges },
              { label: t('totalJobs'), value: stats.totalJobs },
              { label: t('totalReports'), value: stats.totalReports },
              { label: t('pendingReports'), value: stats.pendingReports },
              { label: t('activeBans'), value: stats.activeBans },
              { label: t('activeModerators'), value: stats.activeModerators },
              { label: t('activeAdmins'), value: stats.activeAdmins },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="text-sm text-gray-500">{s.label}</div>
                <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Trends */}
          {trends && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {([
                { label: t('newUsers'), data: trends.newUsers },
                { label: t('newPosts'), data: trends.newPosts },
                { label: t('newReports'), data: trends.newReports },
                { label: t('newDuels'), data: trends.newDuels },
              ] as const).map((trend, i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <h3 className="font-semibold mb-3 text-sm">{trend.label} ({t('last30days')})</h3>
                  {trend.data.length === 0 ? (
                    <div className="text-gray-400 text-sm text-center py-4">{t('noData')}</div>
                  ) : (
                    <div className="flex items-end gap-0.5 h-24">
                      {trend.data.map((point, j) => {
                        const max = Math.max(...trend.data.map(p => p.count), 1)
                        const height = (point.count / max) * 100
                        return (
                          <div
                            key={j}
                            className="flex-1 bg-blue-400 rounded-t hover:bg-blue-600 transition-colors"
                            style={{ height: `${Math.max(height, 2)}%` }}
                            title={`${point.date}: ${point.count}`}
                          />
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
