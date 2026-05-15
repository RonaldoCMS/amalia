
'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthContext } from '@/app/context/AuthContext'

function AuthCallbackInner() {
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

  