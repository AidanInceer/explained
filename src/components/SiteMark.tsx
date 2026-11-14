/** The site logo: three ink columns, then three blue rows. The same data, stored two ways. */
export default function SiteMark({ size = 40 }: { size?: number }) {
  const t = 3.6
  const g = 1.1
  return (
    <svg viewBox="0 0 30 13" width={size} height={(size * 13) / 30} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <rect key={`c${i}`} x={i * (t + g)} y="0" width={t} height="13" rx="0.7" fill="currentColor" />
      ))}
      {[0, 1, 2].map((i) => (
        <rect key={`r${i}`} x="17" y={i * (t + g)} width="13" height={t} rx="0.7" fill="#2f6bff" />
      ))}
    </svg>
  )
}
