'use client'

import { useEffect, useRef, useState, FormEvent, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthContext } from '../../context/AuthContext'
import { useChat } from '../../../hooks/useChat'
import { useProfile } from '../../../hooks/useProfile'
import { DuelService } from '../../../services/duel.service'
import { MatchRepository } from '../../../repositories/match.repository'
import { ChallengeLanguage, ChatMessageItem, DuelInviteStatusResponse } from '@amalia/shared'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

const LANGUAGES = Object.values(ChallengeLanguage)

const EMOJIS = [
  '😀','😂','😍','🤔','👍','👎','🔥','💯','🚀','😎',
  '🤝','💻','🐛','✅','❌','🎉','👏','🙏','💡','⚡',
]

function Avatar({ url, name, size = 32 }: { url: string | null; name: string; size?: number }) {
  const px = `${size}px`
  if (url) {
    return <img src={`${url}`} alt={name} style={{ width: px, height: px }} className="rounded-full object-cover border border-zinc-700" />
  }
  return (
    <div style={{ width: px, height: px }} className="rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-mono text-xs font-bold">
      {name[0].toUpperCase()}
    </div>
  )
}

function SystemMessage({ content, duelInviteId, isSender, myId, onAccept }: {
  content: string
  duelInviteId?: string | null
  isSender?: boolean
  myId?: string
  onAccept?: (duelId: string) => void
}) {
  const router = useRouter()
  const [status, setStatus] = useState<DuelInviteStatusResponse | null>(null)
  const [accepting, setAccepting] = useState(false)
  const [acceptErr, setAcceptErr] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now())
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!duelInviteId) return
    const svc = new DuelService()
    let mounted = true
    const poll = async () => {
      try {
        const s = await svc.getInviteStatus(duelInviteId)
        if (mounted) setStatus(s)
      } catch { /* ignore */ }
    }
    poll()
    pollRef.current = setInterval(poll, 4000)
    tickRef.current = setInterval(() => setNow(Date.now()), 1000)
    return () => {
      mounted = false
      if (pollRef.current) clearInterval(pollRef.current)
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [duelInviteId])

  // Stop polling once terminal state
  useEffect(() => {
    if (status && (status.status === 'completed' || status.status === 'cancelled')) {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
      if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null }
    }
  }, [status])

  const handleAccept = async () => {
    if (!duelInviteId || !onAccept) return
    setAccepting(true)
    setAcceptErr(null)
    try {
      await onAccept(duelInviteId)
    } catch (e: any) {
      setAcceptErr(e?.response?.data?.message ?? e?.message ?? 'Errore. Riprova.')
    } finally {
      setAccepting(false)
    }
  }

  const handleGoToDuel = () => {
    if (!duelInviteId) return
    sessionStorage.setItem('pendingDuelId', duelInviteId)
    router.push('/duel')
  }

  // No duelInviteId → plain system message
  if (!duelInviteId) {
    return (
      <div className="flex justify-center my-2">
        <div className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono text-center max-w-sm">
          {content}
        </div>
      </div>
    )
  }

  // Still loading status
  if (!status) {
    return (
      <div className="flex justify-center my-2">
        <div className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono text-center max-w-sm">
          {content}
          <div className="mt-1 text-zinc-500 text-[10px]">Caricamento...</div>
        </div>
      </div>
    )
  }

  const isInvited = myId && status.invitedUserId === myId
  const isChallenger = myId && status.challengerId === myId

  // ── CANCELLED / EXPIRED ──
  if (status.status === 'cancelled') {
    return (
      <div className="flex justify-center my-2">
        <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono text-center max-w-sm">
          ⏰ Invito scaduto — la sfida non è stata accettata in tempo.
        </div>
      </div>
    )
  }

  // ── WAITING ──
  if (status.status === 'waiting') {
    const created = new Date(status.createdAt).getTime()
    const elapsed = Math.floor((now - created) / 1000)
    const remaining = Math.max(0, 600 - elapsed)
    const mins = Math.floor(remaining / 60)
    const secs = remaining % 60

    return (
      <div className="flex justify-center my-2">
        <div className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono text-center max-w-sm">
          {content}
          <div className="mt-1.5 text-amber-400/70 text-[10px]">
            ⏱ Scade tra {mins}:{secs.toString().padStart(2, '0')}
          </div>
          {isInvited && (
            <div className="mt-2">
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="px-4 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 hover:bg-emerald-400/30 transition-all text-xs font-semibold disabled:opacity-50"
              >
                {accepting ? '...' : '⚔️ Accetta sfida'}
              </button>
              {acceptErr && <p className="text-red-400 mt-1 text-[10px]">{acceptErr}</p>}
            </div>
          )}
          {isChallenger && (
            <div className="mt-1 text-zinc-500 text-[10px]">In attesa che l'avversario accetti...</div>
          )}
        </div>
      </div>
    )
  }

  // ── ACTIVE ──
  if (status.status === 'active') {
    return (
      <div className="flex justify-center my-2">
        <div className="px-4 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono text-center max-w-sm">
          ⚔️ Sfida in corso!
          <div className="mt-2">
            <button
              onClick={handleGoToDuel}
              className="px-4 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-400/30 transition-all text-xs font-semibold"
            >
              🎮 Vai alla sfida →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── COMPLETED ──
  if (status.status === 'completed') {
    const isWinner = status.winnerId === status.challengerId
    const winnerName = status.winnerUsername ?? '?'
    const score1 = status.user1Score
    const score2 = status.user2Score

    return (
      <div className="flex justify-center my-2">
        <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-center max-w-sm">
          <div className="text-emerald-400 font-bold text-sm mb-1">🏆 Sfida conclusa!</div>
          <div className="flex items-center justify-center gap-3 mt-2">
            <div className={`flex flex-col items-center px-3 py-1.5 rounded-lg ${isWinner ? 'bg-amber-500/15 border border-amber-400/30' : 'bg-zinc-800/50 border border-zinc-700/50'}`}>
              <span className={`text-[10px] ${isWinner ? 'text-amber-400' : 'text-zinc-500'}`}>
                {isWinner ? '👑' : ''} {status.challengerUsername}
              </span>
              <span className={`text-base font-bold ${isWinner ? 'text-amber-300' : 'text-zinc-400'}`}>{score1}</span>
            </div>
            <span className="text-zinc-600 text-xs">vs</span>
            <div className={`flex flex-col items-center px-3 py-1.5 rounded-lg ${!isWinner ? 'bg-amber-500/15 border border-amber-400/30' : 'bg-zinc-800/50 border border-zinc-700/50'}`}>
              <span className={`text-[10px] ${!isWinner ? 'text-amber-400' : 'text-zinc-500'}`}>
                {!isWinner ? '👑' : ''} {status.invitedUsername ?? '?'}
              </span>
              <span className={`text-base font-bold ${!isWinner ? 'text-amber-300' : 'text-zinc-400'}`}>{score2}</span>
            </div>
          </div>
          <div className="mt-2 text-emerald-400/70 text-[10px]">
            Vincitore: {winnerName}
          </div>
        </div>
      </div>
    )
  }

  // Fallback
  return (
    <div className="flex justify-center my-2">
      <div className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono text-center max-w-sm">
        {content}
      </div>
    </div>
  )
}

function ReplyPreview({ msg, onClear }: { msg: ChatMessageItem; onClear: () => void }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/80 border-t border-zinc-800">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-cyan-400 font-mono mb-0.5">Risposta a</p>
        <p className="text-xs text-zinc-400 font-mono truncate">
          {msg.imageUrl ? '📷 Immagine' : msg.content}
        </p>
      </div>
      <button onClick={onClear} className="text-zinc-600 hover:text-zinc-400 text-sm">✕</button>
    </div>
  )
}

