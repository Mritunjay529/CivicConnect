import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../components/Input.jsx'
import Button from '../components/Button.jsx'

const roleRoutes = {
  Citizen: '/citizen/dashboard',
  NGO: '/ngo/dashboard',
  Business: '/business/dashboard',
  Authority: '/authority/dashboard',
}

export default function Login() {
  const navigate = useNavigate()
  const [role, setRole] = useState('Citizen')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate(roleRoutes[role])
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-8">
        <div className="flex items-center gap-2 font-semibold text-lg text-on-surface mb-6">
          <span className="material-symbols-outlined text-primary text-[26px]">location_city</span>
          CivicConnect
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {Object.keys(roleRoutes).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                role === r
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-transparent text-on-surface-variant border-outline-variant'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <h1 className="text-xl font-semibold text-on-surface mb-1">Log in as {role}</h1>
        <p className="text-sm text-on-surface-variant mb-6">Welcome back to CivicConnect.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email or phone"
            type="text"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="text-right -mt-2">
            <Link to="#" className="text-sm text-primary font-medium">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" fullWidth>
            Log in
          </Button>
          <Button type="button" variant="secondary" fullWidth icon="mail">
            Continue with Google
          </Button>
        </form>

        <p className="text-sm text-on-surface-variant text-center mt-6">
          Don't have an account?{' '}
          <Link to="/role-selection" className="text-primary font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
