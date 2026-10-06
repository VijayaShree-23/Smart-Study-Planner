import { useAuth } from '../auth'
import { useData } from '../data'
import { hoursOf, initials, plural } from '../lib/utils'
import AchievementGrid from '../components/AchievementGrid'
import { Button, Card, PageHeader } from '../components/ui'

export default function Profile({ settings }) {
  const { user, logout } = useAuth(), { progress, insights } = useData()
  const stats = [
    ['Tasks created', progress.totalTasks], ['Tasks completed', progress.completedTasks], ['Study time', hoursOf(insights.session.totalMinutes)],
    ['Study sessions', insights.session.completed], ['Current streak', plural(insights.streak.current, 'day')], ['Best streak', plural(insights.streak.best, 'day')],
  ]
  return (
    <>
      <PageHeader title={settings ? 'Settings' : 'Profile'} subtitle="Your account and study summary." />
      <div className="grid-2">
        <Card title="Account">
          <div className="profile-id"><span className="avatar xl">{initials(user.name)}</span><div><h3>{user.name}</h3><span className="muted">{user.email}</span></div></div>
          <dl className="kv-grid one">
            <div className="kv"><dt>Full name</dt><dd>{user.name}</dd></div>
            <div className="kv"><dt>Email</dt><dd>{user.email}</dd></div>
            <div className="kv"><dt>Account ID</dt><dd>#{user.id}</dd></div>
            <div className="kv"><dt>Sign-in</dt><dd>Password · secured with JWT session</dd></div>
          </dl>
          <Button icon="logout" onClick={logout}>Log out</Button>
        </Card>
        <Card title="Study statistics">
          <div className="tiles">{stats.map(([k, v]) => <div key={k}><b>{v}</b><span>{k}</span></div>)}</div>
        </Card>
      </div>
      <Card title="Achievements"><AchievementGrid items={insights.achievements} /></Card>
    </>
  )
}
