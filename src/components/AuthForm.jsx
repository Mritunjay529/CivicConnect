import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Input from './Input.jsx'
import Button from './Button.jsx'

export default function AuthForm({ title, subtitle, fields, submitLabel, onSuccessRoute, footerText, footerLinkText, footerLinkTo }) {
  const navigate = useNavigate()
  const [values, setValues] = useState({})

  const handleChange = (name) => (e) => setValues((v) => ({ ...v, [name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate(onSuccessRoute)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-8">
        <Link to="/role-selection" className="text-sm text-on-surface-variant flex items-center gap-1 mb-4">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Change role
        </Link>
        <h1 className="text-xl font-semibold text-on-surface mb-1">{title}</h1>
        <p className="text-sm text-on-surface-variant mb-6">{subtitle}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {fields.map((f) => (
            <Input
              key={f.name}
              label={f.label}
              type={f.type || 'text'}
              as={f.as}
              placeholder={f.placeholder}
              value={values[f.name] || ''}
              onChange={handleChange(f.name)}
            />
          ))}
          <Button type="submit" fullWidth className="mt-2">
            {submitLabel}
          </Button>
          <Button type="button" variant="secondary" fullWidth icon="mail">
            Continue with Google
          </Button>
        </form>

        <p className="text-sm text-on-surface-variant text-center mt-6">
          {footerText}{' '}
          <Link to={footerLinkTo} className="text-primary font-medium">
            {footerLinkText}
          </Link>
        </p>
      </div>
    </div>
  )
}
