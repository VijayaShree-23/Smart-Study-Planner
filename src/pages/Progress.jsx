import { useData } from '../data'
import { hoursOf, mins, plural } from '../lib/utils'
import AchievementGrid from '../components/AchievementGrid'
import { BarChart, Donut } from '../components/charts'
import { Badge, Card, EmptyState, PageHeader, ProgressBar, StatCard, SubjectDot } from '../components/ui'

const minFmt = v => (v >= 60 ? `${+(v / 60).toFixed(1)}h` : `${v}m`)

export default function Progress() {
  const { progress, tasks, insights } = useData()
  const { week, weekMinutes, streak, session } = insights
  const todo = tasks.filter(t => t.status === 'TODO').length, doing = tasks.filter(t => t.status === 'IN_PROGRESS').length
  const hours = week.map(d => ({ key: d.key, label: d.label, value: d.minutes, highlight: d.isToday, title: `${d.fullLabel}: ${mins(d.minutes)}` }))
  const done = week.map(d => ({ key: d.key, label: d.label, value: d.tasksCompleted, highlight: d.isToday, title: `${d.fullLabel}: ${plural(d.tasksCompleted, 'task')} completed` }))
  const weekTasks = week.reduce((a, d) => a + d.tasksCompleted, 0)

  return (
    <>
      <PageHeader title="Analytics" subtitle="How your study time and task completion are trending." />

      <div className="grid-4">
        <StatCard icon="clock" label="Study hours (7 days)" value={hoursOf(weekMinutes)} tone="info" hint={`${mins(Math.round(weekMinutes / 7))} per day on average`} />
        <StatCard icon="check" label="Tasks completed" value={progress.completedTasks} tone="success" hint={`${weekTasks} in the last 7 days`} />
        <StatCard icon="target" label="Completion rate" value={`${progress.overallProgress}%`} tone="warning"><ProgressBar value={progress.overallProgress} label="Task completion" /></StatCard>
        <StatCard icon="flame" label="Study streak" value={plural(streak.current, 'day')} tone="danger" hint={`Best streak: ${plural(streak.best, 'day')}`} />
      </div>

      <div className="grid-2">
        <Card title="Weekly study hours" subtitle="Completed focus and study sessions per day" action={<Badge tone="accent">{mins(weekMinutes)}</Badge>}>
          <BarChart data={hours} step={30} format={minFmt} ariaLabel={`Study time per day, last 7 days. Total ${mins(weekMinutes)}`} />
          {weekMinutes === 0 && <p className="muted small chart-note">No completed sessions in the last 7 days.</p>}
        </Card>
        <Card title="Tasks completed" subtitle="Tasks marked complete per day" action={<Badge tone="success">{weekTasks} this week</Badge>}>
          <BarChart data={done} step={2} format={v => v} ariaLabel={`Tasks completed per day, last 7 days. Total ${weekTasks}`} />
          {weekTasks === 0 && <p className="muted small chart-note">No tasks completed in the last 7 days.</p>}
        </Card>
      </div>

      <div className="grid-2">
        <Card title="Task completion" subtitle="Where all your tasks currently stand">
          {tasks.length === 0 ? <EmptyState icon="tasks" title="No tasks yet" text="Create tasks to see your completion breakdown." /> : (
            <Donut centerValue={`${progress.overallProgress}%`} centerLabel="complete"
              segments={[{ label: 'Completed', value: progress.completedTasks, color: 'var(--success)' }, { label: 'In progress', value: doing, color: 'var(--accent)' }, { label: 'To do', value: todo, color: '#c3cad8' }]} />
          )}
          {progress.overdueTasks > 0 && <p className="due-bad small chart-note">{plural(progress.overdueTasks, 'task')} overdue</p>}
        </Card>

        <Card title="Study session statistics" subtitle="From your saved study sessions">
          <div className="tiles">
            <div><b>{session.completed}</b><span>Completed sessions</span></div>
            <div><b>{session.scheduled}</b><span>Scheduled</span></div>
            <div><b>{hoursOf(session.totalMinutes)}</b><span>Total study time</span></div>
            <div><b>{mins(session.avgMinutes)}</b><span>Average session</span></div>
            <div><b>{mins(session.longest)}</b><span>Longest session</span></div>
            <div><b>{plural(streak.best, 'day')}</b><span>Best streak</span></div>
          </div>
        </Card>
      </div>

      <Card title="Subject-wise progress" subtitle="Completion and study time per subject">
        {insights.subjects.length === 0 ? <EmptyState icon="book" title="No subjects yet" text="Add subjects and tasks to see progress here." /> : (
          <ul className="sp-list wide">{insights.subjects.map(s => (
            <li key={s.id}>
              <div className="between"><span className="inline"><SubjectDot color={s.color} /><b>{s.name}</b></span><span className="muted small">{s.completedCount}/{s.taskCount} tasks · {mins(s.studyMinutes)} studied · <b>{s.progress}%</b></span></div>
              <ProgressBar value={s.progress} color={s.color} label={`${s.name} progress`} />
            </li>
          ))}</ul>
        )}
      </Card>

      <Card title="Achievements" subtitle="Unlocked from your real activity">
        <AchievementGrid items={insights.achievements} />
      </Card>
    </>
  )
}
