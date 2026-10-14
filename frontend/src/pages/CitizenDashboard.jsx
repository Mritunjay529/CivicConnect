import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';

export default function CitizenDashboard({ user, complaints = [], opportunities = [], events = [] }) {
  const navigate = useNavigate();

  // If user is somehow null, redirect to Login
  if (!user) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-12 text-center">
        <h2 className="text-xl font-bold text-secondary">Please log in to view the citizen dashboard.</h2>
        <Link to="/login" className="mt-4 inline-block">
          <Button variant="primary">Log In</Button>
        </Link>
      </div>
    );
  }

  // Filter complaints reported by this user
  const userComplaints = complaints.filter(c => c.reportedBy === user.name);

  // Recommendations: Filter opportunities that user has not applied/joined yet
  const aiRecommendedOpps = opportunities
    .filter(opp => !(opp.volunteers || []).includes(user.name))
    .slice(0, 2);

  // Recommendations: Filter upcoming events
  const upcomingEvents = events.slice(0, 2);

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 flex flex-col gap-8 pb-20">
      {/* Welcome Banner */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-custom-lg p-6 lg:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-primary/20">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl lg:text-3xl font-extrabold">Welcome back, {user.name}!</h2>
          <p className="text-white/80 text-sm max-w-[500px]">
            Thank you for being an active citizen in <span className="font-semibold">{user.location}</span>. Your actions make a difference.
          </p>
        </div>
        <div className="flex gap-4 items-center bg-white/10 p-4 rounded-custom-lg border border-white/10 w-full md:w-auto">
          <div className="flex flex-col text-center pr-4 border-r border-white/20">
            <span className="text-2xl lg:text-3xl font-black text-white">{user.points || 0}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-white/75">Reward Points</span>
          </div>
          <div className="flex flex-col text-center pl-2">
            <span className="text-2xl lg:text-3xl font-black text-white">{user.badges?.length || 0}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-white/75">Badges Earned</span>
          </div>
        </div>
      </section>

      {/* 12-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Quick Actions & Recent Activities (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Quick Actions */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-secondary">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/report-issue')}
                className="bg-white border border-border-custom hover:border-primary rounded-custom-lg p-4 flex flex-col items-center justify-center text-center gap-2 group transition-all duration-300 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[32px] text-primary p-2 bg-surface-low rounded-custom-lg group-hover:bg-primary group-hover:text-white transition-all">
                  report_problem
                </span>
                <span className="text-xs font-bold text-secondary">Report Issue</span>
              </button>

              <button
                onClick={() => navigate('/complaint-tracking')}
                className="bg-white border border-border-custom hover:border-primary rounded-custom-lg p-4 flex flex-col items-center justify-center text-center gap-2 group transition-all duration-300 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[32px] text-primary p-2 bg-surface-low rounded-custom-lg group-hover:bg-primary group-hover:text-white transition-all">
                  list_alt
                </span>
                <span className="text-xs font-bold text-secondary">Track Complaints</span>
              </button>

              <button
                onClick={() => navigate('/volunteer-opportunities')}
                className="bg-white border border-border-custom hover:border-primary rounded-custom-lg p-4 flex flex-col items-center justify-center text-center gap-2 group transition-all duration-300 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[32px] text-primary p-2 bg-surface-low rounded-custom-lg group-hover:bg-primary group-hover:text-white transition-all">
                  volunteer_activism
                </span>
                <span className="text-xs font-bold text-secondary">Volunteer Work</span>
              </button>

              <button
                onClick={() => navigate('/events-calendar')}
                className="bg-white border border-border-custom hover:border-primary rounded-custom-lg p-4 flex flex-col items-center justify-center text-center gap-2 group transition-all duration-300 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[32px] text-primary p-2 bg-surface-low rounded-custom-lg group-hover:bg-primary group-hover:text-white transition-all">
                  calendar_month
                </span>
                <span className="text-xs font-bold text-secondary">Event Calendar</span>
              </button>
            </div>
          </div>

          {/* User Active Issues Feed */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-secondary">Your Reported Issues</h3>
              <Link to="/complaint-tracking" className="text-xs font-bold text-primary hover:underline">
                View All
              </Link>
            </div>
            
            {userComplaints.length === 0 ? (
              <Card className="text-center py-8 text-secondary/60 flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[40px] text-secondary/40">assignment_turned_in</span>
                <p className="text-sm">You haven't reported any issues yet. Notice something broken?</p>
                <Button variant="secondary" onClick={() => navigate('/report-issue')} className="mt-2 h-10 min-h-0 text-xs">
                  Report Now
                </Button>
              </Card>
            ) : (
              <div className="flex flex-col gap-4">
                {userComplaints.map((item) => (
                  <Card key={item.id} className="flex gap-4 items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded-custom-sm border border-border-custom"
                      />
                      <div className="flex flex-col gap-0.5">
                        <h4 className="text-sm font-bold text-secondary line-clamp-1">{item.title}</h4>
                        <p className="text-[11px] text-secondary/50 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">location_on</span>
                          {item.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.status === 'Resolved' ? 'success' : item.status === 'In Progress' ? 'warning' : 'info'}>
                        {item.status}
                      </Badge>
                      <span className="material-symbols-outlined text-secondary/35 text-[18px] cursor-pointer hover:text-primary" onClick={() => navigate(`/complaint-tracking`)}>
                        chevron_right
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Recommendations & Badges (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          {/* AI Recommended Volunteering */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-secondary">AI Recommended For You</h3>
              <Badge variant="primary" className="text-[9px] px-1.5 py-0.5 animate-pulse bg-primary/10 border border-primary/20">Smart Match</Badge>
            </div>

            <div className="flex flex-col gap-4">
              {aiRecommendedOpps.map((opp) => (
                <Card key={opp.id || opp._id} className="flex flex-col gap-3 p-4 hover:border-primary/50 transition-all duration-200">
                  <div className="flex justify-between items-start">
                    <Badge variant="info" className="text-[10px]">{opp.category}</Badge>
                    <span className="text-[10px] text-secondary/50 font-medium">{opp.date}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-secondary leading-tight">{opp.title}</h4>
                    <p className="text-[11px] text-secondary/60 mt-1 line-clamp-2">{opp.description}</p>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-border-custom">
                    <span className="text-[10px] text-secondary/60 font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">corporate_fare</span>
                      {opp.ngoName}
                    </span>
                    <Button variant="secondary" onClick={() => navigate('/volunteer-opportunities')} className="h-8 min-h-0 text-[10px] px-3">
                      Apply
                    </Button>
                  </div>
                </Card>
              ))}

              {upcomingEvents.map((evt) => (
                <Card key={evt.id} className="flex flex-col gap-3 p-4 hover:border-primary/50 transition-all duration-200 bg-surface-low/30">
                  <div className="flex justify-between items-start">
                    <Badge variant="warning" className="text-[10px]">Community Event</Badge>
                    <span className="text-[10px] text-secondary/50 font-medium">{evt.date}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-secondary leading-tight">{evt.title}</h4>
                    <p className="text-[11px] text-secondary/60 mt-1 line-clamp-1">{evt.location}</p>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-border-custom">
                    <span className="text-[10px] text-secondary/50 font-medium">{evt.time}</span>
                    <Button variant="primary" onClick={() => navigate('/events-calendar')} className="h-8 min-h-0 text-[10px] px-3">
                      RSVP
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Badges preview */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-secondary">Your Badges</h3>
            <Card className="flex flex-col gap-3 p-4">
              <div className="grid grid-cols-3 gap-2">
                {user.badges?.map((b) => (
                  <div key={b.id} className="flex flex-col items-center justify-center text-center p-2 rounded-custom-lg bg-surface-low/60 border border-border-custom" title={b.description}>
                    <span className="material-symbols-outlined text-[28px] text-primary mb-1">
                      {b.icon}
                    </span>
                    <span className="text-[10px] font-bold text-secondary leading-none">{b.name}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
