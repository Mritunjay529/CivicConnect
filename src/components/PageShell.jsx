import TopNav from './TopNav.jsx'
import BottomNav from './BottomNav.jsx'

export default function PageShell({ children, role = 'citizen', showNav = true }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showNav && <TopNav role={role} />}
      <main className="flex-1 w-full max-w-content mx-auto px-4 md:px-8 py-6 pb-24 md:pb-10">
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  )
}
