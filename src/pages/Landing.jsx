import { useNavigate } from 'react-router-dom'
import Button from '../components/Button.jsx'

export default function Landing() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between px-6 md:px-10 py-5">
        <div className="flex items-center gap-2 font-semibold text-lg text-on-surface">
          <span className="material-symbols-outlined text-primary text-[26px]">location_city</span>
          CivicConnect
        </div>
        <Button variant="secondary" onClick={() => navigate('/login')}>
          Log in
        </Button>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-2xl text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-on-surface leading-tight mb-4">
            One platform for a more active, responsible community
          </h1>
          <p className="text-base md:text-lg text-on-surface-variant mb-8">
            Report civic issues, discover volunteering opportunities, and connect with NGOs,
            businesses, and municipal authorities — all in one place.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button onClick={() => navigate('/role-selection')} icon="arrow_forward">
              Get started
            </Button>
            <Button variant="secondary" onClick={() => navigate('/login')}>
              Log in
            </Button>
          </div>
        </div>
      </main>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 md:px-10 pb-16 max-w-content mx-auto w-full">
        {[
          { icon: 'report', title: 'Report issues', desc: 'Flag potholes, garbage, and more with photo and location.' },
          { icon: 'volunteer_activism', title: 'Volunteer', desc: 'Find and join community service opportunities near you.' },
          { icon: 'workspace_premium', title: 'Get recognized', desc: 'Earn reward points, badges, and certificates.' },
        ].map((f) => (
          <div key={f.title} className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5">
            <span className="material-symbols-outlined text-primary text-[26px] mb-2 block">{f.icon}</span>
            <h3 className="font-semibold text-on-surface mb-1">{f.title}</h3>
            <p className="text-sm text-on-surface-variant">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
