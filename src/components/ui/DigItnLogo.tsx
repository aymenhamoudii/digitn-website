/**
 * DIGITN brand mark: accent bar ( | ) + letter D
 * Transparent background — use anywhere as an inline icon.
 */
export function DigItnLogo({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.or g/2000/svg"
      aria-label="DIGITN"
    >
      {/* Accent bar — terra-cotta, skewed */}
      <rect
        x="5"
        y="6"
        width="4"
        height="20"
        rx="1.5"
        fill="#d97757"
        transform="skewX(-8)"
      />
      {/* D lettermark */}
      <text
        x="13"
        y="24"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="20"
        fontWeight="700"
        fill="currentColor"
      >
        D
      </text>
    </svg>
  )
}
