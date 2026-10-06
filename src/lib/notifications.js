// Frontend-derived notifications built from existing task/session data (no notification backend needed).
import { daysUntil, plural, dayOf, fmtTime, mins } from './utils'

const ORDER = { danger: 0, warning: 1, info: 2, success: 3 }

export function buildNotifications(tasks, sessions, now = new Date()) {
  const out = []
  tasks.filter(t => t.status !== 'COMPLETED' && t.dueDate).forEach(t => {
    const d = daysUntil(t.dueDate), where = t.subjectName ? ` · ${t.subjectName}` : ''
    if (d < 0) out.push({ id: `overdue-${t.id}`, level: 'danger', title: 'Task overdue', text: `${t.title}${where} (${plural(-d, 'day')} late)`, to: `/tasks?task=${t.id}` })
    else if (d === 0) out.push({ id: `due0-${t.id}`, level: 'warning', title: 'Due today', text: `${t.title}${where}`, to: `/tasks?task=${t.id}` })
    else if (d === 1) out.push({ id: `due1-${t.id}`, level: 'warning', title: 'Due tomorrow', text: `${t.title}${where}`, to: `/tasks?task=${t.id}` })
  })
  sessions.forEach(s => {
    const start = new Date(s.startTime), end = new Date(s.endTime), name = s.taskTitle || s.subjectName || 'Study session'
    if (s.status !== 'COMPLETED' && start > now && start - now <= 24 * 36e5)
      out.push({ id: `soon-${s.id}`, level: 'info', title: 'Upcoming study session', text: `${name} at ${fmtTime(s.startTime)}`, to: `/schedule?date=${dayOf(s.startTime)}` })
    if (s.status === 'COMPLETED' && now - end >= 0 && now - end <= 24 * 36e5)
      out.push({ id: `done-${s.id}`, level: 'success', title: 'Study session completed', text: `${name} · ${mins(s.duration)}`, to: `/schedule?date=${dayOf(s.startTime)}` })
  })
  return out.sort((a, b) => ORDER[a.level] - ORDER[b.level]).slice(0, 20)
}
