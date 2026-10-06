import { useState } from 'react'
import { errMsg } from '../api'
import { sessionsApi } from '../services'
import { parseDay, toInputValue } from '../lib/utils'
import { Button, Modal } from './ui'

function defaults(dayKey) {
  const s = dayKey ? parseDay(dayKey) : new Date()
  if (!dayKey || dayKey === toInputValue(new Date()).slice(0, 10)) { const n = new Date(); n.setMinutes(0, 0, 0); n.setHours(n.getHours() + 1); s.setTime(n.getTime()) }
  else s.setHours(9, 0, 0, 0)
  return [toInputValue(s), toInputValue(new Date(s.getTime() + 36e5))]
}

/** Create (default) or edit (pass `session`) a study session using the existing /study-sessions API. */
export default function SessionModal({ session, tasks, subjects, day, onClose, onSaved }) {
  const [d0, d1] = defaults(day)
  const [f, setF] = useState({
    taskId: session?.taskId || '', subjectId: session?.subjectId || '',
    startTime: session ? session.startTime.slice(0, 16) : d0, endTime: session ? session.endTime.slice(0, 16) : d1, status: session?.status || 'SCHEDULED',
  })
  const [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const pickTask = e => {
    const t = tasks.find(x => String(x.id) === e.target.value)
    setF({ ...f, taskId: e.target.value, subjectId: t?.subjectId && !f.subjectId ? t.subjectId : f.subjectId })
  }
  const submit = async ev => {
    ev.preventDefault()
    if (!f.startTime || !f.endTime) return setErr('Choose a start and end time.')
    if (new Date(f.endTime) <= new Date(f.startTime)) return setErr('End time must be after start time.')
    setBusy(true); setErr('')
    const body = { taskId: f.taskId || null, subjectId: f.subjectId || null, startTime: f.startTime, endTime: f.endTime, status: f.status }
    try { session ? await sessionsApi.save(session.id, body) : await sessionsApi.create(body); onSaved(session ? 'Session updated' : 'Session scheduled') }
    catch (x) { setErr(errMsg(x)); setBusy(false) }
  }
  const selectable = tasks.filter(t => t.status !== 'COMPLETED' || t.id === session?.taskId)
  return (
    <Modal title={session ? 'Edit study session' : 'Schedule study session'} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        {err && <div className="alert error" role="alert">{err}</div>}
        <label>Task (optional)<select value={f.taskId} onChange={pickTask}><option value="">No task</option>{selectable.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}</select></label>
        <label>Subject<select value={f.subjectId} onChange={set('subjectId')}><option value="">No subject</option>{subjects.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
        <div className="grid2">
          <label>Start<input type="datetime-local" value={f.startTime} onChange={set('startTime')} /></label>
          <label>End<input type="datetime-local" value={f.endTime} onChange={set('endTime')} /></label>
        </div>
        {session && <label>Status<select value={f.status} onChange={set('status')}><option value="SCHEDULED">Scheduled</option><option value="COMPLETED">Completed</option></select></label>}
        <div className="actions"><Button onClick={onClose}>Cancel</Button><Button variant="primary" type="submit" loading={busy}>{session ? 'Save changes' : 'Schedule session'}</Button></div>
      </form>
    </Modal>
  )
}