export default function ChatPage() {
  const { isAuthenticated } = useAuthContext()
  const router = useRouter()
  const params = useParams()
  const matchId = params.matchId as string

  const { profile } = useProfile()
  const { messages, isLoading, send, sendImage, sendSystemMessage } = useChat(matchId, profile?.id ?? '')

  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [replyTo, setReplyTo] = useState<ChatMessageItem | null>(null)
  const [showEmojis, setShowEmojis] = useState(false)
  const [showLangPicker, setShowLangPicker] = useState(false)
  const [challenging, setChallenging] = useState(false)
  const [challengeSent, setChallengeSent] = useState(false)
  const [isArchived, setIsArchived] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login')
  }, [isAuthenticated, router])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!isAuthenticated) return null

  const handleSend = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isSending) return
    const content = input.trim()
    const rTo = replyTo?.id ?? null
    setInput('')
    setReplyTo(null)
    setShowEmojis(false)
    setIsSending(true)
    try {
      await send(content, rTo)
    } finally {
      setIsSending(false)
    }
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsSending(true)
    try {
      await sendImage(file)
    } finally {
      setIsSending(false)
      e.target.value = ''
    }
  }

  const handleChallenge = async (language: string) => {
    if (challenging || challengeSent) return
    setShowLangPicker(false)
    setChallenging(true)
    try {
      const matchRepo = new MatchRepository()
      const match = await matchRepo.getMatch(matchId)
      if (!match) return
      const duelSvc = new DuelService()
      const resp = await duelSvc.inviteUser(match.userId, language, matchId)
      const duelId = resp.duelId
      // Send a system message linked to the duel invite
      await sendSystemMessage(`⚔️ Sfida lanciata in ${language}! L'avversario può accettare qui sotto.`, duelId)
      setChallengeSent(true)
      setTimeout(() => setChallengeSent(false), 5000)
    } catch { /* ignore */ } finally {
      setChallenging(false)
    }
  }

  const handleArchive = async () => {
    if (!confirm('Rimuovere questo match? Non potrai più inviare messaggi.')) return
    try {
      const matchRepo = new MatchRepository()
      await matchRepo.archiveMatch(matchId)
      setIsArchived(true)
    } catch { /* ignore */ }
  }

  const addEmoji = (emoji: string) => {
    setInput(prev => prev + emoji)
    setShowEmojis(false)
    inputRef.current?.focus()
  }

  const myId = profile?.id

  const getReplyMessage = (id: string) => messages.find(m => m.id === id) ?? null

  const handleAcceptInvite = useCallback(async (duelId: string) => {
    const duelSvc = new DuelService()
    const resp = await duelSvc.acceptInvite(duelId)
    if (resp.duelId) {
      sessionStorage.setItem('pendingDuelId', resp.duelId)
    }
    router.push('/duel')
  }, [router])

  return (
    <div className="min-h-screen bg-grid flex flex-col relative pb-16 sm:pb-0">
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-cyan-500/3 to-transparent pointer-events-none" />

      {/* Language picker modal */}
      {showLangPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-sm font-semibold font-mono text-zinc-100 mb-1">Scegli il linguaggio</h3>
            <p className="text-xs text-zinc-500 font-mono mb-4">Con cui sfidare il developer</p>
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {LANGUAGES.map(lang => (
                <button
                  key={lang}
                  onClick={() => handleChallenge(lang)}
                  className="text-xs font-mono px-2 py-2 rounded-lg border border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:border-cyan-400/40 hover:text-cyan-400 hover:bg-cyan-400/5 transition-all"
                >
                  {lang}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowLangPicker(false)}
              className="mt-4 w-full text-xs font-mono text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              Annulla
            </button>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between max-w-4xl w-full mx-auto px-4 sm:px-6 py-4 border-b border-zinc-900 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/match" className="text-zinc-500 hover:text-zinc-300 transition-colors font-mono text-xs">
            ← match
          </Link>
          <span className="text-zinc-700 hidden sm:inline">/</span>
          <span className="text-xs text-zinc-500 font-mono hidden sm:inline">chat</span>
        </div>
        <div className="flex items-center gap-2">
          {!isArchived && (
            <>
              <button
                onClick={() => setShowLangPicker(true)}
                disabled={challenging || challengeSent}
                className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-all ${
                  challengeSent
                    ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5'
                    : 'text-zinc-400 border-zinc-700 hover:text-cyan-400 hover:border-cyan-400/30 hover:bg-cyan-400/5 disabled:opacity-40'
                }`}
              >
                {challengeSent ? '✔ Sfida inviata!' : challenging ? '...' : '⚔️ Sfida'}
              </button>
              <button
                onClick={handleArchive}
                className="text-xs font-mono px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-600 hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5 transition-all"
                title="Rimuovi match"
              >
                🗑
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Archived banner */}
      {isArchived && (
        <div className="text-center py-3 bg-zinc-900/80 border-b border-zinc-800">
          <p className="text-xs text-zinc-500 font-mono">Match rimosso. Non puoi più inviare messaggi.</p>
        </div>
      )}

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-3">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-sm text-zinc-500 font-mono">
            <span className="text-cyan-400">$</span>&nbsp;loading<span className="animate-blink">_</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-sm text-zinc-600 font-mono text-center py-16">
            Nessun messaggio ancora.<br />Rompete il ghiaccio! 🧊
          </div>
        ) : (
          (() => {
            return messages.map(msg => {
            if (msg.isSystemMessage) {
              return (
                <SystemMessage
                  key={msg.id}
                  content={msg.content}
                  duelInviteId={msg.duelInviteId ?? null}
                  isSender={msg.senderId === myId}
                  myId={myId}
                  onAccept={handleAcceptInvite}
                />
              )
            }

            const isMe = msg.senderId === myId
            const replyMsg = msg.replyToId ? getReplyMessage(msg.replyToId) : null

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                <div className="flex flex-col gap-1 max-w-xs lg:max-w-md">
                  {/* Reply quote */}
                  {replyMsg && (
                    <div className={`px-3 py-1.5 rounded-xl text-[10px] font-mono border-l-2 bg-zinc-900/60 ${
                      isMe ? 'border-cyan-400/40 text-zinc-400 self-end' : 'border-zinc-500/40 text-zinc-500 self-start'
                    }`}>
                      {replyMsg.imageUrl ? '📷 Immagine' : (replyMsg.content ?? '').slice(0, 60)}
                    </div>
                  )}
                  <div className="flex items-end gap-1">
                    {/* Reply button on hover (other side) */}
                    {!isMe && (
                      <button
                        onClick={() => { setReplyTo(msg); inputRef.current?.focus() }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-700 hover:text-zinc-400 text-xs pb-2"
                        title="Rispondi"
                      >
                        ↩
                      </button>
                    )}
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm font-mono break-words ${
                        isMe
                          ? 'bg-cyan-500/15 border border-cyan-500/20 text-cyan-100 rounded-br-sm'
                          : 'bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-bl-sm'
                      }`}
                    >
                      {msg.imageUrl ? (
                        <img
                          src={`${msg.imageUrl}`}
                          alt="immagine"
                          className="max-w-full rounded-lg cursor-pointer"
                          style={{ maxHeight: 240 }}
                          onClick={() => window.open(`${msg.imageUrl}`, '_blank')}
                        />
                      ) : (
                        msg.content
                      )}
                      <div className={`text-[10px] mt-1 ${isMe ? 'text-cyan-400/50 text-right' : 'text-zinc-600'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {/* Reply button on hover (my side) */}
                    {isMe && (
                      <button
                        onClick={() => { setReplyTo(msg); inputRef.current?.focus() }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-700 hover:text-zinc-400 text-xs pb-2"
                        title="Rispondi"
                      >
                        ↩
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })})()
        )}
        <div ref={bottomRef} />
      </div>

      {/* Emoji picker */}
      {showEmojis && (
        <div className="relative z-10 max-w-4xl mx-auto w-full px-4 sm:px-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-wrap gap-2">
            {EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => addEmoji(e)}
                className="text-xl hover:scale-125 transition-transform"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      {!isArchived && (
        <div className="relative z-10 shrink-0 border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-sm">
          {/* Reply preview */}
          {replyTo && <ReplyPreview msg={replyTo} onClear={() => setReplyTo(null)} />}

          <form onSubmit={handleSend} className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex gap-2 items-end">
            {/* Emoji button */}
            <button
              type="button"
              onClick={() => setShowEmojis(v => !v)}
              className="shrink-0 px-2.5 py-2.5 rounded-xl text-lg text-zinc-500 hover:text-zinc-300 transition-colors"
              title="Emoji"
            >
              😊
            </button>

            {/* Image button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending}
              className="shrink-0 px-2.5 py-2.5 rounded-xl text-lg text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-40"
              title="Invia immagine"
            >
              📎
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />

            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Scrivi un messaggio..."
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 font-mono placeholder-zinc-700 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className="px-4 py-2.5 rounded-xl text-sm font-mono font-medium bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {isSending ? '...' : 'send →'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
