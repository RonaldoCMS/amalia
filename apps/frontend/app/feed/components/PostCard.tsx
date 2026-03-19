'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PostItem } from '@amalia/shared'
import { CommentSection } from './CommentSection'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'ora'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}g`
  const weeks = Math.floor(days / 7)
  return `${weeks}sett`
}

interface Props {
  post: PostItem
  currentUserId: string
  onLike: (postId: string) => void
  onDelete: (postId: string) => void
  onCommentCountChange?: (postId: string, delta: number) => void
}

export function PostCard({ post, currentUserId, onLike, onDelete, onCommentCountChange }: Props) {
  const [showComments, setShowComments] = useState(false)
  const [fullImage, setFullImage] = useState(false)
  const isOwner = post.authorId === currentUserId

  return (
    <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-0">
        <Link href={`/user/${post.authorId}`} className="shrink-0">
          {post.authorProfilePhotoUrl ? (
            <img
              src={`${post.authorProfilePhotoUrl}`}
              alt={post.authorUsername}
              className="w-10 h-10 rounded-full object-cover border border-zinc-700"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-mono font-bold">
              {post.authorUsername[0]?.toUpperCase()}
            </div>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/user/${post.authorId}`} className="font-semibold text-zinc-200 hover:text-cyan-400 transition text-[15px]">
            {post.authorUsername}
          </Link>
          <span className="text-zinc-600 text-xs ml-2">{timeAgo(post.createdAt)}</span>
        </div>
        {isOwner && (
          <button
            onClick={() => onDelete(post.id)}
            className="text-zinc-600 hover:text-red-400 transition text-sm p-1"
            title="Elimina post"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <p className="text-zinc-300 text-[15px] whitespace-pre-wrap break-words">{post.content}</p>
      </div>

      {/* Image */}
      {post.imageUrl && (
        <>
          <button onClick={() => setFullImage(true)} className="w-full">
            <img
              src={`${post.imageUrl}`}
              alt="Post image"
              className="w-full max-h-[500px] object-cover border-t border-b border-zinc-800"
            />
          </button>
          {fullImage && (
            <div
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
              onClick={() => setFullImage(false)}
            >
              <img
                src={`${post.imageUrl}`}
                alt="Post image fullscreen"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          )}
        </>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6 px-4 py-3 border-t border-zinc-800">
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-1.5 text-sm transition ${
            post.likedByMe ? 'text-red-400' : 'text-zinc-500 hover:text-red-400'
          }`}
        >
          <svg className="w-5 h-5" fill={post.likedByMe ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          {post.likesCount > 0 && <span>{post.likesCount}</span>}
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-cyan-400 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
          </svg>
          {post.commentsCount > 0 && <span>{post.commentsCount}</span>}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <CommentSection
          postId={post.id}
          currentUserId={currentUserId}
          onCommentCountChange={(delta) => onCommentCountChange?.(post.id, delta)}
        />
      )}
    </div>
  )
}
