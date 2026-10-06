// Date / formatting helpers. All "day" values are local calendar dates as 'YYYY-MM-DD' strings,
// which matches how the backend serialises LocalDate and LocalDateTime (no timezone suffix).

export const pad = n => String(n).padStart(2, '0')

/** Local calendar date -> 'YYYY-MM-DD' (NOT toISOString(), which is UTC and off by a day near midnight in IST). */
export const dateKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const todayKey = () => dateKey(new Date())
export const parseDay = key => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d) }
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
/** Whole days from one 'YYYY-MM-DD' to another (positive when `to` is later). */
export const daysBetween = (from, to) => Math.round((parseDay(to) - parseDay(from)) / 864e5)
export const daysUntil = key => (key ? daysBetween(todayKey(), key) : null)

/** Local datetime without timezone, the format Spring's LocalDateTime accepts. */
export const toLocalISO = d => `${dateKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
export const toInputValue = d => toLocalISO(d).slice(0, 16)
/** 'YYYY-MM-DD' of a backend datetime string such as '2026-10-06T14:30:00'. */
export const dayOf = dt => (dt ? String(dt).slice(0, 10) : null)

export function fmtDate(d) {
  if (!d) return 'No deadline'
  const diff = daysUntil(d)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff < 0) return `${-diff} days overdue`
  if (diff < 7) return `In ${diff} days`
  return parseDay(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}
export const fmtShortDate = d => parseDay(dayOf(d)).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
export const fmtTime = s => new Date(s).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

/** 90 -> '1h 30m', 25 -> '25m', 0/undefined -> '0m' */
export function mins(m) {
  m = Math.round(m || 0)
  if (m <= 0) return '0m'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60), r = m % 60
  return r ? `${h}h ${r}m` : `${h}h`
}
export const hoursOf = m => `${(Math.round(((m || 0) / 60) * 10) / 10).toString()} h`
export const label = s => (s ? s.replace(/_/g, ' ').toLowerCase().replace(/^./, c => c.toUpperCase()) : '')
export const initials = name => (name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()
export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`
export const greeting = (h = new Date().getHours()) => (h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening')

/** mm:ss for the timer (rounds up so 0:00 only shows when really finished). */
export function clock(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`
}
