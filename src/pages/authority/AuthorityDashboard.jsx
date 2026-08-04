import PageShell from '../../components/PageShell.jsx'
import Card from '../../components/Card.jsx'
import Badge from '../../components/Badge.jsx'
import Button from '../../components/Button.jsx'

const queue = [
  { title: 'Water leakage, Civil Lines', tone: 'error', priority: 'High', meta: 'Reported by 6 citizens · 2h ago' },
  { title: 'Broken streetlight, Sector 9', tone: 'warning', priority: 'Medium', meta: 'Reported by 2 citizens · 5h ago' },
  { title: 'Garbage overflow, Park Road', tone: 'success', priority: 'Low', meta: 'Reported by 1 citizen · 1d ago' },
]

export default function AuthorityDashboard() {
  return (
    <PageShell role="authority">
      <h1 className="text-xl font-semibold text-on-surface mb-6">Municipal authority dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card><p className="text-sm text-on-surface-variant mb-1">Open complaints</p><p className="text-2xl font-semibold">128</p></Card>
        <Card><p className="text-sm text-on-surface-variant mb-1">Resolved this week</p><p className="text-2xl font-semibold">54</p></Card>
        <Card><p className="text-sm text-on-surface-variant mb-1">Active volunteers</p><p className="text-2xl font-semibold">312</p></Card>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-on-surface">Complaints queue</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-on-surface-variant">Sorted by AI priority</span>
          <Button variant="ghost" icon="download">Export report</Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {queue.map((c) => (
          <Card key={c.title} className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Badge tone={c.tone}>{c.priority}</Badge>
              <div>
                <p className="font-medium text-on-surface">{c.title}</p>
                <p className="text-xs text-on-surface-variant">{c.meta}</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="secondary" icon="map">View on map</Button>
              <Button variant="secondary" icon="assignment_ind">Assign</Button>
              <Button icon="check">Mark resolved</Button>
              <Button variant="ghost" icon="close">Reject</Button>
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}
