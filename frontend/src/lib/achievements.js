// Achievements are computed ONLY from persisted tasks and completed study sessions.
export function buildAchievements({ completedTasks, sessionsDone, totalMinutes, bestStreak }) {
  const hours = totalMinutes / 60
  const defs = [
    { id: 'first', icon: 'book', title: 'First Study Session', desc: 'Complete your first study session', current: sessionsDone, target: 1 },
    { id: 'streak3', icon: 'flame', title: '3 Day Study Streak', desc: 'Study 3 days in a row', current: bestStreak, target: 3 },
    { id: 'streak7', icon: 'flame', title: '7 Day Study Streak', desc: 'Study 7 days in a row', current: bestStreak, target: 7 },
    { id: 'tasks10', icon: 'trophy', title: '10 Tasks Completed', desc: 'Complete 10 tasks', current: completedTasks, target: 10 },
    { id: 'hours10', icon: 'clock', title: '10 Hours Studied', desc: 'Log 10 hours of completed sessions', current: Math.round(hours * 10) / 10, target: 10 },
    { id: 'sessions10', icon: 'target', title: '10 Study Sessions', desc: 'Complete 10 study sessions', current: sessionsDone, target: 10 },
  ]
  return defs.map(a => ({ ...a, unlocked: a.current >= a.target, current: Math.min(a.current, a.target) }))
}
