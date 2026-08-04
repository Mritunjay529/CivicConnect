import { Link, useNavigate } from 'react-router-dom'

export default function TopNav({ role = 'citizen' }) {
  const navigate = useNavigate()

  const linksByRole = {
    citizen: [
      { label: 'Home', to: '/citizen/dashboard' },
      { label: 'Volunteer', to: '/volunteer-opportunities' },
      { label: 'Calendar', to: '/event-calendar' },
      { label: 'My complaints', to: '/complaint-tracking' },
    ],
    ngo: [{ label: 'Dashboard', to: '/ngo/dashboard' }],
    business: [{ label: 'Dashboard', to: '/business/dashboard' }],
    authority: [{ label: 'Dashboard', to: '/authority/dashboard' }],
  }

  return (
    <header className="hidden md:flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-8 py-3 sticky top-0 z-20">
      <Link to="/" className="flex items-center gap-2 font-semibold text-lg text-on-surface">
        <span className="material-symbols-outlined text-primary text-[26px]">location_city</span>
        CivicConnect
      </Link>
      <nav className="flex items-center gap-6">
        {(linksByRole[role] || []).map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/notifications')}
          className="material-symbols-outlined text-on-surface-variant hover:text-primary"
        >
          notifications
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-sm font-semibold"
        >
          U
        </button>
      </div>
    </header>
  )
}
