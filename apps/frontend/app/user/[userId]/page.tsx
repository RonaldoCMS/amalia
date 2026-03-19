'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthContext } from '../../context/AuthContext'
import { usePublicProfile } from '../../../hooks/usePublicProfile'
import { useFriendship } from '../../../hooks/useFriendship'
import { useProfile } from '../../../hooks/useProfile'
import { FeedService } from '../../../services/feed.service'
import { FriendshipStatus, FriendshipStatusResponse, PostItem } from '@amalia/shared'
import { PostCard } from '../../feed/components/PostCard'
import { Footer } from '../../components/Footer'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const router = useRouter()
  const { isAuthenticated } = useAuthContext()
  const { profile: myProfile } = useProfile()
  const { profile, isLoading, load } = usePublicProfile()
  const { sendRequest, acceptRequest, rejectRequest, removeFriend, getStatus } = useFriendship()
  const [friendStatus, setFriendStatus] = useState<FriendshipStatusResponse | null>(null)
  const [friendLoading, setFriendLoading] = useState(false)
  const [posts, setPosts] = useState<PostItem[]>([])
  const [postsLoading, setPostsLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) { router.replace('/login'); return }
    if (!userId) return
    load(userId)
    loadFriendStatus()
    loadUserPosts()
  }, [userId, isAuthenticated]) // eslint-disable-line react-hooks/exhaustive-deps

  const isMe = myProfile?.id === userId

  const loadFriendStatus = useCallback(async () => {
    if (!userId || isMe) return
    const s = await getStatus(userId)
    setFriendStatus(s)
  }, [userId, isMe, getStatus])

  const loadUserPosts = useCallback(async () => {
    if (!userId) return
    setPostsLoading(true)
    try {
      const feedService = new FeedService()
      const res = await feedService.getUserPosts(userId, 1, 20)
      setPosts(res.posts)
    } finally {
      setPostsLoading(false)
    }
  }, [userId])

  const handleSendRequest = async () => {
    setFriendLoading(true)
    try {
      await sendRequest(userId)
      setFriendStatus({ status: FriendshipStatus.Pending, friendshipId: null, direction: 'sent' })
    } finally {
      setFriendLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!friendStatus?.friendshipId) return
    setFriendLoading(true)
    try {
      await acceptRequest(friendStatus.friendshipId)
      setFriendStatus({ ...friendStatus, status: FriendshipStatus.Accepted })
    } finally {
      setFriendLoading(false)
    }
  }

  const handleReject = async () => {
    if (!friendStatus?.friendshipId) return
    setFriendLoading(true)
    try {
      await rejectRequest(friendStatus.friendshipId)
      setFriendStatus({ status: null, friendshipId: null, direction: null })
    } finally {
      setFriendLoading(false)
    }
  }

  const handleRemove = async () => {
    if (!friendStatus?.friendshipId || !confirm('Rimuovere questa amicizia?')) return
    setFriendLoading(true)
    try {
      await removeFriend(friendStatus.friendshipId)
      setFriendStatus({ status: null, friendshipId: null, direction: null })
    } finally {
      setFriendLoading(false)
    }
  }

  const handleToggleLike = async (postId: string) => {
    const feedService = new FeedService()
    const { liked } = await feedService.toggleLike(postId)
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, likedByMe: liked, likesCount: p.likesCount + (liked ? 1 : -1) } : p,
    ))
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Eliminare questo post?')) return
    const feedService = new FeedService()
    await feedService.deletePost(postId)
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const renderFriendButton = () => {
    if (isMe || !friendStatus) return null

    if (friendStatus.status === FriendshipStatus.Accepted) {
      return (
        <div className="flex gap-2">
          <Link
            href={`/match`}
            className="px-4 py-2 text-xs font-mono rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20 transition"
          >
            💬 Chat
          </Link>
          <button
            onClick={handleRemove}
            disabled={friendLoading}
            className="px-4 py-2 text-xs font-mono rounded-lg border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-400/30 transition disabled:opacity-40"
          >
            Rimuovi amicizia
          </button>
        </div>
      )
    }

    if (friendStatus.status === FriendshipStatus.Pending && friendStatus.direction === 'sent') {
      return (
        <button disabled className="px-4 py-2 text-xs font-mono rounded-lg border border-amber-400/30 bg-amber-400/10 text-amber-400">
          Richiesta inviata
        </button>
      )
    }

    if (friendStatus.status === FriendshipStatus.Pending && friendStatus.direction === 'received') {
      return (
        <div className="flex gap-2">
          <button
            onClick={handleAccept}
            disabled={friendLoading}
            className="px-4 py-2 text-xs font-mono rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 transition disabled:opacity-40"
          >
            ✓ Accetta
          </button>
          <button
            onClick={handleReject}
            disabled={friendLoading}
            className="px-4 py-2 text-xs font-mono rounded-lg border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-400/30 transition disabled:opacity-40"
          >
            ✗ Rifiuta
          </button>
        </div>
      )
    }

    return (
      <button
        onClick={handleSendRequest}
        disabled={friendLoading}
        className="px-4 py-2 text-xs font-mono rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20 transition disabled:opacity-40"
      >
        + Aggiungi amico
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-grid relative flex flex-col pb-16 sm:pb-0">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-cyan-500/3 to-transparent pointer-events-none" />

      <main className="relative z-10 max-w-xl mx-auto w-full px-4 py-6 flex-1 space-y-6">
        {/* Profile header */}
        <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            {profile.profilePhotoUrl ? (
              <img
                src={`${profile.profilePhotoUrl}`}
                alt={profile.username}
                className="w-20 h-20 rounded-full object-cover border-2 border-zinc-700 shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-zinc-400 font-mono text-2xl font-bold shrink-0">
                {profile.username[0]?.toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-zinc-100 font-mono">{profile.username}</h1>
              {profile.jobType && (
                <p className="text-xs text-zinc-500 mt-0.5">
                  {profile.jobType}{profile.yearsOfExperience ? ` · ${profile.yearsOfExperience} exp` : ''}
                </p>
              )}
              {profile.bio && (
                <p className="text-sm text-zinc-400 mt-2">{profile.bio}</p>
              )}
            </div>
          </div>

          {/* Friend action */}
          <div className="mt-4">{renderFriendButton()}</div>

          {/* Languages & Goals */}
          {profile.languages.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {profile.languages.map(l => (
                <span key={l} className="text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-400/20 bg-cyan-400/10 text-cyan-400">
                  {l}
                </span>
              ))}
            </div>
          )}
          {profile.goals.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {profile.goals.map(g => (
                <span key={g} className="text-[10px] font-mono px-2 py-0.5 rounded border border-violet-400/20 bg-violet-400/10 text-violet-400">
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* GitHub */}
          {profile.githubUrl && (
            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-3 text-xs font-mono text-zinc-500 hover:text-cyan-400 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </a>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-4">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-2">Challenge</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-cyan-400 font-mono">{profile.challengeStats.totalScore}</span>
              <span className="text-xs text-zinc-500 font-mono">pts</span>
            </div>
            <div className="flex gap-3 mt-1 text-xs font-mono">
              <span className="text-emerald-400">✓ {profile.challengeStats.correctCount}</span>
              <span className="text-red-400">✗ {profile.challengeStats.wrongCount}</span>
            </div>
          </div>

          <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-4">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-2">Duelli</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-amber-400 font-mono">{profile.duelStats.wins}</span>
              <span className="text-xs text-zinc-500 font-mono">vittorie</span>
            </div>
            <div className="flex gap-3 mt-1 text-xs font-mono">
              <span className="text-zinc-400">{profile.duelStats.totalDuels} totali</span>
              <span className="text-zinc-500">{profile.duelStats.winRate}% win</span>
            </div>
          </div>
        </div>

        {/* User's posts */}
        <div>
          <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-600 mb-3">Post</h2>
          {postsLoading && (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!postsLoading && posts.length === 0 && (
            <p className="text-zinc-600 text-sm text-center py-8">Nessun post</p>
          )}
          <div className="space-y-4">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={myProfile?.id ?? ''}
                onLike={handleToggleLike}
                onDelete={handleDeletePost}
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
