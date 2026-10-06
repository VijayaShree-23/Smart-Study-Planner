import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { useData } from '../data'
import { useStartTask } from '../hooks'
import { greeting, hoursOf, mins, fmtTime, plural } from '../lib/utils'
import AchievementGrid from '../components/AchievementGrid'
import { BarChart } from '../components/charts'
import Icon from '../components/Icon'
import TaskDetailModal from '../components/TaskDetailModal'
import { Badge, Button, Card, DueText, EmptyState, PageHeader, PriorityBadge, ProgressBar, StatCard, SubjectDot } from '../components/ui'

const axisFmt = v => (v >= 60 ? `${+(v / 60).toFixed(1)}h` : `${v}m`)

export default function Dashboard() {
  const { user } = useAuth(), nav = useNavigate(), start = useStartTask()
  const { progress, dashboard, insights } = useData()
  const [viewId, setViewId] = useState(null)
  const top = insights.recommendations[0]
  const name = (dashboard.name || user.name).split(' ')[0]
  const week = insights.week.map(d => ({ key: d.key, label: d.label, value: d.minutes, highlight: d.isToday, title: `${d.fullLabel}: ${mins(d.minutes)}` }))

  return (
    <>
      <PageHeader title={<>{greeting()}, {name} <span aria-hidden="true">👋</span></>} subtitle="Here's your study overview for today."
        actions={<Button variant="primary" icon="timer" to="/focus">Start focus session</Button>} />

      {progress.overdueTasks > 0 && (
        <div className="alert warning" role="status"><Icon name="alert" size={18} /><span className="grow">You have {plural(progress.overdueTasks, 'overdue task')}.</span><Button size="sm" to="/tasks?tab=Overdue">Review</Button></div>
      )}

      <div className="grid-4">
        <StatCard icon="tasks" label="Total tasks" value={progress.totalTasks} hint={`${progress.pendingTasks} pending`} />
        <StatCard icon="check" label="Completed" value={progress.completedTasks} tone="success" hint={progress.overdueTasks ? `${progress.overdueTasks} overdue` : 'Nothing overdue'} />
        <StatCard icon="clock" label="Study time" value={`${progress.studyHours} h`} tone="info" hint={`${mins(insights.weekMinutes)} in the last 7 days`} />
        <StatCard icon="target" label="Progress" value={`${progress.overallProgress}%`} tone="warning"><ProgressBar value={progress.overallProgress} label="Overall task completion" /></StatCard>
      </div>

      <div className="grid-main">
        <Card title="Weekly study activity" subtitle="Completed study time, last 7 days" action={<Badge tone="accent">{mins(insights.weekMinutes)} total</Badge>}>
          <BarChart data={week} step={30} format={axisFmt} ariaLabel={`Study minutes per day for the last 7 days; total ${mins(insights.weekMinutes)}`} />
          {insights.weekMinutes === 0 && <p className="muted small chart-note">No completed study sessions this week yet. Start a focus session and it will appear here.</p>}
        </Card>

        <Card title="Today's focus" subtitle="Your highest-priority next step">
          {top ? (
            <div className="focus-card">
              <div className="rec-top"><Badge tone="accent" icon="bulb">Smart recommendation</Badge></div>
              <h3 className="rec-title">{top.task.title}</h3>
              <div className="meta">{top.task.subjectName && <span className="inline"><SubjectDot color={top.task.subjectColor} />{top.task.subjectName}</span>}<DueText task={top.task} /><PriorityBadge priority={top.task.priority} /></div>
              <ul className="reasons">{top.reasons.slice(0, 3).map(r => <li key={r}>{r}</li>)}</ul>
              <div className="btn-row"><Button variant="primary" icon="play" onClick={() => start(top.task)}>Start task</Button><Button icon="eye" onClick={() => setViewId(top.task.id)}>View task</Button></div>
              <Link className="link-more" to="/smart-plan">See full Smart Plan →</Link>
            </div>
          ) : <EmptyState icon="check" title="You're all caught up" text="No open tasks. Add a task to get a recommendation." action={<Button variant="primary" icon="plus" to="/tasks">Add a task</Button>} />}
          <div className="today-box">
            <div className="between"><b>Today</b><span className="muted small">{dashboard.todayCompleted} of {dashboard.todayTotal} tasks done</span></div>
            <ProgressBar value={dashboard.todayProgress} label="Today's task progress" />
            {dashboard.todaySessions.length === 0 ? <p className="muted small">No study sessions scheduled today. <Link to="/schedule">Schedule one</Link></p> :
              <ul className="mini-list">{dashboard.todaySessions.slice(0, 3).map(s => <li key={s.id}><span className="tnum muted">{fmtTime(s.startTime)}</span><span className="grow">{s.taskTitle || s.subjectName || 'Study session'}</span>{s.status === 'COMPLETED' && <Badge tone="success">Done</Badge>}</li>)}</ul>}
          </div>
        </Card>
      </div>

      <div className="grid-2">
        <Card title="Upcoming deadlines" action={<Link className="link-more" to="/tasks">All tasks</Link>} pad={false}>
          {dashboard.upcomingDeadlines.length === 0 ? <EmptyState icon="calendar" title="No upcoming deadlines" text="Tasks with a due date will appear here." /> : (
            <div className="dl">
              <div className="dl-row dl-head"><span>Task</span><span>Due</span><span>Priority</span></div>
              {dashboard.upcomingDeadlines.map(t => (
                <button key={t.id} className="dl-row" onClick={() => setViewId(t.id)}>
                  <span className="dl-title"><b>{t.title}</b>{t.subjectName && <span className="small muted">{t.subjectName}</span>}</span>
                  <span><DueText task={t} /></span><span><PriorityBadge priority={t.priority} /></span>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card title="Subject progress" action={<Link className="link-more" to="/subjects">Manage</Link>}>
          {insights.subjects.length === 0 ? <EmptyState icon="book" title="No subjects yet" text="Add a subject to track your progress." action={<Button to="/subjects">Add subject</Button>} /> : (
            <ul className="sp-list">{insights.subjects.slice(0, 6).map(s => (
              <li key={s.id}>
                <div className="between"><span className="inline"><SubjectDot color={s.color} /><b>{s.name}</b></span><span className="muted small">{s.completedCount}/{s.taskCount} tasks · <b>{s.progress}%</b></span></div>
                <ProgressBar value={s.progress} color={s.color} label={`${s.name} progress`} />
              </li>
            ))}</ul>
          )}
        </Card>
      </div>

      <Card title="Streak & achievements" subtitle="Calculated from your completed study sessions and tasks"
        action={<Badge tone={insights.streak.current ? 'warning' : 'neutral'} icon="flame">{plural(insights.streak.current, 'day')} streak</Badge>}>
        <AchievementGrid items={insights.achievements} compact />
        <p className="muted small chart-note">Total study time: {hoursOf(insights.session.totalMinutes)} across {plural(insights.session.completed, 'completed session')}.</p>
      </Card>

      {viewId && <TaskDetailModal taskId={viewId} onClose={() => setViewId(null)} onEdit={t => nav(`/tasks?edit=${t.id}`)} />}
    </>
  )
}
