import AuthForm from '../../components/AuthForm.jsx'

export default function CitizenSignup() {
  return (
    <AuthForm
      title="Sign up as a citizen or student"
      subtitle="Report issues, volunteer, and earn recognition for community work."
      fields={[
        { name: 'name', label: 'Full name', placeholder: 'Pooja Sharma' },
        { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
        { name: 'phone', label: 'Phone number', type: 'tel', placeholder: '98765 43210' },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'Create a password' },
      ]}
      submitLabel="Sign up"
      onSuccessRoute="/citizen/dashboard"
      footerText="Already have an account?"
      footerLinkText="Log in"
      footerLinkTo="/login"
    />
  )
}
