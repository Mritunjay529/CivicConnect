import AuthForm from '../../components/AuthForm.jsx'

export default function NgoSignup() {
  return (
    <AuthForm
      title="Register your NGO"
      subtitle="Post volunteering opportunities and manage campaigns."
      fields={[
        { name: 'orgName', label: 'Organization name', placeholder: 'Sahyog Foundation' },
        { name: 'regNumber', label: 'Registration number', placeholder: 'NGO-2024-00123' },
        { name: 'contact', label: 'Contact person', placeholder: 'Full name' },
        { name: 'email', label: 'Official email', type: 'email', placeholder: 'contact@ngo.org' },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'Create a password' },
      ]}
      submitLabel="Register NGO"
      onSuccessRoute="/ngo/dashboard"
      footerText="Already registered?"
      footerLinkText="Log in"
      footerLinkTo="/login"
    />
  )
}
