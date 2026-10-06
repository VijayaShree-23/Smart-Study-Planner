// Analytics derived from real study sessions + tasks. Nothing here is invented:
// a day "counts" for streaks only if it has at least one COMPLETED study session.
import { addDays, dateKey, dayOf, daysBetween, todayKey } from './utils'
import { recommend } from './smartPlan'
import { buildNotifications } from './notifications'
import { buildAchievements } from './achievements'

const done = s => s.status === 'COMPLETED'

export function minutesByDay(sessions) {
  const m = new Map()
  sessions.filter(done).forEach(s => m.set(dayOf(s.startTime), (m.get(dayOf(s.startTime)) || 0) + (s.duration || 0)))
  return m
}

/** Last `n` days ending today, with study minutes and tasks completed on each day. */
export function lastDays(n, sessions, tasks, end = new Date()) {
  const mins = minutesByDay(sessions)
  const completed = new Map()
  tasks.forEach(t => { if (t.status === 'COMPLETED' && t.completedAt) completed.set(dayOf(t.completedAt), (completed.get(dayOf(t.completedAt)) || 0) + 1) })
  const today = dateKey(end)
  return Array.from({ length: n }, (_, i) => {
    const date = addDays(end, i - (n - 1)), key = dateKey(date)
    return {
      key, date, isToday: key === today,
      label: date.toLocaleDateString(undefined, { weekday: 'short' }),
      fullLabel: date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' }),
      minutes: mins.get(key) || 0, tasksCompleted: completed.get(key) || 0,
    }
  })
}

/** current = consecutive days with a completed session ending today (or yesterday); best = longest run ever. */
export function streaks(sessions, today = todayKey()) {
  const days = [...new Set(sessions.filter(done).map(s => dayOf(s.startTime)).filter(k => k && k <= today))].sort()
  if (!days.length) return { current: 0, best: 0 }
  let best = 1, run = 1
  for (let i = 1; i < days.length; i++) { run = daysBetween(days[i - 1], days[i]) === 1 ? run + 1 : 1; best = Math.max(best, run) }
  const last = days[days.length - 1]
  const gap = daysBetween(last, today)
  if (gap > 1) return { current: 0, best }
  let current = 1
  for (let i = days.length - 1; i > 0 && daysBetween(days[i - 1], days[i]) === 1; i--) current++
  return { current, best }
}

export function sessionStats(sessions) {
  const completed = sessions.filter(done)
  const totalMinutes = completed.reduce((a, s) => a + (s.duration || 0), 0)
  return {
    total: sessions.length, completed: completed.length, scheduled: sessions.length - completed.length,
    totalMinutes, avgMinutes: completed.length ? Math.round(totalMinutes / completed.length) : 0,
    longest: completed.reduce((a, s) => Math.max(a, s.duration || 0), 0),
  }
}

/** subjectId -> completed study minutes */
export function studyBySubject(sessions) {
  const m = new Map()
  sessions.filter(done).forEach(s => { if (s.subjectId != null) m.set(s.subjectId, (m.get(s.subjectId) || 0) + (s.duration || 0)) })
  return m
}

/** Per-subject numbers for the Subjects page and dashboard. */
export function subjectStats(subjects, tasks, sessions, today = todayKey()) {
  const study = studyBySubject(sessions)
  return subjects.map(s => {
    const mine = tasks.filter(t => t.subjectId === s.id), open = mine.filter(t => t.status !== 'COMPLETED')
    return {
      ...s,
      openCount: open.length,
      upcomingCount: open.filter(t => t.dueDate && t.dueDate >= today).length,
      overdueCount: open.filter(t => t.overdue).length,
      studyMinutes: study.get(s.id) || 0,
    }
  })
}

export function deriveInsights({ tasks, subjects, sessions }) {
  const today = todayKey()
  const stat = sessionStats(sessions), streak = streaks(sessions, today)
  const week = lastDays(7, sessions, tasks)
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length
  return {
    recommendations: recommend(tasks, subjects, today),
    streak, session: stat, week,
    weekMinutes: week.reduce((a, d) => a + d.minutes, 0),
    subjects: subjectStats(subjects, tasks, sessions, today),
    notifications: buildNotifications(tasks, sessions),
    achievements: buildAchievements({ completedTasks, sessionsDone: stat.completed, totalMinutes: stat.totalMinutes, bestStreak: streak.best }),
  }
}
