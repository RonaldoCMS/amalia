'use client'

import { use, useRef, useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '../../../context/AuthContext'
import { useProfile } from '../../../../hooks/useProfile'
import { useJobChat } from '../../../../hooks/useJobs'
import { JobMessageItem } from '@amalia/shared'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

function Avatar({ url, name, size = 32 }: { url: string | null; name: string; size?: number }) {
  const px = `${size}px`
  if (url) {
    return <img src={url} alt={name} style={{ width: px, height: px }} className="rounded-full object-cover border border-zinc-700" />
  }
  return (
    <div style={{ width: px, height: px }} className="rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-mono text-xs font-bold">
      {name[0]?.toUpperCase()}
    </div>
  )
}

function Bubble({ msg, isMe }: { msg: JobMessageItem; isMe: boolean }) {
  if (msg.isOfferPreview) {
    return (
      <div className="flex justify-center my-2">
        <div className="px-4 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono text-center max-w-sm whitespace-pre-wrap">
          {msg.content}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
      {!isMe && (
        <div className="mr-2 mt-auto">
          <Avatar url={msg.senderPhoto} name={msg.senderUsername} size={28} />
        </div>
      )}
      <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm font-mono ${
        isMe
          ? 'bg-cyan-500/15 border border-cyan-500/20 text-cyan-100 rounded-br-md'
          : 'bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-bl-md'
      }`}>
        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
        <p className={`text-[9px] mt-1 ${isMe ? 'text-cyan-400/40' : 'text-zinc-600'}`}>
          {new Date(msg.createdAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}

export default function JobChatPage({ params }: { params: Promise<{ applicationId: string }> }) {
  const { applicationId } = use(params)
  const { isAuthenticated } = useAuthContext()
  const { profile } = useProfile()
  const { messages, isLoading, send } = useJobChat(applicationId)
  const router = useRouter()

  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  if (!isAuthenticated || !profile) return null

  const handleSend = async (e: FormEvent) => {
    e.preventDefault()
    const content = text.trim()
    if (!content || sending) return
    setText('')
    setSending(true)
    try { await send(content) }
    catch { /* ignore */ }
    finally { setSending(false) }
  }

  return (
    <div className="min-h-screen bg-grid flex flex-col relative">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950 z-0" />

      {/* Top bar */}
      <div className="relative z-20 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.push('/jobs')} className="text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors">
            ← indietro
          </button>
          <div className="flex-1 text-center">
            <span className="text-xs font-mono text-zinc-300">💼 job chat</span>
          </div>
          <div className="w-16" /> {/* spacer */}
        </div>
      </div>

      {/* Messages */}
      <main className="relative z-10 flex-1 max-w-2xl w-full mx-auto px-4 py-4 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-600 font-mono text-sm">nessun messaggio ancora</p>
          </div>
        ) : (
          messages.map(m => (
            <Bubble key={m.id} msg={m} isMe={m.senderId === profile.id} />
          ))
        )}
        <div ref={bottomRef} />
      </main>

      {/* Input bar */}
      <div className="relative z-20 border-t border-zinc-800 bg-zinc-950/90 backdrop-blur safe-bottom">
        <form onSubmit={handleSend} className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="scrivi un messaggio..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 font-mono placeholder-zinc-700 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="px-4 py-2.5 rounded-xl text-sm font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            invia
          </button>
        </form>
      </div>
    </div>
  )
}
