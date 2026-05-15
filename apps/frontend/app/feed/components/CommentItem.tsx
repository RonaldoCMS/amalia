'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { CommentItem, ReportTargetType } from '@amalia/shared'
import { RoleBadge } from '../../components/RoleBadge'
import { ReportButton } from '../../components/ReportButton'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

interface Props {
  comment: CommentItem
  currentUserId: string
  isOwner: boolean
  onDelete: () => void
}

export function CommentItemView({ comment, currentUserId, isOwner, onDelete }: Props) {
  const t = useTranslations('Feed')

  const timeAgo = (dateStr: string): string => {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (seconds < 60) return t('timeNow')
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}${t('timeMinutes')}`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}${t('timeHours')}`
    const days = Math.floor(hours / 24)
    return `${days}${t('timeDays')}`
  }

  return (
    <div className="flex gap-2.5 px-4 py-2.5 hover:bg-zinc-900/50">
      <Link href={`/user/${comment.authorId}`} className="shrink-0">
        {comment.authorProfilePhotoUrl ? (
          <img
            src={`${comment.authorProfilePhotoUrl}`}
            alt={comment.authorUsername}
            className="w-7 h-7 rounded-full object-cover border border-zinc-700"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500 font-mono text-xs font-bold">
            {comment.authorUsername[0]?.toUpperCase()}
          </div>
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link href={`/user/${comment.authorId}`} className="font-semibold text-zinc-300 hover:text-cyan-400 transition text-sm">
            {comment.authorUsername}
          </Link>
          <RoleBadge role={comment.authorRole} size="sm" />
          <span className="text-zinc-600 text-xs">{timeAgo(comment.createdAt)}</span>
          {isOwner && (
            <button onClick={onDelete} className="text-zinc-700 hover:text-red-400 transition text-xs ml-auto">
              {t('deleteComment')}
            </button>
          )}
          {!isOwner && comment.authorId !== currentUserId && (
            <span className="ml-auto">
              <ReportButton targetType={ReportTargetType.Comment} targetId={comment.id} reportedUserId={comment.authorId} />
            </span>
          )}
        </div>
        <p className="text-zinc-400 text-sm mt-0.5 break-words">{comment.content}</p>
      </div>
    </div>
  )
}
