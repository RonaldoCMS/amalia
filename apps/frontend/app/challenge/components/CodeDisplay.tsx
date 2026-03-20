'use client'

import { useEffect, useRef, useState } from 'react'

const BLANK = '___BLANK___'
const WRITE_MARKER = '__WRITE__'

export interface WriteProps {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  disabled?: boolean
}

export interface FillProps {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  disabled?: boolean
}

export interface BugProps {
  onSubmit: (lineNumber: number | null, reason: string) => void
  disabled?: boolean
}

interface CodeDisplayProps {
  code: string
  fill?: FillProps
  bug?: BugProps
  write?: WriteProps
}

export function CodeDisplay({ code, fill, bug, write }: CodeDisplayProps) {
  const fillInputRef = useRef<HTMLInputElement>(null)
  const bugInputRef = useRef<HTMLTextAreaElement>(null)
  const writeInputRef = useRef<HTMLTextAreaElement>(null)
  const lines = code.split('\n')

  // bug state: which line is "breakpointed" and the reason text
  const [bugLine, setBugLine] = useState<number | null>(null)
  const [bugReason, setBugReason] = useState('')
  const [hoverLine, setHoverLine] = useState<number | null>(null)

  // Reset when a new challenge arrives
  useEffect(() => {
    setBugLine(null)
    setBugReason('')
  }, [code])

  // Auto-focus fill input
  useEffect(() => {
    if (fill) fillInputRef.current?.focus()
  }, [fill])

  // Auto-focus write textarea
  useEffect(() => {
    if (write) writeInputRef.current?.focus()
  }, [write])

  // Auto-focus bug reason textarea when a line is selected
  useEffect(() => {
    if (bugLine !== null) bugInputRef.current?.focus()
  }, [bugLine])

  const handleBugLineClick = (lineIdx: number) => {
    if (!bug || bug.disabled) return
    if (bugLine === lineIdx) {
      setBugLine(null)
      setBugReason('')
    } else {
      setBugLine(lineIdx)
      setBugReason('')
    }
  }

  const handleBugSubmit = () => {
    if (!bug || bugLine === null || !bugReason.trim()) return
    bug.onSubmit(bugLine + 1, bugReason.trim())
  }

  const handleNoBug = () => {
    if (!bug || bug.disabled) return
    bug.onSubmit(null, 'No bug')
  }

  const isFooterVisible = !!fill || !!bug || !!write

  return (
    <div className="rounded-lg bg-[#0d0d14] border border-zinc-800/50 mb-6 overflow-hidden">
      {/* toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800/50">
        <span className="text-[10px] text-zinc-600 font-mono">code</span>
        {fill && (
          <span className="ml-auto text-[10px] font-mono text-cyan-500/60">
            clicca sul campo e scrivi la risposta
          </span>
        )}
        {bug && (
          <span className="ml-auto text-[10px] font-mono text-red-400/60">
            clicca sulla riga con il bug
          </span>
        )}
        {write && (
          <span className="ml-auto text-[10px] font-mono text-emerald-500/60">
            scrivi l'implementazione · Ctrl+Enter per confermare
          </span>
        )}
      </div>

      {/* code lines */}
      <div className="overflow-x-auto p-4">
        <pre className="text-sm font-mono leading-relaxed">
          {lines.map((line, lineIdx) => {
            const isBugSelected = bugLine === lineIdx
            const isBugHover = bug && !bug.disabled && hoverLine === lineIdx && bugLine === null

            // Write mode: replace __WRITE__ with a growing textarea
            const hasWrite = write && line.includes(WRITE_MARKER)
            if (hasWrite) {
              const indent = line.match(/^(\s*)/)?.[1] ?? ''
              const rows = Math.max(2, write!.value.split('\n').length + 1)
              return (
                <div key={lineIdx} className="flex items-start">
                  <span className="inline-block w-8 text-right mr-6 text-zinc-700 text-xs select-none shrink-0" style={{ paddingTop: '0.15rem' }}>
                    {lineIdx + 1}
                  </span>
                  <div className="flex-1 flex items-start">
                    {indent.length > 0 && (
                      <code className="text-zinc-700 whitespace-pre shrink-0 leading-relaxed">{indent}</code>
                    )}
                    <textarea
                      ref={writeInputRef}
                      value={write!.value}
                      onChange={e => write!.onChange(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          e.preventDefault()
                          if (write!.value.trim()) write!.onSubmit()
                        }
                      }}
                      disabled={write!.disabled}
                      placeholder={`${indent}// scrivi qui...`}
                      rows={rows}
                      spellCheck={false}
                      autoComplete="off"
                      autoCorrect="off"
                      className="flex-1 bg-transparent text-emerald-300 font-mono text-sm leading-relaxed focus:outline-none resize-none caret-emerald-400 disabled:opacity-40 placeholder-zinc-700 w-full"
                    />
                  </div>
                </div>
              )
            }

            // Fill mode: replace BLANK with inline input
            const hasFill = fill && line.includes(BLANK)
            if (hasFill) {
              const parts = line.split(BLANK)
              return (
                <div key={lineIdx} className="flex items-baseline">
                  <span className="inline-block w-8 text-right mr-6 text-zinc-700 text-xs select-none shrink-0 leading-relaxed">
                    {lineIdx + 1}
                  </span>
                  <code className="text-zinc-300 whitespace-pre">{parts[0]}</code>
                  <input
                    ref={fillInputRef}
                    type="text"
                    value={fill!.value}
                    onChange={e => fill!.onChange(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && fill!.value.trim()) fill!.onSubmit() }}
                    disabled={fill!.disabled}
                    placeholder="?"
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    style={{ width: `${Math.max(3, fill!.value.length + 1)}ch`, minWidth: '3ch' }}
                    className="inline-block bg-cyan-400/10 border-b-2 border-cyan-400 text-cyan-300 font-mono text-sm focus:outline-none focus:bg-cyan-400/15 px-1 mx-0.5 rounded-t-sm transition-colors disabled:opacity-40 caret-cyan-400"
                  />
                  <code className="text-zinc-300 whitespace-pre">{parts.slice(1).join(BLANK)}</code>
                </div>
              )
            }

            // Bug mode: clickable line with breakpoint marker
            if (bug) {
              return (
                <div
                  key={lineIdx}
                  className={`flex items-start group transition-colors cursor-pointer select-none rounded-sm ${
                    isBugSelected
                      ? 'bg-red-500/10'
                      : isBugHover
                      ? 'bg-zinc-800/50'
                      : ''
                  }`}
                  onClick={() => handleBugLineClick(lineIdx)}
                  onMouseEnter={() => setHoverLine(lineIdx)}
                  onMouseLeave={() => setHoverLine(null)}
                >
                  {/* gutter: breakpoint dot or line number */}
                  <span className="relative inline-flex items-center justify-end w-8 mr-6 shrink-0 pt-0.5">
                    {isBugSelected ? (
                      <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.7)] inline-block" />
                    ) : (
                      <>
                        {isBugHover && (
                          <span className="absolute right-0 w-2.5 h-2.5 rounded-full border border-red-500/60 inline-block" />
                        )}
                        <span className={`text-xs ${isBugHover ? 'text-zinc-600' : 'text-zinc-700'}`}>
                          {lineIdx + 1}
                        </span>
                      </>
                    )}
                  </span>

                  {/* line content — always shown as-is, selection glow handles highlighting */}
                  <code className={`whitespace-pre leading-relaxed ${isBugSelected ? 'text-red-200' : 'text-zinc-300'}`}>
                    {line || ' '}
                  </code>
                </div>
              )
            }

            // Default: plain line
            return (
              <div key={lineIdx} className="flex">
                <span className="inline-block w-8 text-right mr-6 text-zinc-700 text-xs select-none shrink-0 leading-relaxed">
                  {lineIdx + 1}
                </span>
                <code className="text-zinc-300 whitespace-pre">{line || ' '}</code>
              </div>
            )
          })}
        </pre>
      </div>

      {/* footer: submit button */}
      {isFooterVisible && (
        <div className="px-4 pb-4 pt-3 border-t border-zinc-800/50">
          {fill && (
            <button
              onClick={() => fill.value.trim() && fill.onSubmit()}
              disabled={fill.disabled || !fill.value.trim()}
              className="w-full py-2.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm font-mono font-medium hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed border border-zinc-700 transition-colors"
            >
              Verifica →
            </button>
          )}
          {write && (
            <button
              onClick={() => write.value.trim() && write.onSubmit()}
              disabled={write.disabled || !write.value.trim()}
              className="w-full py-2.5 rounded-lg bg-emerald-500/10 text-emerald-300 text-sm font-mono font-medium hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed border border-emerald-500/30 transition-colors"
            >
              Verifica →
            </button>
          )}
          {bug && (
            <div className="space-y-3">
              {bugLine !== null ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.7)] shrink-0" />
                    <span className="text-xs text-red-400/80 font-mono">Riga {bugLine + 1} selezionata — spiega il bug</span>
                  </div>
                  <textarea
                    ref={bugInputRef}
                    value={bugReason}
                    onChange={e => setBugReason(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Escape') { setBugLine(null); setBugReason('') }
                    }}
                    disabled={bug.disabled}
                    placeholder="Es: la variabile non è inizializzata prima dell'uso..."
                    rows={2}
                    spellCheck={false}
                    className="w-full bg-zinc-900 border border-red-500/30 rounded-lg text-sm text-zinc-200 font-sans px-3 py-2 focus:outline-none focus:border-red-500/60 resize-none placeholder-zinc-600 disabled:opacity-40 caret-red-400"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleNoBug}
                      disabled={bug.disabled}
                      className="flex-1 py-2 rounded-lg bg-zinc-800 text-zinc-400 text-sm font-mono hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed border border-zinc-700 transition-colors"
                    >
                      Nessun bug
                    </button>
                    <button
                      onClick={handleBugSubmit}
                      disabled={bug.disabled || !bugReason.trim()}
                      className="flex-1 py-2 rounded-lg bg-red-500/10 text-red-300 text-sm font-mono font-medium hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed border border-red-500/30 transition-colors"
                    >
                      ⚡ Riga {bugLine + 1} — Verifica
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="flex-1 text-xs text-zinc-600 font-mono">← clicca sulla riga sospetta, oppure</span>
                  <button
                    onClick={handleNoBug}
                    disabled={bug.disabled}
                    className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-400 text-sm font-mono hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed border border-zinc-700 transition-colors shrink-0"
                  >
                    Nessun bug
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
