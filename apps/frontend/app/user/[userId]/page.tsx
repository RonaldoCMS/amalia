'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthContext } from '../../context/AuthContext'
import { usePublicProfile } from '../../../hooks/usePublicProfile'
import { useFriendship } from '../../../hooks/useFriendship'
import { useProfile } from '../../../hooks/useProfile'
import { FeedService } from '../../../services/feed.service'
import { UserService } from '../../../services/user.service'
import {
  ChallengeHistoryItem,
  ChallengeType,
  ChallengeLevel,
  FriendshipStatus,
  FriendshipStatusResponse,
  PostItem,
} from '@amalia/shared'
import { PostCard } from '../../feed/components/PostCard'
import { Footer } from '../../components/Footer'

type Tab = 'overview' | 'challenge' | 'duelli' | 'post'

const LEVEL_COLOR: Record<string, string> = {
  beginner: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10',
  intermediate: 'text-amber-400 border-amber-400/20 bg-amber-400/10',
  hard: 'text-red-400 border-red-400/20 bg-red-400/10',
}

const TYPE_ICON: Record<string, string> = {
  quiz: '🧠',
  fill: '✏️',
  bug: '🐛',
  write: '⌨️',
}

function ProgressBar({ value, max, color = 'bg-cyan-400' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-mono text-zinc-500 w-8 text-right">{pct}%</span>
    </div>
  )
}

