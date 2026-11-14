import { useState } from 'react'
import { C } from '../kit'

const varint = (n: number) => {
  const out: number[] = []
  let v = Math.max(0, Math.floor(n))
  do {
    let b = v & 0x7f
    v = Math.floor(v / 128)
    if (v) b |= 0x80
    out.push(b)
  } while (v)
  return out
}

type Field = { no: number; name: string; bytes: number[]; color: string }

const FIELD_COL = [C.blue, C.amber, C.teal, C.purple]

/** The same record as JSON text and as Protocol Buffers bytes, and what an older reader sees. */
export function SwEncode() {
  const [id, setId] = useState(1042)
  const [name, setName] = useState('Desk lamp')
  const [price, setPrice] = useState(2499)
  const [stock, setStock] = useState(true)
  const [old, setOld] = useState(false)
  const json = JSON.stringify({ id, name, price_pence: price, in_stock: stock })
  const jsonBytes = new TextEncoder().encode(json).length
  const nameBytes = [...new TextEncoder().encode(name)]
  const fields: Field[] = [
    { no: 1, name: 'id', bytes: id ? [(1 << 3) | 0, ...varint(id)] : [], color: FIELD_COL[0] },
    { no: 2, name: 'name', bytes: name ? [(2 << 3) | 2, ...varint(nameBytes.length), ...nameBytes] : [], color: FIELD_COL[1] },
    { no: 3, name: 'price_pence', bytes: price ? [(3 << 3) | 0, ...varint(price)] : [], color: FIELD_COL[2] },
    { no: 4, name: 'in_stock', bytes: stock ? [(4 << 3) | 0, 1] : [], color: FIELD_COL[3] },
  ]
  const pbBytes = fields.reduce((a, f) => a + f.bytes.length, 0)
  const hex = (b: number) => b.toString(16).toUpperCase().padStart(2, '0')
  const input = { font: 'inherit', padding: '5px 8px', border: '1px solid var(--rule)', borderRadius: 4, width: '100%' } as const
  return (
    <div className="kx">
      <div className="kx-ctl">
        <label className="sl">
          <span>id</span>
          <input type="number" min={0} max={9999999} value={id} onChange={(e) => setId(Math.max(0, Number(e.target.value) || 0))} style={input} />
        </label>
        <label className="sl">
          <span>name</span>
          <input type="text" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} style={input} />
        </label>
        <label className="sl">
          <span>price_pence</span>
          <input type="number" min={0} max={9999999} value={price} onChange={(e) => setPrice(Math.max(0, Number(e.target.value) || 0))} style={input} />
        </label>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontWeight: 600 }}>
          <input type="checkbox" checked={stock} onChange={() => setStock(!stock)} />
          in_stock
        </label>
      </div>
      <h5>JSON: {jsonBytes} bytes of text</h5>
      <p className="kx-mono" style={{ margin: '0 0 14px', padding: '8px 10px', background: 'var(--surface-2)', borderRadius: 4, wordBreak: 'break-all' }}>
        {json}
      </p>
      <h5>Protocol Buffers: {pbBytes} bytes</h5>
      <div className="kx-mono" style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 6 }}>
        {fields.flatMap((f) =>
          f.bytes.map((b, i) => (
            <span key={`${f.no}-${i}`} title={`field ${f.no} (${f.name})`} style={{ padding: '2px 4px', borderRadius: 3, background: f.color, color: '#fff', fontWeight: i === 0 ? 800 : 500, outline: i === 0 ? '2px solid var(--ink)' : undefined, outlineOffset: -2 }}>
              {hex(b)}
            </span>
          )),
        )}
      </div>
      <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: '0 0 14px' }}>
        Each field starts with a key byte (outlined): its field number and type. Names are not sent; the schema file maps number 3 to "price_pence".
        {fields.some((f) => !f.bytes.length) && ' A field that holds its default value (0, empty text or false) is not sent at all.'}
      </p>
      <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontWeight: 600, marginBottom: 8 }}>
        <input type="checkbox" checked={old} onChange={() => setOld(!old)} />
        Read it with an old app, built when the schema had only fields 1 and 2
      </label>
      <table className="tbl">
        <thead>
          <tr>
            <th>Field number</th>
            <th>{old ? 'The old app sees' : 'The current app sees'}</th>
          </tr>
        </thead>
        <tbody>
          {fields
            .filter((f) => f.bytes.length)
            .map((f) => (
              <tr key={f.no} className={old && f.no > 2 ? 'err' : undefined}>
                <td style={{ color: f.color, fontWeight: 700 }}>{f.no}</td>
                <td style={{ fontFamily: 'var(--sans)', fontSize: 14 }}>
                  {old && f.no > 2 ? `unknown field: skipped, using its length from the key` : `${f.name} = ${f.no === 1 ? id : f.no === 2 ? `"${name}"` : f.no === 3 ? price : String(stock)}`}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <p className="stat">
        The binary form is {fx2(pbBytes / jsonBytes)}% of the JSON size, and faster to read, but you need the schema to make sense of it. Because each
        field carries its number, an old reader skips fields it does not know, and a new reader fills in defaults for fields an old writer did not
        send. That is what lets the two sides change at different times.
      </p>
    </div>
  )
}

const fx2 = (v: number) => Math.round(v * 100)
