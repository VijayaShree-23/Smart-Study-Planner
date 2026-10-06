import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { errMsg } from './api'
import { useData } from './data'
import { useToast } from './components/Toast'
import { tasksApi } from './services'

/** Calls onClose when the user clicks outside `ref` or presses Escape (menus, popovers). */
export function useDismiss(ref, onClose, active = true) {
  useEffect(() => {
    if (!active) return
    const down = e => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    const key = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', down); document.addEventListener('keydown', key)
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key) }
  }, [ref, onClose, active])
}

/* ---- shared actions ---- */

/** "Start task": moves a TODO task to IN_PROGRESS (existing PUT /tasks/{id}) then opens Focus Mode on it. */
export function useStartTask() {
  const nav = useNavigate(), toast = useToast(), { refresh } = useData()
  return useCallback(async task => {
    try {
      if (task.status === 'TODO') { await tasksApi.patch(task, { status: 'IN_PROGRESS' }); await refresh() }
      nav(`/focus?task=${task.id}`)
    } catch (e) { toast.error(errMsg(e)) }
  }, [nav, toast, refresh])
}
