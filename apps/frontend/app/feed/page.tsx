'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuthContext } from '../context/AuthContext'
import { useProfile } from '../../hooks/useProfile'
import { useFeed } from '../../hooks/useFeed'
import { PostComposer } from './components/PostComposer'
import { PostCard } from './components/PostCard'
import { Footer } from '../components/Footer'

export default function FeedPage() {
  const router = useRouter()
  const { token, isAuthenticated } = useAuthContext()
  const { profile, isLoading: profileLoading } = useProfile()
  const { posts, isLoading, hasMore, loadFeed, createPost, toggleLike, deletePost } = useFeed()
  const sentinelRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('Feed')

  useEffect(() => {
    if (!token && !profileLoading) router.replace('/login')
  }, [token, profileLoading, router])

  // initial load
  useEffect(() => {
    if (isAuthenticated) loadFeed(true)
  }, [isAuthenticated]) // eslint-disable-line react-hooks/exhaustive-deps

  // infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadFeed(false)
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, isLoading, loadFeed])

  const handleCreate = async (content: string, image?: File) => {
    await createPost(content, image)
  }

  const handleDelete = async (postId: string) => {
    if (!confirm(t('deleteConfirm'))) return
    await deletePost(postId)
  }

  const handleCommentCountChange = useCallback((_postId: string, _delta: number) => {
    // PostCard handles the visual update through its own CommentSection;
    // no global state update needed since commentsCount is optimistic in the section.
  }, [])

  if (!isAuthenticated || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-200 flex flex-col pb-16 sm:pb-0">
      {/* Background grid */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h40v40H0z\' fill=\'none\' stroke=\'%23fff\' stroke-width=\'.5\'/%3E%3C/svg%3E")' }} />

      {/* Feed content */}
      <main className="relative z-10 flex-1 w-full max-w-xl mx-auto px-4 py-6 space-y-4">
        {/* Composer */}
        <PostComposer
          profilePhotoUrl={profile?.profilePhotoUrl ?? null}
          username={profile?.username ?? '?'}
          onSubmit={handleCreate}
        />

        {/* Posts */}
        {posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={profile?.id ?? ''}
            onLike={toggleLike}
            onDelete={handleDelete}
            onCommentCountChange={handleCommentCountChange}
          />
        ))}

        {/* Loading / end */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!isLoading && !hasMore && posts.length > 0 && (
          <p className="text-center text-zinc-700 text-xs font-mono py-6">{t('endOfFeed')}</p>
        )}
        {!isLoading && posts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-zinc-600 text-sm">{t('empty')}</p>
            <p className="text-zinc-700 text-xs mt-1">{t('emptyAction')}</p>
          </div>
        )}

        {/* Sentinel for infinite scroll */}
        <div ref={sentinelRef} className="h-1" />
      </main>

      <Footer />
    </div>
  )
}
