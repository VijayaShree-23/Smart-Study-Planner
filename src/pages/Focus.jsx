import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { errMsg } from '../api'
import { useData } from '../data'
import { MAX_MINUTES, PRESETS, useFocus } from '../focus'
import { tasksApi } from '../services'
import { clock, dayOf, fmtShortDate, fmtTime, mins, plural, todayKey } from '../lib/utils'
import { Ring } from '../components/charts'
import Icon from '../components/Icon'
import { useToast } from '../components/Toast'
import { Badge, Button, Card, ConfirmDialog, EmptyState, PageHeader, SubjectDot } from '../components/ui'

const PHASE_TEXT = { idle: 'Ready to focus', running: 'Stay focused', paused: 'Paused', done: 'Session complete' }

export default function Focus() {
  const f = useFocus(), toast = useToast()
  const { tasks, subjects, sessions, insights, refresh } = useData()
  const [sp, setSp] = useSearchParams()
  const [custom, setCustom] = useState(''), [customErr, setCustomErr] = useState(''), [confirm, setConfirm] = useState(false)

  // Deep link from Smart Plan / Dashboard / Tasks: /focus?task=ID preselects the task (only while idle).
  const taskParam = Number(sp.get('task')) || null
  useEffect(() => {
    if (!taskParam) return
    const t = tasks.find(x => x.id === taskParam)
    if (t && f.phase === 'idle') f.link(t.id, t.subjectId)
    setSp({}, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskParam])

  const openTasks = tasks.filter(t => t.status !== 'COMPLETED')
  const task = tasks.find(t => t.id === f.taskId), subject = subjects.find(s => s.id === (task ? task.subjectId : f.subjectId))
  const elapsedMs = f.totalMs - f.remainingMs, canSave = f.active && elapsedMs >= 60000
  const locked = f.active || f.phase === 'done'

  const pickTask = e => { const t = tasks.find(x => String(x.id) === e.target.value); f.link(t ? t.id : null, t ? t.subjectId : null) }
  const pickSubject = e => f.link(null, e.target.value ? Number(e.target.value) : null)
  const applyCustom = e => {
    e.preventDefault()
    const n = Number(custom)
    if (!Number.isInteger(n) || n < 1 || n > MAX_MINUTES) return setCustomErr(`Enter a whole number from 1 to ${MAX_MINUTES}.`)
    setCustomErr(''); f.choose(n); setCustom('')
  }
  const askReset = () => (f.active && elapsedMs >= 60000 ? setConfirm(true) : f.reset())
  const completeTask = async () => {
    try { await tasksApi.patch(task, { status: 'COMPLETED' }); toast.success('Task marked complete'); await refresh() } catch (e) { toast.error(errMsg(e)) }
  }

  const today = todayKey()
  const doneToday = sessions.filter(s => s.status === 'COMPLETED' && dayOf(s.startTime) === today)
  const recent = sessions.filter(s => s.status === 'COMPLETED').sort((a, b) => b.endTime.localeCompare(a.endTime)).slice(0, 5)
  const r = f.result

  return (
    <>
      <PageHeader title="Focus Mode" subtitle="Pick a duration, link a task, and stay on one thing. Finished sessions are saved to your study log." />
      <div className="grid-focus">
        <section className="card timer-card" aria-label="Focus timer">
          <div className="timer-label">FOCUS SESSION</div>
          <Ring value={f.phase === 'done' ? 1 : 1 - f.remainingMs / f.totalMs} color={f.phase === 'done' ? 'var(--success)' : 'var(--accent)'}>
            <div className="timer-clock" role="timer" aria-live="off">{f.phase === 'done' ? '00:00' : clock(f.remainingMs)}</div>
            <div className="timer-phase">{PHASE_TEXT[f.phase]}</div>
          </Ring>

          {f.phase !== 'done' && (
            <>
              <div className="seg" role="radiogroup" aria-label="Session length">
                {PRESETS.map(m => <button key={m} role="radio" aria-checked={f.minutes === m} className={f.minutes === m ? 'on' : ''} disabled={f.active} onClick={() => f.choose(m)}>{m} min</button>)}
                {!PRESETS.includes(f.minutes) && <button role="radio" aria-checked="true" className="on" disabled>{f.minutes} min</button>}
              </div>
              {!f.active && (
                <form className="custom-row" onSubmit={applyCustom}>
                  <label className="sr-only" htmlFor="custom-min">Custom minutes</label>
                  <input id="custom-min" type="number" inputMode="numeric" min="1" max={MAX_MINUTES} placeholder="Custom minutes" value={custom} onChange={e => setCustom(e.target.value)} />
                  <Button type="submit" size="sm">Set</Button>
                </form>
              )}
              {customErr && <p className="field-error" role="alert">{customErr}</p>}

              <div className="btn-row center">
                {f.phase === 'running'
                  ? <Button variant="primary" icon="pause" onClick={f.pause}>Pause</Button>
                  : <Button variant="primary" icon="play" onClick={f.start}>{f.phase === 'paused' ? 'Resume' : 'Start'}</Button>}
                <Button icon="reset" onClick={askReset} disabled={f.phase === 'idle'}>Reset</Button>
                {f.active && <Button icon="check" onClick={f.endEarly} disabled={!canSave} title={canSave ? 'Stop now and save the time focused' : 'Focus for at least 1 minute to save'}>Finish &amp; save</Button>}
              </div>

              <div className="link-fields">
                <label>Task<select value={f.taskId ?? ''} onChange={pickTask} disabled={locked}><option value="">No task</option>{openTasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}</select></label>
                <label>Subject<select value={subject ? subject.id : ''} onChange={pickSubject} disabled={locked || !!task}><option value="">No subject</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
              </div>
              {f.active && <p className="muted small center-text">Locked while the timer is running. Navigating away won't stop it.</p>}
            </>
          )}

          {f.phase === 'done' && r && (
            <div className="done-box" role="status">
              {r.status === 'saving' && <p><b>Saving your session…</b></p>}
              {r.status === 'ok' && (
                <>
                  <div className="done-icon"><Icon name="check" size={28} /></div>
                  <h3>Nice work! {mins(r.minutes)} focused.</h3>
                  <p className="muted">Saved to your study log{task ? <> for <b>{task.title}</b></> : subject ? <> for <b>{subject.name}</b></> : ''}. Your dashboard and analytics are updated.</p>
                  <div className="btn-row center">
                    {task && task.status !== 'COMPLETED' && <Button icon="check" onClick={completeTask}>Mark task complete</Button>}
                    <Button variant="primary" icon="play" onClick={f.reset}>Start another</Button>
                    <Button to="/progress" icon="chart">View analytics</Button>
                  </div>
                </>
              )}
              {r.status === 'error' && (
                <>
                  <div className="alert error" role="alert"><Icon name="alert" size={18} /><span className="grow">Your {mins(r.minutes)} session could not be saved: {r.message}</span></div>
                  <div className="btn-row center"><Button variant="primary" onClick={f.retrySave}>Retry save</Button><Button onClick={f.reset}>Discard</Button></div>
                </>
              )}
            </div>
          )}
        </section>

        <div className="stack">
          <Card title="Today" action={<Badge tone={insights.streak.current ? 'warning' : 'neutral'} icon="flame">{plural(insights.streak.current, 'day')} streak</Badge>}>
            <div className="mini-stats">
              <div><b>{doneToday.length}</b><span className="muted small">sessions</span></div>
              <div><b>{mins(doneToday.reduce((a, s) => a + (s.duration || 0), 0))}</b><span className="muted small">focused</span></div>
              <div><b>{mins(insights.weekMinutes)}</b><span className="muted small">last 7 days</span></div>
            </div>
          </Card>
          <Card title="Recent sessions" pad={false}>
            {recent.length === 0 ? <EmptyState icon="timer" title="No sessions yet" text="Complete your first focus session to start your study log." /> : (
              <ul className="log-list">{recent.map(s => (
                <li key={s.id}>
                  <SubjectDot color={s.subjectColor} />
                  <div className="grow"><b>{s.taskTitle || s.subjectName || 'Study session'}</b><span className="small muted block">{fmtShortDate(s.startTime)} · {fmtTime(s.startTime)}</span></div>
                  <Badge tone="success">{mins(s.duration)}</Badge>
                </li>
              ))}</ul>
            )}
          </Card>
        </div>
      </div>
      {confirm && <ConfirmDialog title="Discard this session?" text={`You've focused for ${mins(Math.floor(elapsedMs / 60000))}. Resetting will throw this time away. Use "Finish & save" to keep it.`} confirmLabel="Discard session" onCancel={() => setConfirm(false)} onConfirm={() => { setConfirm(false); f.reset() }} />}
    </>
  )
}
