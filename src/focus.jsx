// Focus Mode state lives here (above the router outlet) so a running timer keeps
// counting while the user navigates, survives a page refresh, and is shown in the header.
//
// Finished sessions are saved with the EXISTING POST /api/study-sessions endpoint
// (status COMPLETED, start = end - focused minutes), so the backend computes `duration`
// and /progress, /dashboard, analytics and streaks update automatically.
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { errMsg } from './api'
import { useAuth } from './auth'
import { useData } from './data'
import { useToast } from './components/Toast'
import { sessionsApi } from './services'
import { clock, mins, toLocalISO } from './lib/utils'

const Ctx = createContext(null)
export const useFocus = () => useContext(Ctx)
export const PRESETS = [25, 50, 90]
export const MAX_MINUTES = 240

const idle = (minutes = 25, link = {}) => ({
  phase: 'idle', // idle | running | paused | done
  minutes, totalMs: minutes * 60000, remainingMs: minutes * 60000, endAt: null,
  taskId: link.taskId ?? null, subjectId: link.subjectId ?? null,
  result: null, // { status: 'saving' | 'ok' | 'error', minutes, endedAt, message }
})

function restore(key) {
  try {
    const s = JSON.parse(localStorage.getItem(key) || 'null')
    if (s && (s.phase === 'running' || s.phase === 'paused') && s.totalMs > 0) return { ...idle(s.minutes), ...s, result: null }
  } catch { /* ignore corrupt storage */ }
  return idle()
}

export function FocusProvider({ children }) {
  const { user } = useAuth(), { refresh } = useData(), toast = useToast()
  const key = `ssp.focus.${user.id}`
  const [s, setS] = useState(() => restore(key))
  const [, setTick] = useState(0)
  const ref = useRef(s)
  ref.current = s

  const remainingMs = s.phase === 'running' ? Math.max(0, s.endAt - Date.now()) : s.remainingMs

  /* ---- saving ---- */
  const persist = useCallback(async (minutes, endedAt) => {
    const cur = ref.current, startedAt = endedAt - minutes * 60000
    setS(p => ({ ...p, phase: 'done', result: { status: 'saving', minutes, endedAt } }))
    try {
      await sessionsApi.create({
        taskId: cur.taskId, subjectId: cur.subjectId,
        startTime: toLocalISO(new Date(startedAt)), endTime: toLocalISO(new Date(endedAt)), status: 'COMPLETED',
      })
      setS(p => ({ ...p, result: { status: 'ok', minutes, endedAt } }))
      toast.success(`Focus session saved · ${mins(minutes)}`)
      const err = await refresh()
      if (err) toast.error('Session saved, but the dashboard could not refresh. Reload the page.')
    } catch (e) {
      setS(p => ({ ...p, result: { status: 'error', minutes, endedAt, message: errMsg(e) } }))
      toast.error('Could not save the focus session.')
    }
  }, [refresh, toast])

  /** Marks the run finished synchronously so the interval can never fire twice. */
  const finish = useCallback((focusedMs, endedAt) => {
    ref.current = { ...ref.current, phase: 'done' }
    return persist(Math.max(1, Math.floor(focusedMs / 60000)), endedAt)
  }, [persist])

  /* ---- ticking ---- */
  useEffect(() => {
    if (s.phase !== 'running') return undefined
    const id = setInterval(() => {
      const cur = ref.current
      if (cur.phase !== 'running') return
      if (Date.now() >= cur.endAt) finish(cur.totalMs, cur.endAt)
      else setTick(t => t + 1)
    }, 250)
    return () => clearInterval(id)
  }, [s.phase, finish])

  /* ---- persistence across refresh + tab title ---- */
  useEffect(() => {
    if (s.phase === 'running' || s.phase === 'paused') localStorage.setItem(key, JSON.stringify({ phase: s.phase, minutes: s.minutes, totalMs: s.totalMs, remainingMs: s.remainingMs, endAt: s.endAt, taskId: s.taskId, subjectId: s.subjectId }))
    else localStorage.removeItem(key)
  }, [key, s.phase, s.minutes, s.totalMs, s.remainingMs, s.endAt, s.taskId, s.subjectId])

  const title = s.phase === 'running' || s.phase === 'paused' ? `${clock(remainingMs)} · Focus` : null
  useEffect(() => {
    if (!title) return undefined
    const prev = document.title
    document.title = title + ' · Smart Study Planner'
    return () => { document.title = prev }
  }, [title])

  /* ---- actions ---- */
  const actions = {
    choose: minutes => setS(p => (p.phase === 'running' || p.phase === 'paused' ? p : idle(minutes, p))),
    link: (taskId, subjectId) => setS(p => (p.phase === 'running' || p.phase === 'paused' ? p : { ...p, taskId, subjectId })),
    start: () => setS(p => {
      if (p.phase === 'idle') return { ...p, phase: 'running', endAt: Date.now() + p.totalMs, remainingMs: p.totalMs }
      if (p.phase === 'paused') return { ...p, phase: 'running', endAt: Date.now() + p.remainingMs }
      return p
    }),
    pause: () => setS(p => (p.phase === 'running' ? { ...p, phase: 'paused', remainingMs: Math.max(0, p.endAt - Date.now()), endAt: null } : p)),
    reset: () => setS(p => idle(p.minutes, p)),
    /** Stop now and save the time actually focused (needs at least 1 full minute). */
    endEarly: () => {
      const p = ref.current
      if (p.phase !== 'running' && p.phase !== 'paused') return
      const left = p.phase === 'running' ? Math.max(0, p.endAt - Date.now()) : p.remainingMs
      const focused = p.totalMs - left
      if (focused < 60000) { toast.error('Focus for at least 1 minute before saving a session.'); return }
      finish(focused, Date.now())
    },
    retrySave: () => { const r = ref.current.result; if (r && r.status === 'error') persist(r.minutes, r.endedAt) },
  }

  const active = s.phase === 'running' || s.phase === 'paused'
  return <Ctx.Provider value={{ ...s, remainingMs, active, ...actions }}>{children}</Ctx.Provider>
}
