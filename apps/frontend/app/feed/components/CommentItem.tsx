'use client'

import Link from 'next/link'
import { CommentItem } from '@amalia/shared'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'ora'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}g`
}

interface Props {
  comment: CommentItem
  isOwner: boolean
  onDelete: () => void
}

export function CommentItemView({ comment, isOwner, onDelete }: Props) {
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
          <span className="text-zinc-600 text-xs">{timeAgo(comment.createdAt)}</span>
          {isOwner && (
            <button onClick={onDelete} className="text-zinc-700 hover:text-red-400 transition text-xs ml-auto">
              Elimina
            </button>
          )}
        </div>
        <p className="text-zinc-400 text-sm mt-0.5 break-words">{comment.content}</p>
      </div>
    </div>
  )
}
