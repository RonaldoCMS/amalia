'use client'

import { useEffect, useState } from 'react'
import { useComments } from '../../../hooks/useComments'
import { CommentItemView } from './CommentItem'

interface Props {
  postId: string
  currentUserId: string
  onCommentCountChange?: (delta: number) => void
}

export function CommentSection({ postId, currentUserId, onCommentCountChange }: Props) {
  const { comments, isLoading, load, addComment, deleteComment } = useComments(postId)
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => { load() }, [load])

  const handleSubmit = async () => {
    if (!text.trim()) return
    setIsSubmitting(true)
    try {
      await addComment(text.trim())
      setText('')
      onCommentCountChange?.(1)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    await deleteComment(commentId)
    onCommentCountChange?.(-1)
  }

  return (
    <div className="border-t border-zinc-800 bg-zinc-950/50">
      {/* Comments list */}
      <div className="max-h-80 overflow-y-auto">
        {isLoading && comments.length === 0 && (
          <p className="text-zinc-600 text-sm p-4">Caricamento...</p>
        )}
        {!isLoading && comments.length === 0 && (
          <p className="text-zinc-600 text-sm p-4">Nessun commento ancora</p>
        )}
        {comments.map(c => (
          <CommentItemView
            key={c.id}
            comment={c}
            isOwner={c.authorId === currentUserId}
            onDelete={() => handleDelete(c.id)}
          />
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 p-3 border-t border-zinc-800">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
          placeholder="Scrivi un commento..."
          className="flex-1 bg-transparent text-zinc-300 placeholder-zinc-600 outline-none text-sm"
        />
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !text.trim()}
          className="text-cyan-400 hover:text-cyan-300 disabled:opacity-40 text-sm font-semibold transition"
        >
          Invia
        </button>
      </div>
    </div>
  )
}
