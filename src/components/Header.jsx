import { useCallback, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { useFocus } from '../focus'
import { useDismiss } from '../hooks'
import { clock, initials } from '../lib/utils'
import Icon from './Icon'
import NotificationBell from './NotificationBell'

export default function Header({ onMenu }) {
  const { user, logout } = useAuth(), focus = useFocus(), nav = useNavigate()
  const [q, setQ] = useState(''), [menu, setMenu] = useState(false)
  const ref = useRef(null), close = useCallback(() => setMenu(false), [])
  useDismiss(ref, close, menu)
  const search = e => { e.preventDefault(); nav(q.trim() ? `/tasks?q=${encodeURIComponent(q.trim())}` : '/tasks'); setQ('') }

  return (
    <header className="header">
      <button className="icon-btn menu-btn" aria-label="Open menu" onClick={onMenu}><Icon name="menu" size={22} /></button>
      <form className="search" role="search" onSubmit={search}>
        <Icon name="search" size={18} />
        <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search tasks…" aria-label="Search tasks" />
      </form>
      <div className="header-right">
        {focus.active && (
          <Link to="/focus" className="focus-chip" title="Return to your focus session">
            <Icon name="timer" size={16} /><span className="tnum">{clock(focus.remainingMs)}</span><span className="chip-state">{focus.phase === 'paused' ? 'Paused' : 'Focus'}</span>
          </Link>
        )}
        <NotificationBell />
        <div className="popover-wrap" ref={ref}>
          <button className="user-btn" aria-expanded={menu} aria-haspopup="menu" onClick={() => setMenu(!menu)}>
            <span className="avatar">{initials(user.name)}</span>
            <span className="user-meta"><b>{user.name}</b><span className="small muted">{user.email}</span></span>
            <Icon name="down" size={16} />
          </button>
          {menu && (
            <div className="popover menu" role="menu">
              <div className="menu-id"><b>{user.name}</b><span className="small muted">{user.email}</span></div>
              <Link role="menuitem" to="/profile" onClick={close} className="menu-item"><Icon name="user" size={17} />Profile</Link>
              <button role="menuitem" className="menu-item" onClick={logout}><Icon name="logout" size={17} />Log out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
