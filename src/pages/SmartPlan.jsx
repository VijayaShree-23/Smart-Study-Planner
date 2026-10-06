import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../data'
import { useStartTask } from '../hooks'
import { MAX_SCORE, WEIGHTS } from '../lib/smartPlan'
import Icon from '../components/Icon'
import TaskDetailModal from '../components/TaskDetailModal'
import { Badge, Button, Card, DueText, EmptyState, PageHeader, PriorityBadge, SubjectDot } from '../components/ui'

const SEG_COLORS = { urgency: '#c2410c', priority: '#3b5bdb', overdue: '#b91c1c', subject: '#0f766e', effort: '#7c3aed' }

function ScoreBar({ breakdown }) {
  return (
    <div className="score-bar" role="img" aria-label={WEIGHTS.map(w => `${w.label} ${breakdown[w.key]}`).join(', ')}>
      {WEIGHTS.map(w => breakdown[w.key] > 0 && <i key={w.key} title={`${w.label}: ${breakdown[w.key]}/${w.max}`} style={{ width: `${(breakdown[w.key] / MAX_SCORE) * 100}%`, background: SEG_COLORS[w.key] }} />)}
    </div>
  )
}
function Why({ breakdown }) {
  return (
    <details className="why">
      <summary>Why this score?</summary>
      <ul>{WEIGHTS.map(w => <li key={w.key}><i style={{ background: SEG_COLORS[w.key] }} />{w.label}<b>{breakdown[w.key]} / {w.max}</b></li>)}</ul>
    </details>
  )
}

export default function SmartPlan() {
  const { insights } = useData(), start = useStartTask(), nav = useNavigate()
  const [viewId, setViewId] = useState(null)
  const recs = insights.recommendations, top = recs.slice(0, 3), rest = recs.slice(3, 12)

  return (
    <>
      <PageHeader title="Smart Plan" subtitle="Your open tasks, ranked by a transparent rule-based scoring engine." actions={<Badge tone="accent" icon="bulb">Rule-based · not AI</Badge>} />

      {recs.length === 0 ? (
        <Card><EmptyState icon="check" title="Nothing to plan" text="You have no open tasks. Create a study task and it will be ranked here automatically." action={<Button variant="primary" icon="plus" to="/tasks">Add a task</Button>} /></Card>
      ) : (
        <>
          <h2 className="section-title"><Icon name="bulb" size={20} /> Recommended for you</h2>
          <div className="rec-grid">
            {top.map(r => (
              <article className={'card rec' + (r.rank === 1 ? ' first' : '')} key={r.task.id}>
                <div className="between"><span className="rank">#{r.rank}</span><span className="score"><b>{r.score}</b>/{MAX_SCORE}</span></div>
                <h3 className="rec-title">{r.task.title}</h3>
                <div className="meta">
                  {r.task.subjectName && <span className="inline"><SubjectDot color={r.task.subjectColor} />{r.task.subjectName}</span>}
                  <DueText task={r.task} /><PriorityBadge priority={r.task.priority} />
                </div>
                <ul className="reasons">{r.reasons.map(x => <li key={x}>{x}</li>)}</ul>
                <ScoreBar breakdown={r.breakdown} /><Why breakdown={r.breakdown} />
                <div className="btn-row"><Button variant="primary" icon="play" onClick={() => start(r.task)}>Start task</Button><Button icon="eye" onClick={() => setViewId(r.task.id)}>View task</Button></div>
              </article>
            ))}
          </div>

          {rest.length > 0 && (
            <Card title="Next in line" pad={false}>
              <ul className="rank-list">{rest.map(r => (
                <li key={r.task.id}>
                  <span className="rank sm">#{r.rank}</span>
                  <button className="rank-main" onClick={() => setViewId(r.task.id)}><b>{r.task.title}</b><span className="small muted">{r.reasons.slice(0, 2).join(' · ')}</span></button>
                  <span className="rank-due"><DueText task={r.task} /></span><span className="score sm"><b>{r.score}</b>/{MAX_SCORE}</span>
                  <Button size="sm" icon="play" onClick={() => start(r.task)}>Start</Button>
                </li>
              ))}</ul>
            </Card>
          )}
        </>
      )}

      <Card title="How the score works" subtitle={`Each open task earns up to ${MAX_SCORE} points. Completed tasks are never ranked.`}>
        <ul className="rules">{WEIGHTS.map(w => (
          <li key={w.key}><span className="rule-swatch" style={{ background: SEG_COLORS[w.key] }} /><div className="grow"><b>{w.label}</b><span className="muted small block">{w.rule}</span></div><Badge>0–{w.max}</Badge></li>
        ))}</ul>
        <p className="muted small chart-note">Ties are broken by the earlier deadline. Everything is computed in your browser from your own tasks and subject progress, so you can always see why a task is ranked where it is.</p>
      </Card>

      {viewId && <TaskDetailModal taskId={viewId} onClose={() => setViewId(null)} onEdit={t => nav(`/tasks?edit=${t.id}`)} />}
    </>
  )
}
