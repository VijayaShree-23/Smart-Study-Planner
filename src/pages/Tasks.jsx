import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { errMsg } from '../api'
import { useData } from '../data'
import { useStartTask } from '../hooks'
import { tasksApi } from '../services'
import { mins, todayKey } from '../lib/utils'
import Icon from '../components/Icon'
import TaskDetailModal from '../components/TaskDetailModal'
import TaskModal from '../components/TaskModal'
import { useToast } from '../components/Toast'
import { Button, Card, ConfirmDialog, DueText, EmptyState, IconButton, PageHeader, PriorityBadge, StatusBadge, SubjectDot } from '../components/ui'

const TABS = ['All', 'Today', 'Upcoming', 'Overdue', 'Completed']
const PRI_RANK = { HIGH: 0, MEDIUM: 1, LOW: 2 }

const inTab = (t, tab, today) =>
  tab === 'All' || (tab === 'Today' && t.dueDate === today) || (tab === 'Upcoming' && !!t.dueDate && t.dueDate > today && t.status !== 'COMPLETED') ||
  (tab === 'Overdue' && t.overdue) || (tab === 'Completed' && t.status === 'COMPLETED')

export default function Tasks() {
  const { tasks, subjects, insights, refresh } = useData(), toast = useToast(), start = useStartTask()
  const [sp, setSp] = useSearchParams()
  const [q, setQ] = useState(sp.get('q') || ''), [tab, setTab] = useState(TABS.includes(sp.get('tab')) ? sp.get('tab') : 'All')
  const [sub, setSub] = useState(sp.get('subject') || ''), [pri, setPri] = useState(''), [st, setSt] = useState(''), [sort, setSort] = useState('smart')
  const [modal, setModal] = useState(null), [del, setDel] = useState(null), [detail, setDetail] = useState(null), [busy, setBusy] = useState(false)
  const today = todayKey()

  // React to deep links: header search (?q), notifications (?task), dashboard edit (?edit), overdue alert (?tab), subject cards (?subject)
  useEffect(() => {
    const n = new URLSearchParams(sp); let changed = false
    const take = k => { const v = n.get(k); if (v !== null) { n.delete(k); changed = true } return v }
    const qv = take('q'); if (qv !== null) setQ(qv)
    const tv = take('tab'); if (tv && TABS.includes(tv)) setTab(tv)
    const sv = take('subject'); if (sv !== null) setSub(sv)
    const dv = Number(take('task')); if (dv) setDetail(dv)
    const ev = Number(take('edit')); if (ev) { const t = tasks.find(x => x.id === ev); if (t) setModal(t) }
    if (changed) setSp(n, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp])

  const rank = useMemo(() => new Map(insights.recommendations.map(r => [r.task.id, r.rank])), [insights])
  const counts = useMemo(() => Object.fromEntries(TABS.map(t => [t, tasks.filter(x => inTab(x, t, today)).length])), [tasks, today])
  const filtersOn = q || sub || pri || st || sort !== 'smart' || tab !== 'All'

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return tasks
      .filter(t => (!needle || t.title.toLowerCase().includes(needle) || (t.subjectName || '').toLowerCase().includes(needle)) &&
        (!sub || String(t.subjectId) === sub) && (!pri || t.priority === pri) && (!st || t.status === st) && inTab(t, tab, today))
      .sort((a, b) => {
        if (sort === 'due') return (a.dueDate || '9999').localeCompare(b.dueDate || '9999') || a.title.localeCompare(b.title)
        if (sort === 'priority') return PRI_RANK[a.priority] - PRI_RANK[b.priority] || (a.dueDate || '9999').localeCompare(b.dueDate || '9999')
        if (sort === 'title') return a.title.localeCompare(b.title)
        return (rank.get(a.id) || 9999) - (rank.get(b.id) || 9999) // Smart Plan order, completed tasks last
      })
  }, [tasks, q, tab, sub, pri, st, sort, today, rank])

  const clear = () => { setQ(''); setTab('All'); setSub(''); setPri(''); setSt(''); setSort('smart') }
  const toggle = async t => {
    try { await tasksApi.patch(t, { status: t.status === 'COMPLETED' ? 'TODO' : 'COMPLETED' }); toast.success(t.status === 'COMPLETED' ? 'Task reopened' : 'Task completed'); await refresh() }
    catch (x) { toast.error(errMsg(x)) }
  }
  const remove = async () => {
    setBusy(true)
    try { await tasksApi.remove(del.id); toast.success('Task deleted'); await refresh() } catch (x) { toast.error(errMsg(x)) }
    setBusy(false); setDel(null)
  }
  const saved = m => { setModal(null); toast.success(m); refresh() }

  return (
    <>
      <PageHeader title="Tasks" subtitle={`${tasks.length} total · ${counts.Overdue} overdue · ${counts.Completed} completed`} actions={<Button variant="primary" icon="plus" onClick={() => setModal({})}>Add task</Button>} />

      <div className="tabs" role="tablist" aria-label="Task views">
        {TABS.map(t => <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}<span className="tab-count">{counts[t]}</span></button>)}
      </div>

      <div className="filters">
        <label className="search-field"><span className="sr-only">Search tasks</span><Icon name="search" size={17} /><input type="search" placeholder="Search tasks or subjects" value={q} onChange={e => setQ(e.target.value)} /></label>
        <label><span className="sr-only">Subject</span><select value={sub} onChange={e => setSub(e.target.value)}><option value="">All subjects</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        <label><span className="sr-only">Priority</span><select value={pri} onChange={e => setPri(e.target.value)}><option value="">Any priority</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option></select></label>
        <label><span className="sr-only">Status</span><select value={st} onChange={e => setSt(e.target.value)}><option value="">Any status</option><option value="TODO">To do</option><option value="IN_PROGRESS">In progress</option><option value="COMPLETED">Completed</option></select></label>
        <label><span className="sr-only">Sort by</span><select value={sort} onChange={e => setSort(e.target.value)}><option value="smart">Sort: Smart Plan</option><option value="due">Sort: Deadline</option><option value="priority">Sort: Priority</option><option value="title">Sort: Title</option></select></label>
        {filtersOn && <Button variant="ghost" size="sm" icon="x" onClick={clear}>Clear</Button>}
      </div>

      {shown.length === 0 ? (
        <Card>
          {tasks.length === 0
            ? <EmptyState icon="tasks" title="No tasks found" text="Create your first study task to start planning your day." action={<Button variant="primary" icon="plus" onClick={() => setModal({})}>Add task</Button>} />
            : <EmptyState icon="search" title="No matching tasks" text="Try changing or clearing your filters." action={<Button onClick={clear}>Clear filters</Button>} />}
        </Card>
      ) : (
        <div className="card t-table" role="list">
          <div className="t-row t-head" aria-hidden="true"><span /><span>Task</span><span>Due</span><span>Priority</span><span>Status</span><span /></div>
          {shown.map(t => {
            const done = t.status === 'COMPLETED'
            return (
              <div className={'t-row' + (!done && t.overdue ? ' overdue' : '') + (done ? ' done' : '')} key={t.id} role="listitem">
                <input className="t-chk" type="checkbox" aria-label={done ? `Reopen ${t.title}` : `Mark ${t.title} complete`} checked={done} onChange={() => toggle(t)} />
                <div className="t-main">
                  <button className="t-title" onClick={() => setDetail(t.id)}>{t.title}</button>
                  <div className="small muted t-sub">
                    <span className="inline"><SubjectDot color={t.subjectColor} />{t.subjectName || 'No subject'}</span>
                    {t.estimatedMinutes ? <span>{mins(t.estimatedMinutes)} est.</span> : null}
                    {!done && rank.get(t.id) && <span>Smart Plan #{rank.get(t.id)}</span>}
                  </div>
                </div>
                <div className="t-meta"><span className="t-due"><DueText task={t} /></span><span className="t-pri"><PriorityBadge priority={t.priority} /></span><span className="t-status"><StatusBadge status={t.status} /></span></div>
                <div className="t-act">
                  {!done && <IconButton icon="play" label={`Start focus on ${t.title}`} onClick={() => start(t)} />}
                  <IconButton icon="edit" label={`Edit ${t.title}`} onClick={() => setModal(t)} />
                  <IconButton icon="trash" label={`Delete ${t.title}`} danger onClick={() => setDel(t)} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal && <TaskModal task={modal.id ? modal : null} subjects={subjects} onClose={() => setModal(null)} onSaved={saved} />}
      {detail && <TaskDetailModal taskId={detail} onClose={() => setDetail(null)} onEdit={setModal} />}
      {del && <ConfirmDialog title="Delete task?" text={`"${del.title}" will be permanently removed.`} busy={busy} onConfirm={remove} onCancel={() => setDel(null)} />}
    </>
  )
}
