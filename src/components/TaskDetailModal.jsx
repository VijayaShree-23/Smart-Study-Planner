import { errMsg } from '../api'
import { useData } from '../data'
import { useStartTask } from '../hooks'
import { tasksApi } from '../services'
import { mins } from '../lib/utils'
import { Badge, Button, DueText, Modal, PriorityBadge, StatusBadge, SubjectDot } from './ui'
import { useToast } from './Toast'

/** Read-only task overview with quick actions. Looks the task up by id so it is always fresh. */
export default function TaskDetailModal({ taskId, onClose, onEdit }) {
  const { tasks, sessions, insights, refresh } = useData(), toast = useToast(), start = useStartTask()
  const task = tasks.find(t => t.id === taskId)
  if (!task) return null
  const studied = sessions.filter(s => s.taskId === task.id && s.status === 'COMPLETED').reduce((a, s) => a + (s.duration || 0), 0)
  const rec = insights.recommendations.find(r => r.task.id === task.id)
  const done = task.status === 'COMPLETED'

  const toggle = async () => {
    try { await tasksApi.patch(task, { status: done ? 'TODO' : 'COMPLETED' }); toast.success(done ? 'Task reopened' : 'Task marked complete'); await refresh() }
    catch (e) { toast.error(errMsg(e)) }
  }
  const row = (k, v) => <div className="kv"><dt>{k}</dt><dd>{v}</dd></div>

  return (
    <Modal title={task.title} onClose={onClose}>
      <div className="badge-row"><StatusBadge status={task.status} /><PriorityBadge priority={task.priority} />{task.needsAttention && <Badge tone="danger" icon="alert">Needs attention</Badge>}</div>
      {task.description && <p className="detail-desc">{task.description}</p>}
      <dl className="kv-grid">
        {row('Subject', task.subjectName ? <span className="inline"><SubjectDot color={task.subjectColor} />{task.subjectName}</span> : '—')}
        {row('Due', <DueText task={task} />)}
        {row('Estimated effort', task.estimatedMinutes ? mins(task.estimatedMinutes) : '—')}
        {row('Studied so far', studied ? mins(studied) : 'No sessions yet')}
        {rec && row('Smart Plan', `#${rec.rank} of ${insights.recommendations.length} · ${rec.score}/100`)}
      </dl>
      {rec && <p className="small muted">Why: {rec.reasons.join(' · ')}</p>}
      <div className="actions spread">
        <Button onClick={() => { onClose(); onEdit(task) }} icon="edit">Edit</Button>
        <Button onClick={toggle} icon="check">{done ? 'Reopen' : 'Mark complete'}</Button>
        {!done && <Button variant="primary" icon="timer" onClick={() => { onClose(); start(task) }}>Start focus session</Button>}
      </div>
    </Modal>
  )
}
