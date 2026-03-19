'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '../context/AuthContext'
import { useUserSearch } from '../../hooks/useUserSearch'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

export default function SearchPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthContext()
  const { results, isSearching, search, clear } = useUserSearch()
  const [query, setQuery] = useState('')

  if (!isAuthenticated) {
    router.replace('/login')
    return null
  }

  const handleChange = (value: string) => {
    setQuery(value)
    search(value)
  }

  return (
    <div className="min-h-screen bg-grid relative flex flex-col pb-16 sm:pb-0">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-cyan-500/3 to-transparent pointer-events-none" />

      <main className="relative z-10 max-w-xl mx-auto w-full px-4 py-6 flex-1">
        {/* Search input */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={e => handleChange(e.target.value)}
            placeholder="Cerca per username..."
            autoFocus
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-cyan-400/50 transition"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); clear() }}
              className="absolute inset-y-0 right-3 flex items-center text-zinc-600 hover:text-zinc-400"
            >
              ×
            </button>
          )}
        </div>

        {/* Loading */}
        {isSearching && (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Results */}
        {!isSearching && results.length > 0 && (
          <div className="space-y-1">
            {results.map(user => (
              <Link
                key={user.id}
                href={`/user/${user.id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900/60 transition"
              >
                {user.profilePhotoUrl ? (
                  <img
                    src={`${user.profilePhotoUrl}`}
                    alt={user.username}
                    className="w-11 h-11 rounded-full object-cover border border-zinc-700"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-mono font-bold">
                    {user.username[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-200 font-mono truncate">{user.username}</p>
                  {user.bio && (
                    <p className="text-xs text-zinc-500 truncate mt-0.5">{user.bio}</p>
                  )}
                </div>
                <svg className="w-4 h-4 text-zinc-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isSearching && query.length > 0 && results.length === 0 && (
          <div className="text-center py-16">
            <p className="text-zinc-600 text-sm">Nessun utente trovato</p>
            <p className="text-zinc-700 text-xs mt-1">Prova con un altro username</p>
          </div>
        )}

        {/* Initial state */}
        {!query && (
          <div className="text-center py-16">
            <p className="text-zinc-600 text-sm">Cerca utenti per username</p>
            <p className="text-zinc-700 text-xs mt-1">Trova altri developer e connettiti</p>
          </div>
        )}
      </main>
    </div>
  )
}
