import PageShell from '../components/PageShell.jsx'
import Card from '../components/Card.jsx'
import Button from '../components/Button.jsx'
import Badge from '../components/Badge.jsx'

export default function Profile() {
  return (
    <PageShell role="citizen">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-xl font-semibold">
          PM
        </div>
        <div>
          <p className="text-lg font-semibold text-on-surface">Pooja Mritunjay</p>
          <p className="text-sm text-on-surface-variant">Citizen · Joined Jan 2025</p>
        </div>
      </div>

      <Card className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-on-surface">Reward points</p>
          <p className="text-sm text-on-surface-variant">640 / 1000</p>
        </div>
        <div className="w-full h-2 rounded-full bg-surface-container">
          <div className="h-2 rounded-full bg-primary" style={{ width: '64%' }} />
        </div>
      </Card>

      <div className="flex gap-2 flex-wrap mb-8">
        <Badge tone="success" icon="eco">Eco warrior</Badge>
        <Badge tone="primary" icon="groups">Community leader</Badge>
        <Badge tone="neutral" icon="verified">5 events completed</Badge>
      </div>

      <h2 className="font-semibold text-on-surface mb-3">Activity history</h2>
      <div className="flex flex-col gap-3 mb-8">
        {[
          { title: 'Completed: Tree plantation drive', date: '2 weeks ago' },
          { title: 'Reported: Pothole near MG Road', date: '3 weeks ago' },
        ].map((a) => (
          <Card key={a.title} className="flex items-center justify-between">
            <p className="text-sm text-on-surface">{a.title}</p>
            <p className="text-xs text-on-surface-variant">{a.date}</p>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <Button variant="secondary" icon="edit">Edit profile</Button>
        <Button variant="secondary" icon="download">Download certificate</Button>
        <Button variant="secondary" icon="military_tech">View badges</Button>
        <Button variant="ghost" icon="logout">Log out</Button>
      </div>
    </PageShell>
  )
}
