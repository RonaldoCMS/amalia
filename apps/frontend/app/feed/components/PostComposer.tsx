'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { PostItem } from '@amalia/shared'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

interface Props {
  profilePhotoUrl: string | null
  username: string
  onSubmit: (content: string, image?: File) => Promise<void>
}

export function PostComposer({ profilePhotoUrl, username, onSubmit }: Props) {
  const t = useTranslations('Feed')
  const [content, setContent] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    setImage(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = async () => {
    if (!content.trim() && !image) return
    setIsSubmitting(true)
    try {
      await onSubmit(content.trim(), image ?? undefined)
      setContent('')
      removeImage()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-900/50">
      <div className="flex gap-3">
        {/* Avatar */}
        {profilePhotoUrl ? (
          <img
            src={`${profilePhotoUrl}`}
            alt={username}
            className="w-10 h-10 rounded-full object-cover border border-zinc-700 shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-mono font-bold shrink-0">
            {username[0]?.toUpperCase()}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={t('composerPlaceholder')}
            className="w-full bg-transparent text-zinc-200 placeholder-zinc-600 resize-none outline-none text-[15px] min-h-[60px]"
            rows={3}
          />

          {/* Image preview */}
          {preview && (
            <div className="relative mt-2 inline-block">
              <img
                src={preview}
                alt="Preview"
                className="max-h-60 rounded-lg border border-zinc-700"
              />
              <button
                onClick={removeImage}
                className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-black"
              >
                ×
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
            <button
              onClick={() => fileRef.current?.click()}
              className="text-zinc-500 hover:text-cyan-400 transition text-sm flex items-center gap-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
              {t('photo')}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (!content.trim() && !image)}
              className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold text-sm rounded-full transition"
            >
              {isSubmitting ? t('publishing') : t('publish')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
