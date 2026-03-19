import { Suspense } from 'react'
import { CallbackContent } from './CallbackContent'

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-16 text-sm text-gray-500">
        Caricamento...
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}