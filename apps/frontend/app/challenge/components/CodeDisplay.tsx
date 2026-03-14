'use client'

interface CodeDisplayProps {
  code: string
}

export function CodeDisplay({ code }: CodeDisplayProps) {
  return (
    <pre className="bg-gray-950 text-gray-100 rounded-lg p-4 text-sm font-mono leading-relaxed overflow-x-auto mb-6">
      <code>{code}</code>
    </pre>
  )
}