import PageShell from '../components/PageShell.jsx'
import Card from '../components/Card.jsx'
import Button from '../components/Button.jsx'
import Badge from '../components/Badge.jsx'

const events = [
  { title: 'Tree plantation drive', date: 'Sat, 9 AM', tone: 'success' },
  { title: 'Awareness campaign: Water conservation', date: 'Mon, 5 PM', tone: 'primary' },
  { title: 'CSR: School supply donation', date: 'Wed, 11 AM', tone: 'neutral' },
]

export default function EventCalendar() {
  return (
    <PageShell role="citizen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-on-surface">Community event calendar</h1>
        <Button icon="add" variant="secondary">Create event</Button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-6 text-center text-xs text-on-surface-variant">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="font-medium">{d}</div>
        ))}
        {Array.from({ length: 28 }, (_, i) => (
          <div
            key={i}
            className={`py-2 rounded text-sm ${
              [5, 9, 15].includes(i) ? 'bg-primary text-on-primary font-medium' : 'text-on-surface'
            }`}
          >
            {i + 1}
          </div>
        ))}
      </div>

      <h2 className="font-semibold text-on-surface mb-3">Upcoming events</h2>
      <div className="flex flex-col gap-3">
        {events.map((e) => (
          <Card key={e.title} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-on-surface">{e.title}</p>
              <p className="text-xs text-on-surface-variant">{e.date}</p>
            </div>
            <Button variant="secondary">RSVP</Button>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}
