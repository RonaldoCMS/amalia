'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useModeration } from '../../../hooks/useModeration'
import { ReportStatus } from '@amalia/shared'

export default function ReportsPage() {
  const t = useTranslations('Admin')
  const { reports, totalReports, isLoading, loadReports, resolveReport, dismissReport } = useModeration()
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [page, setPage] = useState(1)
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [resolution, setResolution] = useState('')

  useEffect(() => {
    loadReports({ status: statusFilter || undefined, page, limit: 20 })
  }, [statusFilter, page]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleResolve = async (id: string) => {
    if (!resolution.trim()) return
    await resolveReport(id, resolution)
    setResolvingId(null)
    setResolution('')
  }

  const handleDismiss = async (id: string) => {
    await dismissReport(id, 'Dismissed')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('reports')}</h1>

      <div className="flex gap-2 mb-4">
        {Object.values(ReportStatus).map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t(`reportStatus.${s}`)}
          </button>
        ))}
        <button
          onClick={() => { setStatusFilter(''); setPage(1) }}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            !statusFilter ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'
          }`}
        >
          {t('all')}
        </button>
      </div>

      {isLoading ? (
        <div className="text-gray-500">{t('loading')}</div>
      ) : reports.length === 0 ? (
        <div className="text-gray-400 text-center py-12">{t('noReports')}</div>
      ) : (
        <div className="space-y-4">
          {reports.map(r => (
            <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{r.reporter.username}</span>
                    <span className="text-gray-400">&rarr;</span>
                    <span className="text-sm text-gray-600">{r.reportedUser?.username ?? t('unknown')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="bg-gray-100 rounded px-1.5 py-0.5">{r.targetType}</span>
                    <span className="bg-yellow-100 text-yellow-800 rounded px-1.5 py-0.5">{r.reason}</span>
                  </div>
                  {r.description && (
                    <p className="text-sm text-gray-600 mt-2">{r.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    r.status === 'pending' ? 'bg-orange-100 text-orange-700'
                    : r.status === 'resolved' ? 'bg-green-100 text-green-700'
                    : r.status === 'dismissed' ? 'bg-gray-100 text-gray-600'
                    : 'bg-blue-100 text-blue-700'
                  }`}>
                    {t(`reportStatus.${r.status}`)}
                  </span>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {r.status === 'pending' && (
                <div className="mt-3 flex gap-2 border-t pt-3">
                  {resolvingId === r.id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        value={resolution}
                        onChange={e => setResolution(e.target.value)}
                        placeholder={t('resolutionPlaceholder')}
                        className="flex-1 border rounded-lg px-3 py-1.5 text-sm"
                      />
                      <button
                        onClick={() => handleResolve(r.id)}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                      >
                        {t('confirm')}
                      </button>
                      <button
                        onClick={() => setResolvingId(null)}
                        className="px-3 py-1.5 text-gray-500 text-sm"
                      >
                        {t('cancel')}
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setResolvingId(r.id)}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                      >
                        {t('resolve')}
                      </button>
                      <button
                        onClick={() => handleDismiss(r.id)}
                        className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                      >
                        {t('dismiss')}
                      </button>
                    </>
                  )}
                </div>
              )}

              {r.resolution && (
                <div className="mt-2 text-sm text-gray-500">
                  <span className="font-medium">{t('resolution')}:</span> {r.resolution}
                  {r.resolvedBy && <span className="ml-2 text-xs">({r.resolvedBy.username})</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalReports > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50"
          >
            {t('prev')}
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-600">
            {page} / {Math.ceil(totalReports / 20)}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(totalReports / 20)}
            className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50"
          >
            {t('next')}
          </button>
        </div>
      )}
    </div>
  )
}
