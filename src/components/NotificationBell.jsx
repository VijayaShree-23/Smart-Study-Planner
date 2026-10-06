import { useCallback, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { useData } from '../data'
import { useDismiss } from '../hooks'
import Icon from './Icon'
import { Button } from './ui'

const ICON = { danger: 'alert', warning: 'clock', info: 'calendar', success: 'check' }

/** Notification centre derived from tasks + sessions. "Read" state is remembered per user in localStorage. */
export default function NotificationBell() {
  const { user } = useAuth(), { insights } = useData(), nav = useNavigate()
  const key = `ssp.notif.read.${user.id}`
  const [open, setOpen] = useState(false)
  const [read, setRead] = useState(() => { try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')) } catch { return new Set() } })
  const ref = useRef(null), close = useCallback(() => setOpen(false), [])
  useDismiss(ref, close, open)

  const items = insights.notifications
  const unread = useMemo(() => items.filter(n => !read.has(n.id)), [items, read])
  const save = next => { setRead(next); try { localStorage.setItem(key, JSON.stringify([...next].slice(-200))) } catch { /* storage full/blocked */ } }
  const markAll = () => save(new Set([...read, ...items.map(n => n.id)]))
  const go = n => { save(new Set([...read, n.id])); setOpen(false); nav(n.to) }

  return (
    <div className="popover-wrap" ref={ref}>
      <button className="icon-btn bell" aria-label={`Notifications${unread.length ? `, ${unread.length} unread` : ''}`} aria-expanded={open} onClick={() => setOpen(!open)}>
        <Icon name="bell" size={20} />{unread.length > 0 && <span className="bell-count">{unread.length > 9 ? '9+' : unread.length}</span>}
      </button>
      {open && (
        <div className="popover notif" role="dialog" aria-label="Notifications">
          <div className="popover-head"><strong>Notifications</strong>{unread.length > 0 && <Button variant="ghost" size="sm" onClick={markAll}>Mark all read</Button>}</div>
          {items.length === 0 ? <p className="muted pad">You're all caught up. Deadlines and sessions will show up here.</p> : (
            <ul>{items.map(n => (
              <li key={n.id}>
                <button className={'notif-item' + (read.has(n.id) ? ' read' : '')} onClick={() => go(n)}>
                  <span className={'notif-icon ' + n.level}><Icon name={ICON[n.level]} size={16} /></span>
                  <span className="grow"><b>{n.title}</b><span className="small muted block">{n.text}</span></span>
                  {!read.has(n.id) && <span className="unread-dot" aria-hidden="true" />}
                </button>
              </li>
            ))}</ul>
          )}
        </div>
      )}
    </div>
  )
}
