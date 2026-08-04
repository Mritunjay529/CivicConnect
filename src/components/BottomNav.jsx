import { NavLink } from 'react-router-dom'

const items = [
  { label: 'Home', icon: 'home', to: '/citizen/dashboard' },
  { label: 'Report', icon: 'add_location_alt', to: '/report-issue' },
  { label: 'Calendar', icon: 'calendar_month', to: '/event-calendar' },
  { label: 'Rewards', icon: 'workspace_premium', to: '/profile' },
  { label: 'Profile', icon: 'person', to: '/profile' },
]

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-lowest border-t border-outline-variant flex items-center justify-around z-20">
      {items.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-[11px] font-medium ${
              isActive ? 'text-primary' : 'text-on-surface-variant'
            }`
          }
        >
          <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
