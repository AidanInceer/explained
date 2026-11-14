/** The site logo: a square taken apart into four pieces. One piece, in blue, is pulled out to look at on its own. */
export default function SiteMark({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 68" width={(size * 64) / 68} height={size} aria-hidden="true">
      <rect x="0" y="8" width="27" height="27" rx="3.5" fill="currentColor" />
      <rect x="0" y="41" width="27" height="27" rx="3.5" fill="currentColor" />
      <rect x="33" y="41" width="27" height="27" rx="3.5" fill="currentColor" />
      <rect x="37" y="0" width="27" height="27" rx="3.5" fill="#2f6bff" />
    </svg>
  )
}
