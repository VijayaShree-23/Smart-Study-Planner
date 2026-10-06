import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { errMsg } from '../api'
import { useData } from '../data'
import { sessionsApi } from '../services'
import { addDays, dateKey, dayOf, fmtShortDate, fmtTime, mins, parseDay, plural, todayKey } from '../lib/utils'
import Icon from '../components/Icon'
import SessionModal from '../components/SessionModal'
import TaskDetailModal from '../components/TaskDetailModal'
import { useToast } from '../components/Toast'
import { Badge, Button, Card, ConfirmDialog, DueText, EmptyState, IconButton, PageHeader, PriorityBadge, SubjectDot } from '../components/ui'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/

/** 6 weeks x 7 days starting on Monday. */
function monthGrid(cursor) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  const start = addDays(first, -((first.getDay() + 6) % 7))
  return Array.from({ length: 42 }, (_, i) => { const d = addDays(start, i); return { key: dateKey(d), day: d.getDate(), inMonth: d.getMonth() === cursor.getMonth() } })
}

export default function Schedule() {
  const { sessions, tasks, subjects, refresh } = useData(), toast = useToast(), nav = useNavigate()
  const [sp, setSp] = useSearchParams()
  const today = todayKey()
  const startDay = DAY_RE.test(sp.get('date') || '') ? sp.get('date') : today
  const [selected, setSelected] = useState(startDay)
  const [cursor, setCursor] = useState(() => { const d = parseDay(startDay); return new Date(d.getFullYear(), d.getMonth(), 1) })
  const [modal, setModal] = useState(null), [del, setDel] = useState(null), [viewId, setViewId] = useState(null), [busy, setBusy] = useState(false)

  const goTo = key => { setSelected(key); const d = parseDay(key); setCursor(new Date(d.getFullYear(), d.getMonth(), 1)) }
  useEffect(() => { const d = sp.get('date'); if (d && DAY_RE.test(d)) { goTo(d); const n = new URLSearchParams(sp); n.delete('date'); setSp(n, { replace: true }) } }, [sp]) // eslint-disable-line react-hooks/exhaustive-deps
  const shift = n => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1))

  const byDay = useMemo(() => {
    const m = new Map(), get = k => { if (!m.has(k)) m.set(k, { sessions: [], due: [] }); return m.get(k) }
    sessions.forEach(s => get(dayOf(s.startTime)).sessions.push(s))
    tasks.filter(t => t.dueDate && t.status !== 'COMPLETED').forEach(t => get(t.dueDate).due.push(t))
    return m
  }, [sessions, tasks])
  const cells = useMemo(() => monthGrid(cursor), [cursor])
  const sel = byDay.get(selected) || { sessions: [], due: [] }
  const daySessions = [...sel.sessions].sort((a, b) => a.startTime.localeCompare(b.startTime))

  const upcomingSessions = sessions.filter(s => s.status !== 'COMPLETED' && new Date(s.startTime) >= new Date()).slice(0, 4)
  const upcomingDue = tasks.filter(t => t.status !== 'COMPLETED' && t.dueDate && t.dueDate >= today).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4)

  const complete = async s => { try { await sessionsApi.patch(s, { status: 'COMPLETED' }); toast.success('Session marked completed'); await refresh() } catch (e) { toast.error(errMsg(e)) } }
  const remove = async () => {
    setBusy(true)
    try { await sessionsApi.remove(del.id); toast.success('Session deleted'); await refresh() } catch (e) { toast.error(errMsg(e)) }
    setBusy(false); setDel(null)
  }
  const saved = m => { setModal(null); toast.success(m); refresh() }

  const cellLabel = (c, d) => `${parseDay(c.key).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}${d ? `, ${d.sessions.length ? plural(d.sessions.length, 'session') : ''}${d.sessions.length && d.due.length ? ', ' : ''}${d.due.length ? plural(d.due.length, 'deadline') : ''}` : ', nothing scheduled'}`

  return (
    <>
      <PageHeader title="Schedule" subtitle="Study sessions and deadlines in one calendar." actions={<Button variant="primary" icon="plus" onClick={() => setModal({ day: selected })}>Schedule session</Button>} />
      <div className="grid-cal">
        <section className="card cal" aria-label="Calendar">
          <div className="cal-head">
            <h2>{cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2>
            <div className="cal-nav">
              <Button size="sm" onClick={() => goTo(today)}>Today</Button>
              <IconButton icon="left" label="Previous month" onClick={() => shift(-1)} /><IconButton icon="right" label="Next month" onClick={() => shift(1)} />
            </div>
          </div>
          <div className="cal-grid" role="group" aria-label="Days of the month">
            {WEEKDAYS.map(w => <div className="cal-dow" key={w}>{w}</div>)}
            {cells.map(c => {
              const d = byDay.get(c.key), sc = d ? d.sessions.filter(s => s.status !== 'COMPLETED').length : 0, dc = d ? d.sessions.length - sc : 0, due = d ? d.due.length : 0
              return (
                <button key={c.key} aria-label={cellLabel(c, d)} aria-pressed={c.key === selected} onClick={() => setSelected(c.key)}
                  className={'cal-cell' + (c.inMonth ? '' : ' out') + (c.key === today ? ' today' : '') + (c.key === selected ? ' sel' : '')}>
                  <span className="cal-num">{c.day}</span>
                  <span className="cal-marks">
                    {sc > 0 && <span className="pill s"><span className="t">{sc} {sc === 1 ? 'session' : 'sessions'}</span></span>}
                    {dc > 0 && <span className="pill c"><span className="t">{dc} done</span></span>}
                    {due > 0 && <span className={'pill d' + (c.key < today ? ' late' : '')}><span className="t">{due} due</span></span>}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="cal-legend small muted"><span><i className="pill-dot s" />Scheduled session</span><span><i className="pill-dot c" />Completed session</span><span><i className="pill-dot d" />Task deadline</span></div>
        </section>

        <div className="stack">
          <Card title={parseDay(selected).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })} subtitle={selected === today ? 'Today' : undefined}
            action={<Button size="sm" icon="plus" onClick={() => setModal({ day: selected })}>Add</Button>}>
            {daySessions.length === 0 && sel.due.length === 0 ? (
              <EmptyState icon="calendar" title="Nothing scheduled" text="Block out time to work on your tasks." action={<Button onClick={() => setModal({ day: selected })}>Schedule session</Button>} />
            ) : (
              <>
                {daySessions.length > 0 && <h3 className="agenda-h">Study sessions</h3>}
                <ul className="agenda">{daySessions.map(s => (
                  <li key={s.id} className={s.status === 'COMPLETED' ? 'done' : ''}>
                    <SubjectDot color={s.subjectColor} />
                    <div className="grow">
                      <b>{s.taskTitle || s.subjectName || 'Study session'}</b>
                      <span className="small muted block">{fmtTime(s.startTime)} – {fmtTime(s.endTime)} · {mins(s.duration)}{s.subjectName && s.taskTitle ? ` · ${s.subjectName}` : ''}</span>
                    </div>
                    {s.status === 'COMPLETED' ? <Badge tone="success" icon="check">Done</Badge> : <IconButton icon="check" label="Mark completed" onClick={() => complete(s)} />}
                    <IconButton icon="edit" label="Edit session" onClick={() => setModal({ session: s })} />
                    <IconButton icon="trash" label="Delete session" danger onClick={() => setDel(s)} />
                  </li>
                ))}</ul>
                {sel.due.length > 0 && <h3 className="agenda-h">Deadlines</h3>}
                <ul className="agenda">{sel.due.map(t => (
                  <li key={t.id}>
                    <Icon name="flag" size={16} />
                    <button className="agenda-link grow" onClick={() => setViewId(t.id)}><b>{t.title}</b><span className="small muted block">{t.subjectName || 'No subject'}</span></button>
                    <PriorityBadge priority={t.priority} />
                  </li>
                ))}</ul>
              </>
            )}
          </Card>

          <Card title="Coming up" pad={false}>
            {upcomingSessions.length === 0 && upcomingDue.length === 0 ? <p className="muted pad small">No upcoming sessions or deadlines.</p> : (
              <ul className="agenda tight">
                {upcomingSessions.map(s => (
                  <li key={'s' + s.id}><Icon name="clock" size={16} /><button className="agenda-link grow" onClick={() => goTo(dayOf(s.startTime))}><b>{s.taskTitle || s.subjectName || 'Study session'}</b><span className="small muted block">{fmtShortDate(s.startTime)} · {fmtTime(s.startTime)}</span></button></li>
                ))}
                {upcomingDue.map(t => (
                  <li key={'t' + t.id}><Icon name="flag" size={16} /><button className="agenda-link grow" onClick={() => goTo(t.dueDate)}><b>{t.title}</b><span className="small muted block"><DueText task={t} /></span></button></li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {modal && <SessionModal session={modal.session} day={modal.day} tasks={tasks} subjects={subjects} onClose={() => setModal(null)} onSaved={saved} />}
      {viewId && <TaskDetailModal taskId={viewId} onClose={() => setViewId(null)} onEdit={t => nav(`/tasks?edit=${t.id}`)} />}
      {del && <ConfirmDialog title="Delete session?" text="This study session will be removed." busy={busy} onConfirm={remove} onCancel={() => setDel(null)} />}
    </>
  )
}