function StatBlock({ label, value, sub, color = 'text-cyan-400' }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-4 flex flex-col gap-1">
      <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">{label}</span>
      <span className={`text-2xl font-bold font-mono ${color}`}>{value}</span>
      {sub && <span className="text-xs text-zinc-500 font-mono">{sub}</span>}
    </div>
  )
}

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
  const [history, setHistory] = useState<ChallengeHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const isMe = myProfile?.id === userId

  useEffect(() => {
    if (!isAuthenticated) { router.replace('/login'); return }
    if (!userId) return
    load(userId)
    loadFriendStatus()
    loadUserPosts()
    loadUserHistory()
  }, [userId, isAuthenticated]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadFriendStatus = useCallback(async () => {
    if (!userId || isMe) return
    const s = await getStatus(userId)
    setFriendStatus(s)
  }, [userId, isMe, getStatus])

  const loadUserPosts = useCallback(async () => {
    if (!userId) return
    setPostsLoading(true)
    try {
      const res = await new FeedService().getUserPosts(userId, 1, 20)
      setPosts(res.posts)
    } finally {
      setPostsLoading(false)
    }
  }, [userId])

  const loadUserHistory = useCallback(async () => {
    if (!userId) return
    setHistoryLoading(true)
    try {
      const data = await new UserService().getPublicHistory(userId)
      setHistory(data)
    } finally {
      setHistoryLoading(false)
    }
  }, [userId])

  // ── Achievements ─────────────────────────────────────────────────────────
  const achievements = useMemo(() => {
    if (!profile) return []
    const { correctCount, wrongCount, totalScore } = profile.challengeStats
    const { wins, totalDuels, winRate } = profile.duelStats
    const total = correctCount + wrongCount
    const accuracy = total > 0 ? correctCount / total : 0
    const list: { icon: string; label: string; desc: string }[] = []
    if (correctCount >= 1)  list.push({ icon: '🚀', label: 'Primo Passo',    desc: 'Prima challenge completata' })
    if (correctCount >= 10) list.push({ icon: '⚔️', label: 'Code Warrior',   desc: '10 challenge corrette' })
    if (correctCount >= 50) list.push({ icon: '🧠', label: 'Maestro',         desc: '50 challenge corrette' })
    if (correctCount >= 100) list.push({ icon: '🌟', label: 'Leggenda',       desc: '100 challenge corrette' })
    if (totalScore >= 500)  list.push({ icon: '💎', label: 'Diamond',         desc: '500 punti accumulati' })
    if (totalScore >= 2000) list.push({ icon: '👑', label: 'Grandmaster',     desc: '2000 punti accumulati' })
    if (total >= 5 && accuracy >= 0.8) list.push({ icon: '🎯', label: 'Cecchino', desc: '80%+ accuratezza' })
    if (total >= 20 && accuracy >= 0.9) list.push({ icon: '⚡', label: 'Fulmine', desc: '90%+ su 20+ challenge' })
    if (totalDuels >= 1)    list.push({ icon: '🥊', label: 'Duelista',        desc: 'Primo duello' })
    if (wins >= 5)          list.push({ icon: '🏅', label: 'Guerriero',       desc: '5 vittorie nei duelli' })
    if (wins >= 20)         list.push({ icon: '🏆', label: 'Campione',        desc: '20 vittorie nei duelli' })
    if (totalDuels >= 10 && winRate >= 60) list.push({ icon: '🔥', label: 'Invincibile', desc: '60%+ win rate' })
    if (posts.length >= 1)  list.push({ icon: '✍️', label: 'Writer',          desc: 'Primo post pubblicato' })
    if (posts.length >= 10) list.push({ icon: '📢', label: 'Influencer',      desc: '10 post pubblicati' })
    return list
  }, [profile, posts])

  // ── Challenge breakdowns ──────────────────────────────────────────────────
  const byLanguage = useMemo(() => {
    const map: Record<string, { correct: number; wrong: number }> = {}
    for (const item of history) {
      const lang = item.challenge.language
      if (!map[lang]) map[lang] = { correct: 0, wrong: 0 }
      if (item.correct) { map[lang].correct++ } else { map[lang].wrong++ }
    }
    return Object.entries(map).sort((a, b) => (b[1].correct + b[1].wrong) - (a[1].correct + a[1].wrong))
  }, [history])

  const byType = useMemo(() => {
    const map: Record<string, { correct: number; wrong: number }> = {}
    for (const item of history) {
      const t = item.challenge.type
      if (!map[t]) map[t] = { correct: 0, wrong: 0 }
      if (item.correct) { map[t].correct++ } else { map[t].wrong++ }
    }
    return Object.entries(map)
  }, [history])

  const byLevel = useMemo(() => {
    const map: Record<string, { correct: number; wrong: number }> = {}
    for (const item of history) {
      const l = item.challenge.level
      if (!map[l]) map[l] = { correct: 0, wrong: 0 }
      if (item.correct) { map[l].correct++ } else { map[l].wrong++ }
    }
    return Object.entries(map)
  }, [history])

  // ── Friendship actions ────────────────────────────────────────────────────
  const handleSendRequest = async () => {
    setFriendLoading(true)
    try {
      await sendRequest(userId)
      setFriendStatus({ status: FriendshipStatus.Pending, friendshipId: null, direction: 'sent' })
    } finally { setFriendLoading(false) }
  }

  const handleAccept = async () => {
    if (!friendStatus?.friendshipId) return
    setFriendLoading(true)
    try {
      await acceptRequest(friendStatus.friendshipId)
      setFriendStatus({ ...friendStatus, status: FriendshipStatus.Accepted })
    } finally { setFriendLoading(false) }
  }

  const handleReject = async () => {
    if (!friendStatus?.friendshipId) return
    setFriendLoading(true)
    try {
      await rejectRequest(friendStatus.friendshipId)
      setFriendStatus({ status: null, friendshipId: null, direction: null })
    } finally { setFriendLoading(false) }
  }

  const handleRemove = async () => {
    if (!friendStatus?.friendshipId || !confirm('Rimuovere questa amicizia?')) return
    setFriendLoading(true)
    try {
      await removeFriend(friendStatus.friendshipId)
      setFriendStatus({ status: null, friendshipId: null, direction: null })
    } finally { setFriendLoading(false) }
  }

  const handleToggleLike = async (postId: string) => {
    const { liked } = await new FeedService().toggleLike(postId)
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, likedByMe: liked, likesCount: p.likesCount + (liked ? 1 : -1) } : p,
    ))
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Eliminare questo post?')) return
    await new FeedService().deletePost(postId)
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const { challengeStats: cs, duelStats: ds } = profile
  const accuracy = (cs.correctCount + cs.wrongCount) > 0
    ? Math.round((cs.correctCount / (cs.correctCount + cs.wrongCount)) * 100)
    : 0

  // ── Friendship button ─────────────────────────────────────────────────────
  const renderFriendButton = () => {
    if (isMe || !friendStatus) return null
    if (friendStatus.status === FriendshipStatus.Accepted) return (
      <div className="flex gap-2">
        <Link href="/match" className="px-4 py-2 text-xs font-mono rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20 transition">
          💬 Chat
        </Link>
        <button onClick={handleRemove} disabled={friendLoading} className="px-4 py-2 text-xs font-mono rounded-lg border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-400/30 transition disabled:opacity-40">
          Rimuovi amicizia
        </button>
      </div>
    )
    if (friendStatus.status === FriendshipStatus.Pending && friendStatus.direction === 'sent') return (
      <button disabled className="px-4 py-2 text-xs font-mono rounded-lg border border-amber-400/30 bg-amber-400/10 text-amber-400">
        Richiesta inviata
      </button>
    )
    if (friendStatus.status === FriendshipStatus.Pending && friendStatus.direction === 'received') return (
      <div className="flex gap-2">
        <button onClick={handleAccept} disabled={friendLoading} className="px-4 py-2 text-xs font-mono rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 transition disabled:opacity-40">
          ✓ Accetta
        </button>
        <button onClick={handleReject} disabled={friendLoading} className="px-4 py-2 text-xs font-mono rounded-lg border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-400/30 transition disabled:opacity-40">
          ✗ Rifiuta
        </button>
      </div>
    )
    return (
      <button onClick={handleSendRequest} disabled={friendLoading} className="px-4 py-2 text-xs font-mono rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20 transition disabled:opacity-40">
        + Aggiungi amico
      </button>
    )
  }

  // ── Tabs ─────────────────────────────────────────────────────────────────
  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Profilo' },
    { id: 'challenge', label: 'Challenge' },
    { id: 'duelli', label: 'Duelli' },
    { id: 'post', label: `Post${posts.length > 0 ? ` (${posts.length})` : ''}` },
  ]

  const memberSince = new Date(profile.createdAt).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-grid relative flex flex-col pb-16 sm:pb-0">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-cyan-500/3 to-transparent pointer-events-none" />

      <main className="relative z-10 max-w-xl mx-auto w-full px-4 py-6 flex-1 space-y-5">

        {/* ── Profile header ─────────────────────────────────────────── */}
        <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-5">
          <div className="flex items-start gap-4">
            {profile.profilePhotoUrl ? (
              <img src={profile.profilePhotoUrl} alt={profile.username}
                className="w-20 h-20 rounded-full object-cover border-2 border-zinc-700 shrink-0" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-zinc-400 font-mono text-2xl font-bold shrink-0">
                {profile.username[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-zinc-100 font-mono">{profile.username}</h1>
              {profile.jobType && (
                <p className="text-xs text-zinc-500 font-mono mt-0.5">
                  {profile.jobType}{profile.yearsOfExperience ? ` · ${profile.yearsOfExperience} exp` : ''}
                  {profile.workStyle ? ` · ${profile.workStyle}` : ''}
                </p>
              )}
              {profile.bio && <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{profile.bio}</p>}
              <p className="text-[10px] font-mono text-zinc-600 mt-2">Membro da {memberSince}</p>
            </div>
          </div>

          <div className="mt-4">{renderFriendButton()}</div>

          {/* Quick stats row */}
          <div className="flex gap-4 mt-4 pt-4 border-t border-zinc-800/60">
            <div className="text-center">
              <p className="text-base font-bold font-mono text-cyan-400">{cs.totalScore}</p>
              <p className="text-[10px] font-mono text-zinc-600">punti</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold font-mono text-emerald-400">{cs.correctCount}</p>
              <p className="text-[10px] font-mono text-zinc-600">corrette</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold font-mono text-amber-400">{ds.wins}</p>
              <p className="text-[10px] font-mono text-zinc-600">vittorie</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold font-mono text-violet-400">{posts.length}</p>
              <p className="text-[10px] font-mono text-zinc-600">post</p>
            </div>
          </div>
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────── */}
        <div className="flex border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 py-2.5 text-[11px] font-mono font-semibold uppercase tracking-wide transition
                ${activeTab === t.id
                  ? 'bg-cyan-400/10 text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Profilo ─────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Languages */}
            {profile.languages.length > 0 && (
              <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-4">
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-3">Linguaggi</h3>
                <div className="flex flex-wrap gap-1.5">
                  {profile.languages.map(l => (
                    <span key={l} className="text-[11px] font-mono px-2.5 py-1 rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-cyan-400">{l}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Goals */}
            {profile.goals.length > 0 && (
              <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-4">
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-3">Obiettivi</h3>
                <div className="flex flex-wrap gap-1.5">
                  {profile.goals.map(g => (
                    <span key={g} className="text-[11px] font-mono px-2.5 py-1 rounded-lg border border-violet-400/20 bg-violet-400/10 text-violet-400">{g}</span>
                  ))}
                </div>
              </div>
            )}

            {/* GitHub */}
            {profile.githubUrl && (
              <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-4">
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-3">Link</h3>
                <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-mono text-zinc-400 hover:text-cyan-400 transition">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  GitHub
                </a>
              </div>
            )}

            {/* Achievements */}
            {achievements.length > 0 && (
              <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-4">
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-3">Achievement</h3>
                <div className="grid grid-cols-2 gap-2">
                  {achievements.map(a => (
                    <div key={a.label} className="flex items-start gap-2.5 p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/60">
                      <span className="text-lg leading-none">{a.icon}</span>
                      <div>
                        <p className="text-[11px] font-mono font-semibold text-zinc-200">{a.label}</p>
                        <p className="text-[10px] font-mono text-zinc-600 leading-tight">{a.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Challenge ────────────────────────────────────────────── */}
        {activeTab === 'challenge' && (
          <div className="space-y-5">
            {/* Key stats */}
            <div className="grid grid-cols-3 gap-3">
              <StatBlock label="Punti" value={cs.totalScore} color="text-cyan-400" />
              <StatBlock label="Corrette" value={cs.correctCount} color="text-emerald-400" />
              <StatBlock label="Accuracy" value={`${accuracy}%`} color="text-violet-400" />
            </div>

            {/* Accuracy bar */}
            <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-4 space-y-3">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">Accuratezza</h3>
              <div className="flex gap-2 items-center">
                <div className="flex-1 h-3 rounded-full bg-zinc-800 overflow-hidden flex">
                  {(cs.correctCount + cs.wrongCount) > 0 && <>
                    <div className="h-full bg-emerald-500 transition-all" style={{ width: `${accuracy}%` }} />
                    <div className="h-full bg-red-500 transition-all" style={{ width: `${100 - accuracy}%` }} />
                  </>}
                </div>
                <span className="text-xs font-mono text-zinc-400">{cs.correctCount + cs.wrongCount} tot</span>
              </div>
              <div className="flex gap-4 text-xs font-mono">
                <span className="text-emerald-400">✓ {cs.correctCount} corrette</span>
                <span className="text-red-400">✗ {cs.wrongCount} sbagliate</span>
              </div>
            </div>

            {historyLoading && (
              <div className="flex justify-center py-6">
                <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* By language */}
            {byLanguage.length > 0 && (
              <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-4">
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-3">Per linguaggio</h3>
                <div className="space-y-3">
                  {byLanguage.map(([lang, { correct, wrong }]) => (
                    <div key={lang}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-mono text-zinc-300">{lang}</span>
                        <span className="text-[10px] font-mono text-zinc-500">{correct}/{correct + wrong}</span>
                      </div>
                      <ProgressBar value={correct} max={correct + wrong} color="bg-cyan-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* By type */}
            {byType.length > 0 && (
              <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-4">
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-3">Per tipo</h3>
                <div className="grid grid-cols-2 gap-2">
                  {byType.map(([type, { correct, wrong }]) => (
                    <div key={type} className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/60">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span>{TYPE_ICON[type] ?? '📝'}</span>
                        <span className="text-[11px] font-mono text-zinc-300 capitalize">{type}</span>
                      </div>
                      <p className="text-sm font-bold font-mono text-zinc-100">{correct + wrong}</p>
                      <p className="text-[10px] font-mono text-emerald-400">{correct} ✓</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* By level */}
            {byLevel.length > 0 && (
              <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-4">
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-3">Per difficoltà</h3>
                <div className="space-y-2">
                  {byLevel.map(([level, { correct, wrong }]) => (
                    <div key={level} className="flex items-center gap-3">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border capitalize ${LEVEL_COLOR[level] ?? 'text-zinc-400 border-zinc-700'}`}>
                        {level}
                      </span>
                      <div className="flex-1">
                        <ProgressBar value={correct} max={correct + wrong} color="bg-violet-400" />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 w-12 text-right">{correct}/{correct + wrong}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent history */}
            {history.length > 0 && (
              <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-4">
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-3">Ultime challenge</h3>
                <div className="space-y-2">
                  {history.slice(0, 15).map(item => (
                    <div key={item.id} className="flex items-center gap-3 py-2 border-b border-zinc-800/60 last:border-0">
                      <span className={`text-sm ${item.correct ? 'text-emerald-400' : 'text-red-400'}`}>
                        {item.correct ? '✓' : '✗'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-mono text-zinc-300 truncate">{item.challenge.title}</p>
                        <p className="text-[10px] font-mono text-zinc-600">{item.challenge.language} · {item.challenge.type}</p>
                      </div>
                      {item.score !== null && (
                        <span className="text-[11px] font-mono text-cyan-400 shrink-0">+{item.score}pt</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!historyLoading && history.length === 0 && (
              <p className="text-zinc-600 text-sm text-center py-8">Nessuna challenge completata</p>
            )}
          </div>
        )}

        {/* ── Tab: Duelli ───────────────────────────────────────────────── */}
        {activeTab === 'duelli' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <StatBlock label="Totale" value={ds.totalDuels} color="text-zinc-300" />
              <StatBlock label="Vittorie" value={ds.wins} color="text-amber-400" />
              <StatBlock label="Sconfitte" value={ds.losses} color="text-red-400" />
              <StatBlock label="Win Rate" value={`${ds.winRate}%`} color="text-cyan-400" />
            </div>

            {/* W/L/D visual bar */}
            {ds.totalDuels > 0 && (
              <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-4">
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-3">Distribuzione risultati</h3>
                <div className="h-4 rounded-full overflow-hidden flex gap-px">
                  {ds.wins > 0 && (
                    <div className="bg-amber-400 h-full transition-all" style={{ width: `${(ds.wins / ds.totalDuels) * 100}%` }} />
                  )}
                  {(ds.totalDuels - ds.wins - ds.losses) > 0 && (
                    <div className="bg-zinc-500 h-full transition-all"
                      style={{ width: `${((ds.totalDuels - ds.wins - ds.losses) / ds.totalDuels) * 100}%` }} />
                  )}
                  {ds.losses > 0 && (
                    <div className="bg-red-500 h-full transition-all" style={{ width: `${(ds.losses / ds.totalDuels) * 100}%` }} />
                  )}
                </div>
                <div className="flex gap-4 mt-3 text-xs font-mono">
                  <span className="text-amber-400">🏆 {ds.wins} vinte</span>
                  {(ds.totalDuels - ds.wins - ds.losses) > 0 && (
                    <span className="text-zinc-400">⚖️ {ds.totalDuels - ds.wins - ds.losses} pari</span>
                  )}
                  <span className="text-red-400">💀 {ds.losses} perse</span>
                </div>
              </div>
            )}

            {/* Win rate ring (CSS) */}
            {ds.totalDuels > 0 && (
              <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-4 flex items-center gap-6">
                <div className="relative w-20 h-20 shrink-0">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#27272a" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f59e0b" strokeWidth="3"
                      strokeDasharray={`${ds.winRate} ${100 - ds.winRate}`}
                      strokeDashoffset="0" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold font-mono text-amber-400">{ds.winRate}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-mono text-zinc-400">Win Rate globale</p>
                  <p className="text-lg font-bold font-mono text-zinc-100 mt-1">{ds.wins}<span className="text-zinc-500 text-sm"> / {ds.totalDuels}</span></p>
                  <Link href="/duel/leaderboard" className="text-[10px] font-mono text-cyan-400 hover:underline mt-1 block">
                    Vedi classifica →
                  </Link>
                </div>
              </div>
            )}

            {ds.totalDuels === 0 && (
              <p className="text-zinc-600 text-sm text-center py-8">Nessun duello giocato</p>
            )}
          </div>
        )}

        {/* ── Tab: Post ─────────────────────────────────────────────────── */}
        {activeTab === 'post' && (
          <div>
            {postsLoading && (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {!postsLoading && posts.length === 0 && (
              <p className="text-zinc-600 text-sm text-center py-8">Nessun post pubblicato</p>
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
        )}
      </main>

      <Footer />
    </div>
  )
}
