import PageShell from '../../components/PageShell.jsx'
import Card from '../../components/Card.jsx'
import Button from '../../components/Button.jsx'
import Badge from '../../components/Badge.jsx'

const applications = [
  { name: 'Rahul Verma', event: 'Tree plantation drive', tone: 'warning', status: 'Pending' },
  { name: 'Ananya Singh', event: 'Beach clean-up', tone: 'success', status: 'Approved' },
]

export default function NgoDashboard() {
  return (
    <PageShell role="ngo">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-on-surface">NGO dashboard</h1>
        <Button icon="add">Post new opportunity</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card><p className="text-sm text-on-surface-variant mb-1">Active opportunities</p><p className="text-2xl font-semibold">6</p></Card>
        <Card><p className="text-sm text-on-surface-variant mb-1">Total volunteers</p><p className="text-2xl font-semibold">248</p></Card>
        <Card><p className="text-sm text-on-surface-variant mb-1">Pending applications</p><p className="text-2xl font-semibold">12</p></Card>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-on-surface">Volunteer applications</h2>
        <Button variant="ghost" icon="group">Manage volunteers</Button>
      </div>

      <div className="flex flex-col gap-3">
        {applications.map((a) => (
          <Card key={a.name} className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-medium text-on-surface">{a.name}</p>
              <p className="text-xs text-on-surface-variant">{a.event}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={a.tone}>{a.status}</Badge>
              {a.status === 'Pending' && (
                <>
                  <Button variant="secondary">Approve</Button>
                  <Button variant="ghost">Reject</Button>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Button variant="secondary" icon="campaign">Post campaign update</Button>
      </div>
    </PageShell>
  )
}
