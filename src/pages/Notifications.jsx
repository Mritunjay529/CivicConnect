import PageShell from '../components/PageShell.jsx'
import Card from '../components/Card.jsx'

const notifications = [
  { icon: 'event', title: 'Reminder: Tree plantation drive tomorrow', meta: '9 AM · City Park', tone: 'text-primary' },
  { icon: 'workspace_premium', title: 'You earned a new certificate', meta: 'Clean-up campaign completion · 2d ago', tone: 'text-primary' },
]

export default function Notifications() {
  return (
    <PageShell role="citizen">
      <h1 className="text-xl font-semibold text-on-surface mb-6">Notifications</h1>
      <div className="flex flex-col gap-3">
        {notifications.map((n) => (
          <Card key={n.title} className="flex items-start gap-3">
            <span className={`material-symbols-outlined text-[22px] ${n.tone}`}>{n.icon}</span>
            <div>
              <p className="text-sm font-medium text-on-surface">{n.title}</p>
              <p className="text-xs text-on-surface-variant">{n.meta}</p>
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}
