'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useModeration } from '../../hooks/useModeration'
import { ReportTargetType, ReportReason, CreateReportRequest } from '@amalia/shared'

interface ReportButtonProps {
  targetType: ReportTargetType
  targetId: string
  reportedUserId?: string
}

export function ReportButton({ targetType, targetId, reportedUserId }: ReportButtonProps) {
  const t = useTranslations('Moderation')
  const { createReport } = useModeration()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<ReportReason>(ReportReason.Spam)
  const [description, setDescription] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    setSending(true)
    try {
      const data: CreateReportRequest = {
        targetType,
        targetId,
        reportedUserId,
        reason,
        description: description || undefined,
      }
      await createReport(data)
      setSent(true)
      setTimeout(() => { setOpen(false); setSent(false) }, 2000)
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <span className="text-green-600 text-sm">
        {t('reportSent')}
      </span>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-gray-400 hover:text-red-500 transition-colors text-sm"
        title={t('report')}
      >
        🚩
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">{t('reportTitle')}</h3>

            <label className="block text-sm font-medium text-gray-700 mb-1">{t('reportReason')}</label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value as ReportReason)}
              className="w-full border rounded-lg p-2 mb-3"
            >
              {Object.values(ReportReason).map(r => (
                <option key={r} value={r}>{t(`reasons.${r}`)}</option>
              ))}
            </select>

            <label className="block text-sm font-medium text-gray-700 mb-1">{t('reportDescription')}</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border rounded-lg p-2 mb-4 h-24 resize-none"
              placeholder={t('reportDescriptionPlaceholder')}
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={sending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {sending ? '...' : t('sendReport')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
