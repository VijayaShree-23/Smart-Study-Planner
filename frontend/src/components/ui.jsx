// Reusable UI building blocks used by every page.
import { useEffect, useId, useRef } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'
import { daysUntil, fmtDate, label } from '../lib/utils'

// Re-exported so pages have a single import for formatting helpers.
export { fmtDate, fmtTime, mins, label } from '../lib/utils'

/* ---------- loading / empty / error ---------- */
export const Spinner = () => <div className="center"><div className="spinner" role="status" aria-label="Loading" /></div>

export const Skeleton = ({ h = 16, w = '100%', r = 6, className = '' }) =>
  <div className={'skeleton ' + className} style={{ height: h, width: w, borderRadius: r }} aria-hidden="true" />

/** Full-page loading state: skeleton cards plus a message (never a blank white screen). */
export function PageLoader({ text = 'Loading your study data…', fullscreen = false }) {
  return (
    <div className={fullscreen ? 'fullscreen-loader' : 'page-loader'} role="status" aria-live="polite">
      <div className="loader-msg"><div className="spinner" aria-hidden="true" /><span>{text}</span></div>
      {!fullscreen && (
        <div className="skeleton-grid" aria-hidden="true">
          {[0, 1, 2, 3].map(i => <div className="card" key={i}><Skeleton h={12} w="40%" /><Skeleton h={28} w="60%" className="mt" /><Skeleton h={10} w="80%" className="mt" /></div>)}
        </div>
      )}
    </div>
  )
}

export const EmptyState = ({ icon = 'inbox', title, text, action }) => (
  <div className="empty">
    <div className="empty-icon"><Icon name={icon} size={26} /></div>
    <h3>{title}</h3>{text && <p>{text}</p>}{action && <div className="empty-action">{action}</div>}
  </div>
)

export const ErrorBox = ({ message, onRetry }) => (
  <div className="alert error" role="alert">
    <Icon name="alert" size={18} /><span className="grow">{message}</span>
    {onRetry && <Button size="sm" onClick={onRetry}>Try again</Button>}
  </div>
)

/* ---------- buttons / badges / cards ---------- */
export function Button({ variant = 'secondary', size, icon, to, loading, disabled, children, className = '', type = 'button', ...rest }) {
  const cls = `btn ${variant} ${size || ''} ${className}`.trim()
  const inner = <>{icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} />}{children && <span>{children}</span>}</>
  if (to) return <Link to={to} className={cls} {...rest}>{inner}</Link>
  return <button type={type} className={cls} disabled={loading || disabled} {...rest}>{loading ? 'Please wait…' : inner}</button>
}
export const IconButton = ({ icon, label: text, danger, ...rest }) =>
  <button type="button" className={'icon-btn' + (danger ? ' danger' : '')} aria-label={text} title={text} {...rest}><Icon name={icon} size={18} /></button>

export const Badge = ({ tone = 'neutral', icon, children }) =>
  <span className={`badge ${tone}`}>{icon && <Icon name={icon} size={13} />}{children}</span>

const PRI_TONE = { HIGH: 'danger', MEDIUM: 'warning', LOW: 'info' }
export const PriorityBadge = ({ priority }) => <Badge tone={PRI_TONE[priority] || 'neutral'}>{label(priority)}</Badge>
const STATUS_TONE = { TODO: 'neutral', IN_PROGRESS: 'accent', COMPLETED: 'success' }
export const StatusBadge = ({ status }) => <Badge tone={STATUS_TONE[status] || 'neutral'} icon={status === 'COMPLETED' ? 'check' : undefined}>{status === 'TODO' ? 'To do' : label(status)}</Badge>

/** Deadline text with a clear overdue / due-soon indicator. */
export function DueText({ task }) {
  if (!task.dueDate) return <span className="muted">No deadline</span>
  const open = task.status !== 'COMPLETED', d = daysUntil(task.dueDate)
  if (open && task.overdue) return <Badge tone="danger" icon="alert">{fmtDate(task.dueDate)}</Badge>
  return <span className={open && d <= 1 ? 'due-soon' : ''}>{fmtDate(task.dueDate)}</span>
}

export const Card = ({ title, subtitle, action, children, className = '', pad = true }) => (
  <section className={`card ${className}`}>
    {(title || action) && <header className="card-head"><div><h2>{title}</h2>{subtitle && <p className="muted small">{subtitle}</p>}</div>{action}</header>}
    <div className={pad ? '' : 'flush'}>{children}</div>
  </section>
)

export const StatCard = ({ icon, label: text, value, hint, tone = 'accent', children }) => (
  <div className="card stat">
    <div className="stat-top"><span className="stat-label">{text}</span><span className={'stat-icon ' + tone}><Icon name={icon} size={18} /></span></div>
    <div className="stat-value">{value}</div>
    {children}{hint && <div className="stat-hint">{hint}</div>}
  </div>
)

export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="page-head"><div><h1>{title}</h1>{subtitle && <p className="muted">{subtitle}</p>}</div>{actions && <div className="page-actions">{actions}</div>}</div>
)

export const ProgressBar = ({ value = 0, color, label: text }) => (
  <div className="bar" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100} aria-label={text}>
    <span style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color || 'var(--accent)' }} />
  </div>
)

export const SubjectDot = ({ color }) => <span className="dot" style={{ background: color || '#9aa5b8' }} aria-hidden="true" />

/* ---------- modal ---------- */
export function Modal({ title, onClose, children, wide }) {
  const ref = useRef(null), titleId = useId(), closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    const prevFocus = document.activeElement, prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (ref.current && !ref.current.contains(document.activeElement)) ref.current.focus()
    const onKey = e => {
      if (e.key === 'Escape') return closeRef.current()
      if (e.key !== 'Tab' || !ref.current) return
      const f = ref.current.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')
      if (!f.length) return
      const first = f[0], last = f[f.length - 1], a = document.activeElement
      if (e.shiftKey && (a === first || a === ref.current)) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow; prevFocus && prevFocus.focus && prevFocus.focus() }
  }, [])
  return (
    <div className="overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className={'modal' + (wide ? ' wide' : '')} role="dialog" aria-modal="true" aria-labelledby={titleId} ref={ref} tabIndex={-1}>
        <div className="modal-head"><h2 id={titleId}>{title}</h2><IconButton icon="x" label="Close" onClick={onClose} /></div>
        {children}
      </div>
    </div>
  )
}

export const ConfirmDialog = ({ title, text, confirmLabel = 'Delete', onConfirm, onCancel, busy }) => (
  <Modal title={title} onClose={onCancel}>
    <p className="muted">{text}</p>
    <div className="actions"><Button onClick={onCancel}>Cancel</Button><Button variant="danger" loading={busy} onClick={onConfirm}>{confirmLabel}</Button></div>
  </Modal>
)
