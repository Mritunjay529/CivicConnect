import AuthForm from '../../components/AuthForm.jsx'

export default function AuthoritySignup() {
  return (
    <AuthForm
      title="Request municipal authority access"
      subtitle="Access is verified by an admin before your account is activated."
      fields={[
        { name: 'department', label: 'Department name', placeholder: 'Public Works Department' },
        { name: 'email', label: 'Official email', type: 'email', placeholder: 'you@municipal.gov.in' },
        { name: 'employeeId', label: 'Employee ID', placeholder: 'EMP-2024-001' },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'Create a password' },
      ]}
      submitLabel="Request access"
      onSuccessRoute="/authority/dashboard"
      footerText="Already have access?"
      footerLinkText="Log in"
      footerLinkTo="/login"
    />
  )
}
