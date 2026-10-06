import { useState } from 'react'
import { errMsg } from '../api'
import { tasksApi } from '../services'
import { Button, Modal } from './ui'

export default function TaskModal({ task, subjects, onClose, onSaved }) {
  const [f, setF] = useState({
    title: task?.title || '', description: task?.description || '', subjectId: task?.subjectId || '', priority: task?.priority || 'MEDIUM',
    dueDate: task?.dueDate || '', estimatedMinutes: task?.estimatedMinutes || '', status: task?.status || 'TODO',
  })
  const [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  const set = k => e => setF({ ...f, [k]: e.target.value })

  const submit = async e => {
    e.preventDefault()
    if (!f.title.trim()) return setErr('Task title is required.')
    setBusy(true); setErr('')
    const body = { ...f, subjectId: f.subjectId || null, dueDate: f.dueDate || null, estimatedMinutes: f.estimatedMinutes ? Number(f.estimatedMinutes) : null }
    try {
      task ? await tasksApi.save(task.id, body) : await tasksApi.create(body)
      onSaved(task ? 'Task updated' : 'Task created')
    } catch (x) { setErr(errMsg(x)); setBusy(false) }
  }

  return (
    <Modal title={task ? 'Edit task' : 'Add task'} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        {err && <div className="alert error" role="alert">{err}</div>}
        <label>Task title<input value={f.title} onChange={set('title')} maxLength={200} autoFocus placeholder="e.g. Solve DSA practice set" /></label>
        <label>Description<textarea rows="3" value={f.description} onChange={set('description')} maxLength={1000} /></label>
        <div className="grid2">
          <label>Subject<select value={f.subjectId} onChange={set('subjectId')}><option value="">No subject</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
          <label>Priority<select value={f.priority} onChange={set('priority')}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></label>
          <label>Due date<input type="date" value={f.dueDate} onChange={set('dueDate')} /></label>
          <label>Estimated time (min)<input type="number" min="1" value={f.estimatedMinutes} onChange={set('estimatedMinutes')} /></label>
        </div>
        <label>Status<select value={f.status} onChange={set('status')}><option value="TODO">To do</option><option value="IN_PROGRESS">In progress</option><option value="COMPLETED">Completed</option></select></label>
        <div className="actions"><Button onClick={onClose}>Cancel</Button><Button variant="primary" type="submit" loading={busy}>{task ? 'Save changes' : 'Create task'}</Button></div>
      </form>
    </Modal>
  )
}
