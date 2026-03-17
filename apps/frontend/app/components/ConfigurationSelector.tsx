'use client'

interface ConfigurationSelectorProps<T extends string> {
  label: string
  options: { label: string; value: T }[]
  selected: T
  onChange: (value: T) => void
}

export function ConfigurationSelector<T extends string>({
  label,
  options,
  selected,
  onChange,
}: ConfigurationSelectorProps<T>) {
  return (
    <div className="mb-6">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3 font-mono">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all font-mono
              ${selected === opt.value
                ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
              }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}