/** Four square marks on the corners of a frame, as in the system drawing. The parent needs position: relative. */
export default function Corners() {
  return (
    <>
      <i className="fc tl" aria-hidden="true" />
      <i className="fc tr" aria-hidden="true" />
      <i className="fc bl" aria-hidden="true" />
      <i className="fc br" aria-hidden="true" />
    </>
  )
}
