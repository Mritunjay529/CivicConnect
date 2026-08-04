import PageShell from '../../components/PageShell.jsx'
import Card from '../../components/Card.jsx'
import Badge from '../../components/Badge.jsx'
import Button from '../../components/Button.jsx'

const complaints = [
  { title: 'Pothole near MG Road', status: 'In progress', tone: 'warning', date: 'Submitted 2 days ago' },
  { title: 'Broken streetlight, Sector 9', status: 'Resolved', tone: 'success', date: 'Submitted 6 days ago' },
  { title: 'Garbage overflow, Park Road', status: 'Pending', tone: 'neutral', date: 'Submitted today' },
]

export default function ComplaintTracking() {
  return (
    <PageShell role="citizen">
      <h1 className="text-xl font-semibold text-on-surface mb-6">My complaints</h1>
      <div className="flex flex-col gap-3">
        {complaints.map((c) => (
          <Card key={c.title} className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-on-surface">{c.title}</p>
              <p className="text-xs text-on-surface-variant">{c.date}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone={c.tone}>{c.status}</Badge>
              <Button variant="ghost">View details</Button>
              {c.status === 'Resolved' && <Button variant="secondary">Give feedback</Button>}
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}
