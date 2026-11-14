/**
 * The site logo: a square taken apart into four pieces. One piece, in blue, is pulled out to look at on its own.
 * The pieces bounce softly four times, then jump, swap places with a flip, and land back in order. The blue piece
 * pulses faintly. Motion stops for readers who ask for less (see `.sm` in styles.css).
 */
export default function SiteMark({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 68" width={(size * 64) / 68} height={size} aria-hidden="true" className="sm" style={{ overflow: 'visible' }}>
      <rect x="0" y="8" width="27" height="27" rx="3.5" fill="currentColor" className="sm-p sm-tl" />
      <rect x="0" y="41" width="27" height="27" rx="3.5" fill="currentColor" className="sm-p sm-bl" />
      <rect x="33" y="41" width="27" height="27" rx="3.5" fill="currentColor" className="sm-p sm-br" />
      <rect x="37" y="0" width="27" height="27" rx="3.5" fill="#2f6bff" className="sm-p sm-blue" />
    </svg>
  )
}
