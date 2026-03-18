'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthContext } from '@/app/context/AuthContext'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setToken } = useAuthContext()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      localStorage.setItem('token', token)
      setToken(token)
      router.push('/')
    } else {
      router.push('/login')
    }
  }, [])

  return (
    <main className="max-w-sm mx-auto px-4 py-16 text-center">
      <p className="text-sm text-gray-500">Accesso in corso...</p>
    </main>
  )
}