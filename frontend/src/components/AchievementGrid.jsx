import Icon from './Icon'
import { ProgressBar } from './ui'

/** Achievements computed from real data. Locked ones show true progress toward the goal. */
export default function AchievementGrid({ items, compact = false }) {
  return (
    <ul className={'ach-grid' + (compact ? ' compact' : '')}>
      {items.map(a => (
        <li key={a.id} className={'ach' + (a.unlocked ? ' on' : '')}>
          <span className="ach-icon"><Icon name={a.unlocked ? a.icon : 'lock'} size={20} /></span>
          <div className="grow">
            <div className="ach-title">{a.title}</div>
            {a.unlocked ? <div className="small ok">Unlocked</div> : (
              <>
                <div className="small muted">{a.current} / {a.target}</div>
                <ProgressBar value={(a.current / a.target) * 100} label={a.title} />
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
