import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 32,
  height: 32,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1e1d1b',
          borderRadius: 8,
          position: 'relative',
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            position: 'absolute',
            left: 7,
            top: 7,
            width: 4,
            height: 18,
            background: '#d97757',
            borderRadius: 2,
            transform: 'skewX(-8deg)',
          }}
        />
        {/* D letter */}
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#e5e4d9',
            marginLeft: 6,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          D
        </div>
      </div>
    ),
    { ...size }
  )
}
