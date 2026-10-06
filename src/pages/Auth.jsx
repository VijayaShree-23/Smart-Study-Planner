import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { errMsg } from '../api'
import { useAuth } from '../auth'
import Icon from '../components/Icon'
import { Button } from '../components/ui'

const POINTS = [['bulb', 'Smart Plan ranks what to study next'], ['timer', 'Focus Mode records every session'], ['chart', 'Analytics, streaks and achievements']]

export default function Auth({ mode }) {
  const reg = mode === 'register', { user, login, register } = useAuth(), nav = useNavigate(), loc = useLocation(), [q] = useSearchParams()
  const [f, setF] = useState({ name: '', email: '', password: '' })
  const [err, setErr] = useState(q.get('expired') ? 'Your session expired. Please sign in again.' : ''), [busy, setBusy] = useState(false)
  if (user) return <Navigate to="/dashboard" replace />
  const set = k => e => setF({ ...f, [k]: e.target.value })

  const submit = async e => {
    e.preventDefault(); setErr('')
    if (reg && !f.name.trim()) return setErr('Enter your name.')
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setErr('Enter a valid email address.')
    if (!f.password) return setErr('Enter your password.')
    if (reg && f.password.length < 8) return setErr('Password must be at least 8 characters.')
    setBusy(true)
    try { reg ? await register(f) : await login({ email: f.email, password: f.password }); nav(loc.state?.from?.pathname || '/dashboard', { replace: true }) }
    catch (x) { setErr(errMsg(x)); setBusy(false) }
  }

  return (
    <div className="auth">
      <aside className="auth-brand">
        <div className="brand"><span className="brand-mark"><Icon name="book" size={18} /></span><span className="brand-name">Smart Study Planner</span></div>
        <h2>Plan smarter. Focus longer. Track real progress.</h2>
        <ul>{POINTS.map(([i, t]) => <li key={t}><Icon name={i} size={18} />{t}</li>)}</ul>
      </aside>
      <main className="auth-panel">
        <form className="auth-card" onSubmit={submit} noValidate>
          <h1>{reg ? 'Create your account' : 'Welcome back'}</h1>
          <p className="muted">{reg ? 'Start planning your studies in minutes.' : 'Sign in to continue to your dashboard.'}</p>
          {err && <div className="alert error" role="alert"><Icon name="alert" size={18} /><span className="grow">{err}</span></div>}
          {reg && <label>Name<input value={f.name} onChange={set('name')} autoComplete="name" autoFocus /></label>}
          <label>Email<input type="email" value={f.email} onChange={set('email')} autoComplete="email" autoFocus={!reg} /></label>
          <label>Password<input type="password" value={f.password} onChange={set('password')} autoComplete={reg ? 'new-password' : 'current-password'} />{reg && <span className="small muted">At least 8 characters</span>}</label>
          <Button variant="primary" type="submit" className="block" loading={busy}>{reg ? 'Create account' : 'Sign in'}</Button>
          <p className="muted center-text">{reg ? <>Already registered? <Link to="/login">Sign in</Link></> : <>New here? <Link to="/register">Create an account</Link></>}</p>
        </form>
      </main>
    </div>
  )
}
