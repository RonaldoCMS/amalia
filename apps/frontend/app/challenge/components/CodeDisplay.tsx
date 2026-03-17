'use client'

interface CodeDisplayProps {
  code: string
}

export function CodeDisplay({ code }: CodeDisplayProps) {
  const lines = code.split('\n')

  return (
    <div className="rounded-lg bg-[#0d0d14] border border-zinc-800/50 mb-6 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800/50">
        <span className="text-[10px] text-zinc-600 font-mono">code</span>
      </div>
      <div className="overflow-x-auto p-4">
        <pre className="text-sm font-mono leading-relaxed">
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span className="inline-block w-8 text-right mr-6 text-zinc-700 text-xs select-none shrink-0 leading-relaxed">
                {i + 1}
              </span>
              <code className="text-zinc-300">{line || ' '}</code>
            </div>
          ))}
        </pre>
      </div>
    </div>
  )
}