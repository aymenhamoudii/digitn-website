import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 120,
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
        <div style={{ position: 'absolute', left: 40, top: 50, width: 12, height: 80, background: '#C96442', transform: 'skewX(-15deg)', borderRadius: 3 }} />
        <div style={{ marginLeft: 10 }}>D</div>
      </div>
    ),
    {
      ...size,
    }
  )
}
