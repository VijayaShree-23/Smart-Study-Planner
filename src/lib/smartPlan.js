// Smart Plan: a transparent, rule-based task ranking. Not AI/ML – every point is explained.
//
//   score (0-100) = urgency (0-40) + priority (0-25) + overdue (0-20) + subject gap (0-10) + effort (0-5)
//
import { daysBetween, todayKey, plural } from './utils'

export const WEIGHTS = [
  { key: 'urgency', label: 'Deadline urgency', max: 40, rule: 'Due today or earlier = 40; loses 5 points per day remaining; no deadline = 0.' },
  { key: 'priority', label: 'Task priority', max: 25, rule: 'High = 25, Medium = 15, Low = 5.' },
  { key: 'overdue', label: 'Overdue penalty', max: 20, rule: 'Overdue tasks get 10 + 1 per day overdue (capped at 20).' },
  { key: 'subject', label: 'Subject progress gap', max: 10, rule: '(100 − subject completion %) ÷ 10, so weaker subjects rank higher.' },
  { key: 'effort', label: 'Estimated effort', max: 5, rule: '1 point per 30 estimated minutes (max 5): bigger tasks need an earlier start.' },
]
export const MAX_SCORE = WEIGHTS.reduce((a, w) => a + w.max, 0)
const PRIORITY_POINTS = { HIGH: 25, MEDIUM: 15, LOW: 5 }

export function scoreTask(task, subjectProgress, today = todayKey()) {
  const d = task.dueDate ? daysBetween(today, task.dueDate) : null
  const urgency = d == null ? 0 : d <= 0 ? 40 : Math.max(0, 40 - d * 5)
  const priority = PRIORITY_POINTS[task.priority] ?? 15
  const overdue = d != null && d < 0 ? Math.min(20, 10 - d) : 0
  const progress = task.subjectId != null ? subjectProgress.get(task.subjectId) : undefined
  const subject = progress == null ? 0 : Math.round((100 - progress) / 10)
  const effort = task.estimatedMinutes ? Math.min(5, Math.floor(task.estimatedMinutes / 30)) : 0
  const breakdown = { urgency, priority, overdue, subject, effort }
  return { total: urgency + priority + overdue + subject + effort, breakdown, daysLeft: d, subjectPct: progress }
}

/** Ranked list of open tasks with human-readable reasons. */
export function recommend(tasks, subjects, today = todayKey()) {
  const progress = new Map(subjects.map(s => [s.id, s.progress]))
  const open = tasks.filter(t => t.status !== 'COMPLETED')
  // The weakest subject (among those that still have open work) earns an explicit reason.
  const openSubjectIds = new Set(open.map(t => t.subjectId).filter(id => id != null))
  const pcts = [...openSubjectIds].map(id => progress.get(id)).filter(p => p != null)
  const lowest = pcts.length > 1 ? Math.min(...pcts) : null

  return open
    .map(task => {
      const { total, breakdown, daysLeft, subjectPct } = scoreTask(task, progress, today)
      const reasons = []
      if (daysLeft != null) {
        if (daysLeft < 0) reasons.push(`Overdue by ${plural(-daysLeft, 'day')}`)
        else if (daysLeft === 0) reasons.push('Due today')
        else if (daysLeft === 1) reasons.push('Due tomorrow')
        else if (daysLeft <= 7) reasons.push(`Due in ${daysLeft} days`)
      }
      if (task.priority === 'HIGH') reasons.push('High priority')
      if (lowest != null && subjectPct === lowest) reasons.push(`Lowest subject progress (${subjectPct}%)`)
      else if (subjectPct != null && subjectPct < 50) reasons.push(`Subject only ${subjectPct}% complete`)
      if (task.estimatedMinutes >= 60) reasons.push(`~${task.estimatedMinutes} min of work`)
      if (task.status === 'IN_PROGRESS') reasons.push('Already in progress')
      if (reasons.length === 0) reasons.push(task.dueDate ? 'Plenty of time left' : 'No deadline set')
      return { task, score: total, breakdown, reasons, daysLeft }
    })
    .sort((a, b) => b.score - a.score || (a.task.dueDate || '9999').localeCompare(b.task.dueDate || '9999') || a.task.id - b.task.id)
    .map((r, i) => ({ ...r, rank: i + 1 }))
}
