'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import { useTranslations } from 'next-intl'
import CvDocument from './CvDocument'
import { CvData, CvAmaliaStats } from '@amalia/shared'

interface Props {
  username: string
  cvData: CvData
  amaliaStats: CvAmaliaStats
}

export default function PdfDownloadButton({ username, cvData, amaliaStats }: Props) {
  const t = useTranslations('CV')
  return (
    <PDFDownloadLink
      document={<CvDocument username={username} cvData={cvData} amaliaStats={amaliaStats} />}
      fileName={`cv-${username}-amalia.pdf`}
    >
      {({ loading }) => (
        <button
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-violet-400/30 bg-violet-400/10 text-violet-400 text-xs font-mono font-semibold hover:bg-violet-400/20 transition disabled:opacity-40"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2v-5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {loading ? t('preparingPDF') : t('downloadPDF')}
        </button>
      )}
    </PDFDownloadLink>
  )
}
