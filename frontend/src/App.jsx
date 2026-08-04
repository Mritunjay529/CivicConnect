import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TopNav from './components/TopNav';
import BottomNav from './components/BottomNav';

// Pages imports
import LandingPage from './pages/LandingPage';
import RoleSelection from './pages/RoleSelection';
import SignUp from './pages/SignUp';
import LogIn from './pages/LogIn';
import CitizenDashboard from './pages/CitizenDashboard';
import ReportCivicIssue from './pages/ReportCivicIssue';
import ComplaintTracking from './pages/ComplaintTracking';
import VolunteerListing from './pages/VolunteerListing';
import EventCalendar from './pages/EventCalendar';
import NgoDashboard from './pages/NgoDashboard';
import BusinessCsrDashboard from './pages/BusinessCsrDashboard';
import MunicipalDashboard from './pages/MunicipalDashboard';
import UserProfile from './pages/UserProfile';
import Notifications from './pages/Notifications';

// Mock seed data imports
import {
  initialComplaints,
  initialOpportunities,
  initialEvents,
  initialInitiatives,
  initialNotifications,
  initialApplications
} from './mockData';

export default function App() {
  // Global Mock States
  const [currentUser, setCurrentUser] = useState(null); // Default starts logged out
  const [complaints, setComplaints] = useState(initialComplaints);
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [events, setEvents] = useState(initialEvents);
  const [initiatives, setInitiatives] = useState(initialInitiatives);
  const [applications, setApplications] = useState(initialApplications);
  const [notifications, setNotifications] = useState(initialNotifications);

  // Authentication Handlers
  const handleLoginSuccess = (userObj) => {
    setCurrentUser(userObj);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // 1. Report Civic Issue handler
  const handleAddComplaint = (newComplaint) => {
    setComplaints((prev) => [newComplaint, ...prev]);

    // Credit reward points to citizen
    if (currentUser && currentUser.role === 'Citizen') {
      const updatedUser = {
        ...currentUser,
        points: currentUser.points + 50,
        activityHistory: [
          {
            id: 'act-' + Math.floor(Math.random() * 1000),
            type: 'report',
            title: newComplaint.title,
            date: newComplaint.date,
            status: 'Pending'
          },
          ...currentUser.activityHistory
        ]
      };
      setCurrentUser(updatedUser);
    }

    // Push notification trigger
    const newNotif = {
      id: 'notif-' + Math.floor(Math.random() * 1000),
      title: 'Report Received',
      message: `Your ticket "${newComplaint.title}" is registered in the municipal database.`,
      date: newComplaint.date,
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // 2. Municipal Rep status modifier handler
  const handleUpdateComplaintStatus = (id, newStatus) => {
    const today = new Date().toISOString().split('T')[0];

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const statusText = newStatus === 'Resolved'
            ? 'Issue resolved by Municipal division. Verified.'
            : 'Crew dispatched. Set status to In Progress.';

          return {
            ...c,
            status: newStatus,
            updates: [...c.updates, { date: today, text: statusText }]
          };
        }
        return c;
      })
    );

    // Fetch complaint and notify reporter
    const targetComp = complaints.find((c) => c.id === id);
    if (targetComp) {
      // Trigger notification
      const newNotif = {
        id: 'notif-' + Math.floor(Math.random() * 1000),
        title: newStatus === 'Resolved' ? 'Civic Complaint Resolved!' : 'Ticket Status Update',
        message: `Your reported ticket "${targetComp.title}" has been updated to "${newStatus}".`,
        date: today,
        read: false
      };
      setNotifications((prev) => [newNotif, ...prev]);

      // If resolved, award additional reward points to reporter
      if (newStatus === 'Resolved' && currentUser && currentUser.name === targetComp.reportedBy) {
        setCurrentUser((prev) => ({
          ...prev,
          points: prev.points + 100,
          activityHistory: prev.activityHistory.map((act) => {
            if (act.title === targetComp.title) {
              return { ...act, status: 'Resolved' };
            }
            return act;
          })
        }));
      }
    }
  };

  // 3. Citizen Apply for Volunteer opportunity handler
  const handleApplyOpportunity = (oppId, citizenName) => {
    setOpportunities((prev) =>
      prev.map((o) => {
        if (o.id === oppId) {
          return {
            ...o,
            appliedCount: o.appliedCount + 1,
            volunteers: [...o.volunteers, citizenName]
          };
        }
        return o;
      })
    );

    const targetOpp = opportunities.find((o) => o.id === oppId);
    const today = new Date().toISOString().split('T')[0];

    // Create entry in application tracker list
    const newApp = {
      id: 'app-' + Math.floor(Math.random() * 1000),
      opportunityId: oppId,
      opportunityTitle: targetOpp?.title || 'Volunteering Drive',
      citizenName: citizenName,
      citizenEmail: currentUser ? currentUser.email : 'citizen@email.com',
      status: 'Pending'
    };
    setApplications((prev) => [newApp, ...prev]);

    // Log to citizen activity
    if (currentUser) {
      setCurrentUser((prev) => ({
        ...prev,
        activityHistory: [
          {
            id: 'act-' + Math.floor(Math.random() * 1000),
            type: 'volunteer',
            title: targetOpp?.title || 'Volunteering Drive',
            date: today,
            status: 'Applied'
          },
          ...prev.activityHistory
        ]
      }));
    }
  };

  // 4. NGO Approve/Reject applications handler
  const handleUpdateApplicationStatus = (appId, newStatus) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
    );

    // Notify citizen if names match
    const targetApp = applications.find(a => a.id === appId);
    if (targetApp) {
      const today = new Date().toISOString().split('T')[0];
      const newNotif = {
        id: 'notif-' + Math.floor(Math.random() * 1000),
        title: `Volunteer application ${newStatus}`,
        message: `Your registration for "${targetApp.opportunityTitle}" was ${newStatus.toLowerCase()} by the organizer.`,
        date: today,
        read: false
      };
      setNotifications((prev) => [newNotif, ...prev]);

      // If approved, update user activity status
      if (newStatus === 'Approved' && currentUser && currentUser.name === targetApp.citizenName) {
        setCurrentUser(prev => ({
          ...prev,
          points: prev.points + 20, // Small bonus points for volunteer approvals
          activityHistory: prev.activityHistory.map(act => {
            if (act.title === targetApp.opportunityTitle) {
              return { ...act, status: 'Approved' };
            }
            return act;
          })
        }));
      }
    }
  };

  // 5. NGO Create volunteering opportunities
  const handleAddOpportunity = (newOpp) => {
    setOpportunities((prev) => [newOpp, ...prev]);
  };

  // 6. NGO/Business Create events
  const handleAddEvent = (newEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
  };

  // 7. Citizen RSVP to community events
  const handleRsvpEvent = (eventId, userName) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          return {
            ...e,
            rsvps: [...e.rsvps, userName]
          };
        }
        return e;
      })
    );

    const targetEvt = events.find(e => e.id === eventId);
    const today = new Date().toISOString().split('T')[0];

    // Log to citizen activity
    if (currentUser) {
      setCurrentUser(prev => ({
        ...prev,
        activityHistory: [
          {
            id: 'act-' + Math.floor(Math.random() * 1000),
            type: 'rsvp',
            title: targetEvt?.title || 'Community Event',
            date: today,
            status: 'Going'
          },
          ...prev.activityHistory
        ]
      }));
    }
  };

  // 8. Business Sponsor events
  const handleSponsorEvent = (eventId, bizName) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          return {
            ...e,
            sponsoredBy: bizName
          };
        }
        return e;
      })
    );
  };

  // 9. Business Create CSR Initiatives
  const handleAddInitiative = (newInit) => {
    setInitiatives((prev) => [newInit, ...prev]);
  };

  // 10. Notifications read handlers
  const handleMarkRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getDashboardPath = (role) => {
    switch (role) {
      case 'Citizen':
        return '/citizen-dashboard';
      case 'NGO':
        return '/ngo-dashboard';
      case 'Business':
        return '/business-dashboard';
      case 'Municipal Authority':
        return '/municipal-dashboard';
      default:
        return '/login';
    }
  };

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-background">
        {/* Responsive Navbar System */}
        <TopNav
          user={currentUser}
          onLogout={handleLogout}
          notificationCount={unreadCount}
        />

        {/* Global Page Content shell */}
        <main className="flex-grow max-w-[1280px] w-full mx-auto pb-[76px] lg:pb-12">
          <Routes>
            <Route 
              path="/" 
              element={
                currentUser ? (
                  <Navigate to={getDashboardPath(currentUser.role)} replace />
                ) : (
                  <LandingPage />
                )
              } 
            />
            <Route 
              path="/role-selection" 
              element={
                currentUser ? (
                  <Navigate to={getDashboardPath(currentUser.role)} replace />
                ) : (
                  <RoleSelection />
                )
              } 
            />

            <Route 
              path="/signup" 
              element={
                currentUser ? (
                  <Navigate to={getDashboardPath(currentUser.role)} replace />
                ) : (
                  <SignUp onLoginSuccess={handleLoginSuccess} />
                )
              } 
            />

            <Route 
              path="/login" 
              element={
                currentUser ? (
                  <Navigate to={getDashboardPath(currentUser.role)} replace />
                ) : (
                  <LogIn onLoginSuccess={handleLoginSuccess} />
                )
              } 
            />

            <Route 
              path="/citizen-dashboard" 
              element={
                currentUser ? (
                  <CitizenDashboard
                    user={currentUser}
                    complaints={complaints}
                    opportunities={opportunities}
                    events={events}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            <Route 
              path="/report-issue" 
              element={
                currentUser ? (
                  <ReportCivicIssue
                    user={currentUser}
                    onAddComplaint={handleAddComplaint}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            <Route 
              path="/complaint-tracking" 
              element={
                currentUser ? (
                  <ComplaintTracking
                    user={currentUser}
                    complaints={complaints}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            <Route 
              path="/volunteer-opportunities" 
              element={
                <VolunteerListing
                  user={currentUser}
                  opportunities={opportunities}
                  onApplyOpportunity={handleApplyOpportunity}
                />
              } 
            />

            <Route 
              path="/events-calendar" 
              element={
                <EventCalendar
                  user={currentUser}
                  events={events}
                  onAddEvent={handleAddEvent}
                  onRsvpEvent={handleRsvpEvent}
                />
              } 
            />

            <Route 
              path="/ngo-dashboard" 
              element={
                currentUser ? (
                  <NgoDashboard
                    user={currentUser}
                    opportunities={opportunities}
                    applications={applications}
                    onAddOpportunity={handleAddOpportunity}
                    onUpdateApplicationStatus={handleUpdateApplicationStatus}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            <Route 
              path="/business-dashboard" 
              element={
                currentUser ? (
                  <BusinessCsrDashboard
                    user={currentUser}
                    initiatives={initiatives}
                    events={events}
                    onAddInitiative={handleAddInitiative}
                    onSponsorEvent={handleSponsorEvent}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            <Route 
              path="/municipal-dashboard" 
              element={
                currentUser ? (
                  <MunicipalDashboard
                    user={currentUser}
                    complaints={complaints}
                    onUpdateComplaintStatus={handleUpdateComplaintStatus}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            <Route 
              path="/profile" 
              element={
                currentUser ? (
                  <UserProfile
                    user={currentUser}
                    onLogout={handleLogout}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            <Route 
              path="/notifications" 
              element={
                currentUser ? (
                  <Notifications
                    notifications={notifications}
                    onMarkRead={handleMarkRead}
                    onMarkAllRead={handleMarkAllRead}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            {/* Fallback routing redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Mobile bottom nav drawer */}
        <BottomNav user={currentUser} notificationCount={unreadCount} />
      </div>
    </BrowserRouter>
  );
}
