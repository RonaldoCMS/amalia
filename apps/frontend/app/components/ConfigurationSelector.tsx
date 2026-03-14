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
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors
              ${selected === opt.value
                ? 'border-blue-400 bg-blue-50 text-blue-800'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}