import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth'
import { useFocus } from '../focus'
import Icon from './Icon'

const NAV = [
  ['/dashboard', 'Dashboard', 'dashboard'],
  ['/smart-plan', 'Smart Plan', 'bulb'],
  ['/focus', 'Focus Mode', 'timer'],
  ['/tasks', 'Tasks', 'tasks'],
  ['/subjects', 'Subjects', 'book'],
  ['/schedule', 'Schedule', 'calendar'],
  ['/progress', 'Analytics', 'chart'],
]

export default function Sidebar({ open, onClose }) {
  const { logout } = useAuth(), focus = useFocus()
  const link = ([to, text, icon]) => (
    <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => 'nav' + (isActive ? ' active' : '')}>
      <Icon name={icon} size={19} /><span>{text}</span>
      {to === '/focus' && focus.active && <span className="live-dot" aria-label="Timer running" />}
    </NavLink>
  )
  return (
    <aside className={'sidebar' + (open ? ' open' : '')} aria-label="Primary">
      <div className="brand">
        <span className="brand-mark"><Icon name="book" size={18} /></span>
        <span className="brand-name">Smart Study<br />Planner</span>
        <button className="icon-btn mobile-only" aria-label="Close menu" onClick={onClose}><Icon name="x" size={18} /></button>
      </div>
      <nav>{NAV.map(link)}</nav>
      <div className="sidebar-foot">
        {link(['/profile', 'Profile', 'user'])}
        <button className="nav" onClick={logout}><Icon name="logout" size={19} /><span>Log out</span></button>
      </div>
    </aside>
  )
}
