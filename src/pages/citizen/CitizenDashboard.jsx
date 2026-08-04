import { useNavigate } from 'react-router-dom'
import PageShell from '../../components/PageShell.jsx'
import Card from '../../components/Card.jsx'
import Badge from '../../components/Badge.jsx'

const quickActions = [
  { label: 'Report an issue', icon: 'add_location_alt', to: '/report-issue', tone: 'error' },
  { label: 'Find volunteering', icon: 'volunteer_activism', to: '/volunteer-opportunities', tone: 'primary' },
  { label: 'Track my complaints', icon: 'checklist', to: '/complaint-tracking', tone: 'neutral' },
  { label: 'Events calendar', icon: 'calendar_month', to: '/event-calendar', tone: 'neutral' },
]

const recommended = [
  { title: 'Tree plantation drive', meta: 'Saturday · 2 km away', icon: 'forest', tone: 'success' },
  { title: 'Clean-up campaign with Sahyog', meta: 'Sunday · Certificate offered', icon: 'recycling', tone: 'primary' },
]

export default function CitizenDashboard() {
  const navigate = useNavigate()
  return (
    <PageShell role="citizen">
      <p className="text-sm text-on-surface-variant">Good morning</p>
      <h1 className="text-2xl font-semibold text-on-surface mb-6">What would you like to do?</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {quickActions.map((a) => (
          <Card key={a.label} onClick={() => navigate(a.to)} className="flex flex-col items-start gap-2 p-4">
            <span className="material-symbols-outlined text-[24px] text-primary">{a.icon}</span>
            <span className="text-sm font-medium text-on-surface">{a.label}</span>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-on-surface">Recommended for you</h2>
        <Badge tone="primary" icon="auto_awesome">AI matched</Badge>
      </div>
      <div className="flex flex-col gap-3">
        {recommended.map((r) => (
          <Card key={r.title} onClick={() => navigate('/volunteer-opportunities')} className="flex items-center gap-4 p-4">
            <span className="material-symbols-outlined text-[22px] text-primary">{r.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-on-surface">{r.title}</p>
              <p className="text-xs text-on-surface-variant">{r.meta}</p>
            </div>
            <span className="material-symbols-outlined text-outline">chevron_right</span>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}
