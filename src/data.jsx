// One shared store for everything the backend knows about the current user.
// Pages read from here; after any mutation they call refresh() so every widget
// (dashboard, notifications, Smart Plan, analytics...) stays consistent.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { errMsg } from './api'
import { reportsApi, sessionsApi, subjectsApi, tasksApi } from './services'
import { deriveInsights } from './lib/insights'

const Ctx = createContext(null)
export const useData = () => useContext(Ctx)
const EMPTY = { tasks: [], subjects: [], sessions: [], progress: null, dashboard: null }

export function DataProvider({ children }) {
  const [data, setData] = useState(EMPTY)
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [error, setError] = useState('')

  const fetchAll = useCallback(async () => {
    const [tasks, subjects, sessions, progress, dashboard] = await Promise.all([
      tasksApi.list(), subjectsApi.list(), sessionsApi.list(), reportsApi.progress(), reportsApi.dashboard(),
    ])
    setData({ tasks, subjects, sessions, progress, dashboard })
  }, [])

  /** Full load with spinner (first load / retry). */
  const load = useCallback(async () => {
    setStatus('loading'); setError('')
    try { await fetchAll(); setStatus('ready') } catch (e) { setError(errMsg(e)); setStatus('error') }
  }, [fetchAll])

  /** Silent reload after a mutation. Returns an error message or undefined. */
  const refresh = useCallback(async () => {
    try { await fetchAll(); setStatus('ready') } catch (e) { return errMsg(e) }
  }, [fetchAll])

  useEffect(() => { load() }, [load])
  const insights = useMemo(() => deriveInsights(data), [data])
  const value = useMemo(() => ({ ...data, insights, status, error, load, refresh }), [data, insights, status, error, load, refresh])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
