import { useState } from 'react'
import PageShell from '../components/PageShell.jsx'
import Card from '../components/Card.jsx'
import Button from '../components/Button.jsx'
import Input from '../components/Input.jsx'

const opportunities = [
  { title: 'Tree plantation drive', org: 'Green Earth NGO', date: 'Sat, 9 AM', distance: '2 km', icon: 'forest' },
  { title: 'Beach and park clean-up', org: 'Sahyog Foundation', date: 'Sun, 7 AM', distance: '4 km', icon: 'recycling' },
  { title: 'Blood donation camp', org: 'City Hospital CSR', date: 'Next Wed', distance: '1.5 km', icon: 'bloodtype' },
  { title: 'Teach digital literacy', org: 'EduForAll', date: 'Ongoing', distance: 'Online', icon: 'school' },
]

export default function VolunteerOpportunities() {
  const [search, setSearch] = useState('')

  return (
    <PageShell role="citizen">
      <h1 className="text-xl font-semibold text-on-surface mb-4">Volunteer opportunities</h1>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input icon="search" placeholder="Search opportunities" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon="category">Category</Button>
          <Button variant="secondary" icon="near_me">Distance</Button>
          <Button variant="secondary" icon="event">Date</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {opportunities
          .filter((o) => o.title.toLowerCase().includes(search.toLowerCase()))
          .map((o) => (
            <Card key={o.title} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[24px]">{o.icon}</span>
                <div>
                  <p className="font-medium text-on-surface">{o.title}</p>
                  <p className="text-xs text-on-surface-variant">{o.org}</p>
                </div>
              </div>
              <p className="text-sm text-on-surface-variant">{o.date} · {o.distance}</p>
              <div className="flex gap-2">
                <Button fullWidth>Apply</Button>
                <Button variant="secondary" icon="event_available">Add to calendar</Button>
              </div>
            </Card>
          ))}
      </div>
    </PageShell>
  )
}
