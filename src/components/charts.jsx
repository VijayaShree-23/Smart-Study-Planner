// Lightweight chart components (plain SVG/CSS, no chart library -> no bundle bloat).

const niceMax = (max, step) => (max <= 0 ? step * 2 : Math.ceil(max / step) * step)

/** Vertical bar chart. data: [{ key, label, value, title, highlight }] */
export function BarChart({ data, format = v => v, step = 30, height = 200, ariaLabel }) {
  const max = Math.max(0, ...data.map(d => d.value)), top = niceMax(max, step)
  const ticks = [top, top / 2, 0]
  return (
    <div className="bar-chart" role="img" aria-label={ariaLabel}>
      <div className="bc-axis" style={{ height }}>{ticks.map(t => <span key={t}>{format(t)}</span>)}</div>
      <div className="bc-main">
        <div className="bc-plot" style={{ height }}>
          <div className="bc-grid"><i /><i /><i /></div>
          <div className="bc-cols">
            {data.map(d => {
              const pct = (d.value / top) * 100
              return (
                <div className="bc-col" key={d.key} title={d.title || `${d.label}: ${format(d.value)}`}>
                  {d.value > 0 && <span className="bc-val" style={{ bottom: `calc(${pct}% + 4px)` }}>{format(d.value)}</span>}
                  <div className={'bc-bar' + (d.highlight ? ' hl' : '')} style={{ height: `${pct}%` }} />
                </div>
              )
            })}
          </div>
        </div>
        <div className="bc-labels">{data.map(d => <span key={d.key} className={d.highlight ? 'hl' : ''}>{d.label}</span>)}</div>
      </div>
    </div>
  )
}

/** Donut chart. segments: [{ label, value, color }] */
export function Donut({ segments, centerValue, centerLabel, size = 150 }) {
  const total = segments.reduce((a, s) => a + s.value, 0), r = 42, C = 2 * Math.PI * r
  let offset = 0
  return (
    <div className="donut-wrap">
      <div className="donut" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={segments.map(s => `${s.label}: ${s.value}`).join(', ')}>
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--track)" strokeWidth="12" />
          {total > 0 && segments.filter(s => s.value > 0).map(s => {
            const len = (s.value / total) * C, el = (
              <circle key={s.label} cx="50" cy="50" r={r} fill="none" stroke={s.color} strokeWidth="12"
                strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} transform="rotate(-90 50 50)" />
            )
            offset += len
            return el
          })}
        </svg>
        <div className="donut-center"><strong>{centerValue}</strong><span>{centerLabel}</span></div>
      </div>
      <ul className="legend">{segments.map(s => <li key={s.label}><i style={{ background: s.color }} />{s.label}<b>{s.value}</b></li>)}</ul>
    </div>
  )
}

/** Circular progress ring used by the focus timer. */
export function Ring({ value, size = 280, stroke = 12, children, color = 'var(--accent)' }) {
  const r = (size - stroke) / 2, C = 2 * Math.PI * r
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--track)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - Math.min(1, Math.max(0, value)))} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="ring-inner">{children}</div>
    </div>
  )
}
