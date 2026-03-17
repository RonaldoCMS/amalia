'use client'

/**
 * Placeholder per Google AdSense.
 * Quando attiverai AdSense, sostituisci il contenuto con:
 * <ins className="adsbygoogle" data-ad-client="ca-pub-XXXX" data-ad-slot="YYYY" ... />
 * e chiama (window.adsbygoogle = window.adsbygoogle || []).push({}) nel useEffect.
 */

interface AdBannerProps {
  slot?: string
  format?: 'horizontal' | 'rectangle' | 'vertical'
  className?: string
}

export function AdBanner({ format = 'horizontal', className = '' }: AdBannerProps) {
  const heightClass =
    format === 'rectangle' ? 'min-h-[250px]'
    : format === 'vertical' ? 'min-h-[600px]'
    : 'min-h-[90px]'

  return (
    <div
      className={`w-full flex items-center justify-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20 ${heightClass} ${className}`}
      role="complementary"
      aria-label="Spazio pubblicitario"
    >
      {/* Placeholder — sostituire con il tag AdSense reale */}
      <div className="text-center px-4">
        <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">Ad Space</p>
        <p className="text-[9px] font-mono text-zinc-800 mt-1">Google AdSense · {format}</p>
      </div>
    </div>
  )
}

/**
 * Banner interstitial mostrato ogni N quiz.
 * Stessa struttura, si può customizzare per fullscreen overlay.
 */
export function AdInterstitial({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg border border-zinc-800 rounded-xl bg-zinc-950 p-6 text-center">
        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-4">Sponsored</p>

        {/* Placeholder AdSense rectangle */}
        <div className="w-full min-h-[250px] flex items-center justify-center border border-dashed border-zinc-800 rounded-lg bg-zinc-900/30 mb-4">
          <div>
            <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">Ad Space</p>
            <p className="text-[9px] font-mono text-zinc-800 mt-1">Google AdSense · rectangle</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-6 py-2 rounded-lg text-xs font-mono font-medium border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors"
        >
          Continua →
        </button>
      </div>
    </div>
  )
}
