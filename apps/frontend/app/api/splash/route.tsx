import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const w = parseInt(searchParams.get('w') ?? '1170')
  const h = parseInt(searchParams.get('h') ?? '2532')

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#09090b',
          gap: 0,
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 28,
            background: 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 28,
            boxShadow: '0 0 60px rgba(34,211,238,0.35)',
          }}
        >
          <span style={{ fontSize: 68, fontWeight: 800, color: '#09090b', lineHeight: 1 }}>A</span>
        </div>

        {/* App name */}
        <span
          style={{
            fontSize: 40,
            fontWeight: 700,
            color: '#f4f4f5',
            letterSpacing: '-1px',
            lineHeight: 1,
          }}
        >
          amalia
        </span>

        {/* Tagline */}
        <span
          style={{
            fontSize: 18,
            color: '#71717a',
            marginTop: 12,
            letterSpacing: '0.2px',
          }}
        >
          La tua maestra di codice
        </span>
      </div>
    ),
    {
      width: w,
      height: h,
      headers: {
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    },
  )
}
