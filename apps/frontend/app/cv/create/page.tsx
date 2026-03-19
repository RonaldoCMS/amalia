'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '../../context/AuthContext'
import { useCv } from '../../../hooks/useCv'
import { CvMessage } from '@amalia/shared'

export default function CvCreatePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthContext()
  const { session, isLoading, isSending, isGenerating, error, loadMyCV, startInterview, sendMessage, generateCv, deleteMyCV } = useCv()
  const [input, setInput] = useState('')
  const [isDone, setIsDone] = useState(false)
  const [optimisticMessages, setOptimisticMessages] = useState<CvMessage[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!isAuthenticated) { router.replace('/login'); return }
    loadMyCV()
  }, [isAuthenticated]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (session?.status === 'ready') {
      router.replace(`/cv/${session.username}`)
    }
    if (session?.status === 'generating') {
      setIsDone(true)
    }
  }, [session?.status]) // eslint-disable-line react-hooks/exhaustive-deps

  const messageCount = session?.messages?.length ?? 0
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messageCount])

  const handleStart = async () => {
    if (session) return
    await startInterview()
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isSending || isDone) return
    setInput('')
    // Optimistic: show user bubble immediately
    const optimistic: CvMessage = { role: 'user', content: text }
    setOptimisticMessages(prev => [...prev, optimistic])
    const res = await sendMessage(text)
    // Clear optimistic once session updates
    setOptimisticMessages([])
    if (res?.isDone) setIsDone(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleGenerate = async () => {
    await generateCv()
  }

  const handleRestart = async () => {
    if (!confirm('Vuoi ricominciare l\'intervista? Il CV attuale verrà eliminato.')) return
    await deleteMyCV()
    setIsDone(false)
    setOptimisticMessages([])
    await startInterview()
  }

  if (isLoading && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const messages: CvMessage[] = [...(session?.messages ?? []), ...optimisticMessages]

  return (
    <div className="min-h-screen bg-grid flex flex-col pb-16 sm:pb-0">
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-violet-500/4 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 sticky top-0 bg-[#0a0a0f]/80 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold font-mono text-zinc-100">
            amalia<span className="text-violet-400">_</span>myCV
          </h1>
          <p className="text-[10px] font-mono text-zinc-600">Intervista per il CV professionale</p>
        </div>
        {session && (
          <button
            onClick={handleRestart}
            className="text-[10px] font-mono text-zinc-600 hover:text-red-400 transition border border-zinc-800 rounded-lg px-3 py-1.5"
          >
            Ricomincia
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-xl mx-auto w-full">

        {/* No session yet — start button */}
        {!session && !isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-violet-400/10 border border-violet-400/20 flex items-center justify-center text-3xl">
              ✨
            </div>
            <div>
              <h2 className="text-lg font-bold font-mono text-zinc-100">Crea il tuo myCV</h2>
              <p className="text-sm text-zinc-500 mt-2 max-w-xs">
                Amalia ti intervistarà per 4 domande, poi genererà un CV professionale basato sulle tue risposte e i tuoi dati reali sulla piattaforma.
              </p>
            </div>
            <button
              onClick={handleStart}
              disabled={isLoading}
              className="mt-2 px-6 py-3 rounded-xl border border-violet-400/30 bg-violet-400/10 text-violet-400 font-mono font-semibold hover:bg-violet-400/20 transition disabled:opacity-40"
            >
              Inizia l'intervista →
            </button>
          </div>
        )}

        {/* Chat messages */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            {msg.role === 'amalia' ? (
              <div className="w-8 h-8 rounded-full bg-violet-400/20 border border-violet-400/30 flex items-center justify-center text-xs font-mono text-violet-400 shrink-0 mt-1">
                AI
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-mono text-zinc-400 shrink-0 mt-1">
                Tu
              </div>
            )}

            {/* Bubble */}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'amalia'
                  ? 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-sm'
                  : 'bg-violet-400/10 border border-violet-400/20 text-zinc-200 rounded-tr-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Sending indicator */}
        {isSending && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-400/20 border border-violet-400/30 flex items-center justify-center text-xs font-mono text-violet-400 shrink-0">
              AI
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Generating state */}
        {(isDone || session?.status === 'generating') && !isGenerating && (
          <div className="border border-violet-400/20 rounded-xl bg-violet-400/5 p-5 text-center space-y-3">
            <p className="text-sm font-mono text-zinc-300">
              🚀 Intervista completata! Amalia è pronta a generare il tuo CV.
            </p>
            <button
              onClick={handleGenerate}
              className="px-6 py-2.5 rounded-xl border border-violet-400/30 bg-violet-400 text-[#0a0a0f] font-mono font-bold text-sm hover:bg-violet-300 transition"
            >
              Genera il mio CV →
            </button>
          </div>
        )}

        {/* Generating spinner */}
        {isGenerating && (
          <div className="border border-violet-400/20 rounded-xl bg-violet-400/5 p-8 text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm font-mono text-zinc-400">
              Amalia sta generando il tuo CV professionale...
            </p>
            <p className="text-[10px] font-mono text-zinc-600">Questo richiede circa 10-15 secondi</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm font-mono text-red-400 text-center">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      {session && session.status === 'interviewing' && !isDone && (
        <div className="relative z-10 border-t border-zinc-800 bg-[#0a0a0f]/80 backdrop-blur px-4 py-3">
          <div className="max-w-xl mx-auto flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Scrivi la tua risposta..."
              disabled={isSending}
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 font-mono resize-none focus:outline-none focus:border-violet-400/50 transition disabled:opacity-40"
              style={{ minHeight: '42px', maxHeight: '120px' }}
              onInput={e => {
                const el = e.currentTarget
                el.style.height = 'auto'
                el.style.height = Math.min(el.scrollHeight, 120) + 'px'
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isSending}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-violet-400/10 border border-violet-400/30 text-violet-400 hover:bg-violet-400/20 transition disabled:opacity-30 shrink-0"
            >
              <svg className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
