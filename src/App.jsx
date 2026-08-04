import { Routes, Route } from 'react-router-dom'

import Landing from './pages/Landing.jsx'
import RoleSelection from './pages/RoleSelection.jsx'
import Login from './pages/Login.jsx'

import CitizenSignup from './pages/signup/CitizenSignup.jsx'
import NgoSignup from './pages/signup/NgoSignup.jsx'
import BusinessSignup from './pages/signup/BusinessSignup.jsx'
import AuthoritySignup from './pages/signup/AuthoritySignup.jsx'

import CitizenDashboard from './pages/citizen/CitizenDashboard.jsx'
import ReportIssue from './pages/citizen/ReportIssue.jsx'
import ComplaintTracking from './pages/citizen/ComplaintTracking.jsx'

import VolunteerOpportunities from './pages/VolunteerOpportunities.jsx'
import EventCalendar from './pages/EventCalendar.jsx'

import NgoDashboard from './pages/ngo/NgoDashboard.jsx'
import BusinessDashboard from './pages/business/BusinessDashboard.jsx'
import AuthorityDashboard from './pages/authority/AuthorityDashboard.jsx'

import Profile from './pages/Profile.jsx'
import Notifications from './pages/Notifications.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/role-selection" element={<RoleSelection />} />
      <Route path="/login" element={<Login />} />

      <Route path="/signup/citizen" element={<CitizenSignup />} />
      <Route path="/signup/ngo" element={<NgoSignup />} />
      <Route path="/signup/business" element={<BusinessSignup />} />
      <Route path="/signup/authority" element={<AuthoritySignup />} />

      <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
      <Route path="/report-issue" element={<ReportIssue />} />
      <Route path="/complaint-tracking" element={<ComplaintTracking />} />

      <Route path="/volunteer-opportunities" element={<VolunteerOpportunities />} />
      <Route path="/event-calendar" element={<EventCalendar />} />

      <Route path="/ngo/dashboard" element={<NgoDashboard />} />
      <Route path="/business/dashboard" element={<BusinessDashboard />} />
      <Route path="/authority/dashboard" element={<AuthorityDashboard />} />

      <Route path="/profile" element={<Profile />} />
      <Route path="/notifications" element={<Notifications />} />
    </Routes>
  )
}
