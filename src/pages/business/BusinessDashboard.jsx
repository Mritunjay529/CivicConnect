import PageShell from '../../components/PageShell.jsx'
import Card from '../../components/Card.jsx'
import Button from '../../components/Button.jsx'

export default function BusinessDashboard() {
  return (
    <PageShell role="business">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-on-surface">CSR dashboard</h1>
        <Button icon="add">Create CSR initiative</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card><p className="text-sm text-on-surface-variant mb-1">Initiatives sponsored</p><p className="text-2xl font-semibold">4</p></Card>
        <Card><p className="text-sm text-on-surface-variant mb-1">People impacted</p><p className="text-2xl font-semibold">1,240</p></Card>
        <Card><p className="text-sm text-on-surface-variant mb-1">Certificates earned</p><p className="text-2xl font-semibold">3</p></Card>
      </div>

      <h2 className="font-semibold text-on-surface mb-3">Your CSR initiatives</h2>
      <div className="flex flex-col gap-3">
        {[
          { title: 'School supply donation drive', status: 'Active' },
          { title: 'Sponsored: Tree plantation drive', status: 'Completed' },
        ].map((i) => (
          <Card key={i.title} className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-medium text-on-surface">{i.title}</p>
              <p className="text-xs text-on-surface-variant">{i.status}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" icon="handshake">Sponsor an event</Button>
              <Button variant="ghost" icon="bar_chart">View impact report</Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Button variant="secondary" icon="download">Download CSR certificate</Button>
      </div>
    </PageShell>
  )
}
