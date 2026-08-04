import AuthForm from '../../components/AuthForm.jsx'

export default function BusinessSignup() {
  return (
    <AuthForm
      title="Register your business"
      subtitle="Sponsor initiatives and take part in CSR programs."
      fields={[
        { name: 'bizName', label: 'Business name', placeholder: 'Acme Retail Pvt Ltd' },
        { name: 'gst', label: 'GST / registration number', placeholder: '22AAAAA0000A1Z5' },
        { name: 'email', label: 'Email', type: 'email', placeholder: 'csr@business.com' },
        { name: 'focusArea', label: 'CSR focus area', placeholder: 'Environment, education, health...' },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'Create a password' },
      ]}
      submitLabel="Register business"
      onSuccessRoute="/business/dashboard"
      footerText="Already registered?"
      footerLinkText="Log in"
      footerLinkTo="/login"
    />
  )
}
