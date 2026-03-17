'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useNotifications } from '../context/NotificationContext'
import { NotificationType } from '@amalia/shared'
export function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Chiudi dropdown cliccando fuori
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = () => {
    setOpen(o => !o)
    if (!open && unreadCount > 0) markAllRead()
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative text-zinc-500 hover:text-zinc-300 transition-colors font-mono text-xs"
        aria-label="Notifiche"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-cyan-500 text-zinc-950 text-[9px] font-bold font-mono px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-8 w-72 sm:w-80 max-h-80 overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl z-50">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-zinc-300">Notifiche</span>
            {notifications.length > 0 && (
              <button
                onClick={markAllRead}
                className="text-[10px] font-mono text-cyan-400/70 hover:text-cyan-400 transition-colors"
              >
                segna tutte lette
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-zinc-600 font-mono">
              Nessuna notifica
            </div>
          ) : (
            <ul>
              {notifications.slice(0, 20).map(n => {
                const href = n.type === NotificationType.NewMatch
                  ? `/chat/${n.referenceId}`
                  : n.type === NotificationType.NewMessage
                  ? `/chat/${n.referenceId}`
                  : n.type === NotificationType.DuelChallenge
                  ? '/duel'
                  : '#'

                const time = new Date(n.createdAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })

                return (
                  <li key={n.id}>
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`flex gap-3 px-4 py-3 hover:bg-zinc-900/50 transition-colors border-b border-zinc-900 ${
                        !n.read ? 'bg-cyan-500/5' : ''
                      }`}
                    >
                      <span className="text-sm shrink-0 mt-0.5">
                        {n.type === NotificationType.NewMatch ? '🤝' : '💬'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-mono font-medium text-zinc-200 truncate">{n.title}</p>
                        <p className="text-[11px] text-zinc-500 truncate">{n.body}</p>
                      </div>
                      <span className="text-[9px] text-zinc-700 font-mono shrink-0">{time}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
