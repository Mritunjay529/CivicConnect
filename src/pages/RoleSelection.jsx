import { useNavigate } from 'react-router-dom'
import Card from '../components/Card.jsx'

const roles = [
  { key: 'citizen', label: 'Citizen / Student', icon: 'person', desc: 'Report issues and volunteer', to: '/signup/citizen' },
  { key: 'ngo', label: 'NGO', icon: 'diversity_3', desc: 'Organize campaigns and volunteers', to: '/signup/ngo' },
  { key: 'business', label: 'Local business', icon: 'storefront', desc: 'Support CSR initiatives', to: '/signup/business' },
  { key: 'authority', label: 'Municipal authority', icon: 'account_balance', desc: 'Resolve civic complaints', to: '/signup/authority' },
]

export default function RoleSelection() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full">
        <h1 className="text-2xl md:text-3xl font-semibold text-on-surface text-center mb-2">
          How will you use CivicConnect?
        </h1>
        <p className="text-on-surface-variant text-center mb-8">
          Choose a role to sign up. Each has its own dashboard and permissions.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {roles.map((r) => (
            <Card key={r.key} onClick={() => navigate(r.to)} className="flex items-start gap-4">
              <span className="material-symbols-outlined text-primary text-[28px]">{r.icon}</span>
              <div>
                <p className="font-semibold text-on-surface">{r.label}</p>
                <p className="text-sm text-on-surface-variant">{r.desc}</p>
                <p className="text-sm text-primary font-medium mt-2">Sign up as {r.label.split(' /')[0]} →</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
