import { useState } from 'react'
import { errMsg } from '../api'
import { useData } from '../data'
import { subjectsApi } from '../services'
import { mins } from '../lib/utils'
import { Ring } from '../components/charts'
import SubjectModal from '../components/SubjectModal'
import { useToast } from '../components/Toast'
import { Button, Card, ConfirmDialog, EmptyState, PageHeader, ProgressBar } from '../components/ui'

export default function Subjects() {
  const { insights, refresh } = useData(), toast = useToast()
  const [modal, setModal] = useState(null), [del, setDel] = useState(null), [busy, setBusy] = useState(false)
  const list = insights.subjects

  const remove = async () => {
    setBusy(true)
    try { await subjectsApi.remove(del.id); toast.success('Subject deleted'); await refresh() } catch (e) { toast.error(errMsg(e)) }
    setBusy(false); setDel(null)
  }

  return (
    <>
      <PageHeader title="Subjects" subtitle="Track progress, workload, and study time for each course." actions={<Button variant="primary" icon="plus" onClick={() => setModal({})}>Add subject</Button>} />
      {list.length === 0 ? (
        <Card><EmptyState icon="book" title="No subjects yet" text="Add the courses you're studying to organise your tasks and track progress." action={<Button variant="primary" icon="plus" onClick={() => setModal({})}>Add subject</Button>} /></Card>
      ) : (
        <div className="subject-grid">
          {list.map(s => (
            <article className="card subject" key={s.id} style={{ '--subject': s.color || 'var(--accent)' }}>
              <div className="subject-top">
                <div className="grow"><h3>{s.name}</h3><p className="muted small clamp">{s.description || 'No description'}</p></div>
                <Ring value={s.progress / 100} size={64} stroke={7} color={s.color}><span className="ring-pct">{s.progress}%</span></Ring>
              </div>
              <ProgressBar value={s.progress} color={s.color} label={`${s.name} progress`} />
              <dl className="subject-stats">
                <div><dt>Tasks</dt><dd>{s.taskCount}</dd></div>
                <div><dt>Completed</dt><dd>{s.completedCount}</dd></div>
                <div><dt>Upcoming</dt><dd>{s.upcomingCount}</dd></div>
                <div><dt>Study time</dt><dd>{mins(s.studyMinutes)}</dd></div>
              </dl>
              {s.overdueCount > 0 && <p className="small due-bad">{s.overdueCount} overdue {s.overdueCount === 1 ? 'task' : 'tasks'}</p>}
              <div className="btn-row">
                <Button size="sm" to={`/tasks?subject=${s.id}`}>View tasks</Button>
                <Button size="sm" icon="edit" onClick={() => setModal(s)}>Edit</Button>
                <Button size="sm" variant="ghost-danger" icon="trash" onClick={() => setDel(s)}>Delete</Button>
              </div>
            </article>
          ))}
        </div>
      )}
      {modal && <SubjectModal subject={modal.id ? modal : null} onClose={() => setModal(null)} onSaved={m => { setModal(null); toast.success(m); refresh() }} />}
      {del && <ConfirmDialog title="Delete subject?" text={`"${del.name}" will be removed. Its tasks are kept but will have no subject.`} busy={busy} onConfirm={remove} onCancel={() => setDel(null)} />}
    </>
  )
}
