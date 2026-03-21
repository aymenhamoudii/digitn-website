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
          fontSize: 24,
          background: '#F4F0EB',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#1A1A1A',
          fontWeight: 700,
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', left: 6, top: 8, width: 4, height: 16, background: '#C96442', transform: 'skewX(-15deg)' }} />
        <div style={{ marginLeft: 4 }}>D</div>
      </div>
    ),
    {
      ...size,
    }
  )
}
