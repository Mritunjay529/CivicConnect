import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TopNav from './components/TopNav';
import BottomNav from './components/BottomNav';
import api, { getStoredUser, setStoredUser, clearAuth } from './services/api';

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
  // Global States (seeded with fallback mockData, synced with backend database)
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [complaints, setComplaints] = useState(initialComplaints);
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [events, setEvents] = useState(initialEvents);
  const [initiatives, setInitiatives] = useState(initialInitiatives);
  const [applications, setApplications] = useState(initialApplications);
  const [notifications, setNotifications] = useState(initialNotifications);

  // Sync opportunities and CSR initiatives with backend database on load and changes
  const refreshOpportunities = async () => {
    try {
      const data = await api.getOpportunities({ type: 'all' });
      if (data && data.length > 0) {
        setOpportunities(data);
        // Also sync CSR initiatives from backend
        const csrItems = data.filter((o) => o.type === 'csr');
        if (csrItems.length > 0) {
          setInitiatives((prev) => {
            const map = new Map();
            prev.forEach((item) => map.set(item.id || item._id, item));
            csrItems.forEach((c) => {
              map.set(c.id || c._id, {
                id: c.id || c._id,
                _id: c.id || c._id,
                title: c.title,
                description: c.description,
                businessName: c.businessName || c.creatorName || 'Corporate Partner',
                businessId: c.creator || c.businessId,
                budget: c.budget ? (String(c.budget).startsWith('$') ? c.budget : `$${c.budget}`) : '$0',
                impactMetric: c.impactMetric || '',
                sponsoredEventId: c.sponsoredEventId,
                date: c.date,
                location: c.location,
                type: 'csr'
              });
            });
            return Array.from(map.values());
          });
        }
      }
    } catch (err) {
      console.warn('Backend opportunities fetch error, using local state:', err);
    }
  };

  // Sync notifications from backend database
  const refreshNotifications = async () => {
    try {
      const data = await api.getNotifications();
      if (data && data.length > 0) {
        setNotifications(data);
      }
    } catch (err) {
      console.warn('Notifications fetch check:', err);
    }
  };

  useEffect(() => {
    refreshOpportunities();
    refreshNotifications();

    // Auto-refresh periodically so citizen gets notifications in real time
    const interval = setInterval(() => {
      refreshNotifications();
      refreshOpportunities();
    }, 12000);

    return () => clearInterval(interval);
  }, [currentUser]);

  // Sync user profile on mount
  useEffect(() => {
    const syncUser = async () => {
      try {
        const me = await api.getMe();
        if (me) {
          const roleMap = {
            citizen: 'Citizen',
            ngo: 'NGO',
            business: 'Business',
            authority: 'Municipal Authority'
          };
          const formatted = {
            ...me,
            id: me._id || me.id,
            role: roleMap[me.role?.toLowerCase()] || me.role,
            points: me.rewardPoints ?? me.points ?? 120,
            activityHistory: me.activityHistory || []
          };
          setCurrentUser(formatted);
          setStoredUser(formatted);
        }
      } catch (err) {
        console.warn('User sync check:', err);
      }
    };
    syncUser();
  }, []);

  // Load NGO applications if user is an NGO
  useEffect(() => {
    const fetchNgoApps = async () => {
      const roleLower = (currentUser?.role || '').toLowerCase();
      if (roleLower === 'ngo' || roleLower === 'admin') {
        try {
          const apps = await api.getNgoApplications();
          if (apps) {
            setApplications(apps);
          }
        } catch (err) {
          console.warn('NGO applications fetch error:', err);
        }
      }
    };
    fetchNgoApps();
  }, [currentUser]);

  // Authentication Handlers
  const handleLoginSuccess = (userObj) => {
    const roleMap = {
      citizen: 'Citizen',
      ngo: 'NGO',
      business: 'Business',
      authority: 'Municipal Authority'
    };
    const formatted = {
      ...userObj,
      id: userObj._id || userObj.id,
      role: roleMap[userObj.role?.toLowerCase()] || userObj.role,
      points: userObj.rewardPoints ?? userObj.points ?? 120,
      activityHistory: userObj.activityHistory || []
    };
    setCurrentUser(formatted);
    setStoredUser(formatted);
    refreshOpportunities();
  };

  const handleLogout = () => {
    clearAuth();
    setCurrentUser(null);
    refreshOpportunities();
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
  const handleApplyOpportunity = async (oppId, citizenName) => {
    let updatedOpp = null;
    try {
      updatedOpp = await api.applyToOpportunity(oppId);
      setOpportunities((prev) =>
        prev.map((o) => (o.id === oppId || o._id === oppId ? updatedOpp : o))
      );
    } catch (err) {
      console.warn('Backend apply error, using local fallback:', err);
      setOpportunities((prev) =>
        prev.map((o) => {
          if (o.id === oppId || o._id === oppId) {
            return {
              ...o,
              appliedCount: (o.appliedCount || 0) + 1,
              volunteers: [...(o.volunteers || []), citizenName]
            };
          }
          return o;
        })
      );
    }

    const targetOpp = opportunities.find((o) => o.id === oppId || o._id === oppId);
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
      const updatedUser = {
        ...currentUser,
        points: (currentUser.points || 0) + 10,
        activityHistory: [
          {
            id: 'act-' + Math.floor(Math.random() * 1000),
            type: 'volunteer',
            title: targetOpp?.title || 'Volunteering Drive',
            date: today,
            status: 'Applied'
          },
          ...(currentUser.activityHistory || [])
        ]
      };
      setCurrentUser(updatedUser);
      setStoredUser(updatedUser);
    }

    // Refresh data in background
    refreshOpportunities();
  };

  // 4. NGO Approve/Reject applications handler
  const handleUpdateApplicationStatus = async (appId, newStatus, oppId) => {
    try {
      await api.updateApplicationStatus(oppId, appId, newStatus);
    } catch (err) {
      console.warn('Backend update application status error:', err);
    }

    setApplications((prev) =>
      prev.map((app) => (app.id === appId || app._id === appId ? { ...app, status: newStatus } : app))
    );

    refreshOpportunities();

    // Notify citizen if names match
    const targetApp = applications.find((a) => a.id === appId || a._id === appId);
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
        const updatedUser = {
          ...currentUser,
          points: (currentUser.points || 0) + 20, // Small bonus points for volunteer approvals
          activityHistory: (currentUser.activityHistory || []).map((act) => {
            if (act.title === targetApp.opportunityTitle) {
              return { ...act, status: 'Approved' };
            }
            return act;
          })
        };
        setCurrentUser(updatedUser);
        setStoredUser(updatedUser);
      }
    }
  };

  // 5. NGO Create volunteering opportunities
  const handleAddOpportunity = async (newOpp) => {
    let created;
    try {
      created = await api.createOpportunity(newOpp);
      setOpportunities((prev) => [created, ...prev]);
    } catch (err) {
      console.warn('Backend opportunity create error, using local state:', err);
      created = {
        ...newOpp,
        id: 'opp-' + Math.floor(Math.random() * 1000),
        _id: 'opp-' + Math.floor(Math.random() * 1000),
        appliedCount: 0,
        volunteers: []
      };
      setOpportunities((prev) => [created, ...prev]);
    }

    // In-app notification for citizens
    const today = new Date().toISOString().split('T')[0];
    const newNotif = {
      id: 'notif-' + Date.now(),
      title: `New Volunteer Drive: ${newOpp.title}`,
      message: `${currentUser?.name || 'An NGO partner'} posted a new volunteer opportunity: "${newOpp.title}".`,
      date: today,
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Refresh to get any updated metadata and notifications
    refreshOpportunities();
    refreshNotifications();
    return created;
  };

  // 6. NGO/Business Create events
  const handleAddEvent = async (newEvent) => {
    let created = newEvent;
    try {
      const res = await api.createEvent(newEvent);
      if (res) created = res;
    } catch (err) {
      console.warn('Backend event creation error, using local state:', err);
    }
    setEvents((prev) => [created, ...prev]);

    const today = new Date().toISOString().split('T')[0];
    const newNotif = {
      id: 'notif-' + Date.now(),
      title: `New Community Event: ${newEvent.title}`,
      message: `${currentUser?.name || 'An organization'} announced community event: "${newEvent.title}". RSVP now!`,
      date: today,
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
    refreshNotifications();
    return created;
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
  const handleAddInitiative = async (newInit) => {
    let created = null;
    try {
      created = await api.createCsrInitiative(newInit);
    } catch (err) {
      console.warn('Backend create CSR initiative error, using local state:', err);
      created = {
        id: 'init-' + Math.floor(Math.random() * 1000),
        _id: 'init-' + Math.floor(Math.random() * 1000),
        ...newInit,
        type: 'csr',
        businessName: currentUser?.name || currentUser?.bizName || 'Corporate Partner',
        creatorName: currentUser?.name || currentUser?.bizName || 'Corporate Partner',
        creatorRole: 'business',
        date: newInit.date || new Date().toISOString().split('T')[0]
      };
    }

    const formattedInit = {
      id: created.id || created._id,
      _id: created.id || created._id,
      title: created.title,
      description: created.description,
      businessName: created.businessName || created.creatorName || currentUser?.name || 'Corporate Partner',
      businessId: created.creator || created.businessId || currentUser?.id,
      budget: created.budget ? (String(created.budget).startsWith('$') ? created.budget : `$${created.budget}`) : '$0',
      impactMetric: created.impactMetric || 'Corporate social responsibility initiative',
      sponsoredEventId: created.sponsoredEventId,
      date: created.date || new Date().toISOString().split('T')[0],
      location: created.location || 'Metropolis',
      type: 'csr'
    };

    setInitiatives((prev) => [formattedInit, ...prev]);
    setOpportunities((prev) => [created, ...prev]);

    // Push in-app notification for citizens immediately
    const today = new Date().toISOString().split('T')[0];
    const newNotif = {
      id: 'notif-' + Date.now(),
      title: `New CSR Initiative: ${created.title}`,
      message: `${currentUser?.name || 'A business partner'} launched corporate CSR initiative: "${created.title}".`,
      date: today,
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);

    refreshOpportunities();
    refreshNotifications();
    return created;
  };

  // 10. Notifications read handlers
  const handleMarkRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id || n._id === id ? { ...n, read: true } : n))
    );
    try {
      await api.markNotificationRead(id);
    } catch (err) {
      console.warn('Mark read API error:', err);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await api.markAllNotificationsRead();
    } catch (err) {
      console.warn('Mark all read API error:', err);
    }
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
                    initiatives={initiatives}
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
                  initiatives={initiatives}
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
                    initiatives={initiatives}
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
