import React from 'react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';

export default function UserProfile({ user, onLogout }) {
  if (!user) {
    return <div className="p-6 text-center text-secondary">Loading Profile Context...</div>;
  }

  // Pre-load default values for non-citizen roles
  const points = user.points || 0;
  const badgesList = user.badges || [];
  const activityHistory = user.activityHistory || [];

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 flex flex-col gap-8 pb-20">
      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: User details, Stats, Badges (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* User Details Card */}
          <Card className="flex flex-col items-center text-center p-6 gap-4">
            <div className="w-20 h-20 rounded-full bg-primary text-primary-on flex items-center justify-center font-black text-3xl uppercase border border-border-custom shadow-sm">
              {user.name.charAt(0)}
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold text-secondary">{user.name}</h3>
              <div className="flex justify-center gap-1.5 mt-0.5">
                <Badge variant="primary">{user.role}</Badge>
              </div>
              <p className="text-xs text-secondary/60 font-semibold mt-1 flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[14px]">mail</span>
                {user.email}
              </p>
              <p className="text-xs text-secondary/60 font-semibold flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                {user.location}
              </p>
            </div>
            <Button variant="secondary" onClick={onLogout} icon="logout" className="w-full mt-2 h-10 min-h-0 text-xs">
              Log Out
            </Button>
          </Card>

          {/* Reward Points Box (If Citizen) */}
          {user.role === 'Citizen' && (
            <Card className="p-6 bg-gradient-to-br from-primary to-primary/95 text-white flex flex-col justify-between border border-primary/20">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-white/70">Redeemable Balance</span>
                <h4 className="text-4xl font-black">{points} Points</h4>
                <p className="text-xs text-white/75 mt-1 leading-relaxed">
                  Earn points by reporting verifiable civic issues and attending local volunteer events.
                </p>
              </div>
              <Button
                variant="secondary"
                disabled
                className="w-full mt-4 h-10 min-h-0 text-xs text-white border-white/20 bg-white/10 hover:bg-white/20"
              >
                Redeem Rewards (Coming Soon)
              </Button>
            </Card>
          )}

          {/* Badges Box (If Citizen) */}
          {user.role === 'Citizen' && (
            <Card className="flex flex-col gap-4 p-6">
              <h4 className="text-sm font-bold text-secondary flex items-center gap-1.5 border-b border-border-custom pb-2">
                <span className="material-symbols-outlined text-primary text-[20px]">workspace_premium</span>
                Your Achievements ({badgesList.length})
              </h4>
              
              {badgesList.length === 0 ? (
                <p className="text-xs text-secondary/50 italic text-center py-4">No achievements earned yet. Participate in volunteering and report issues to unlock badges!</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {badgesList.map((b) => (
                    <div key={b.id} className="flex gap-3 items-center bg-surface-low/50 p-2.5 rounded-custom-lg border border-border-custom">
                      <span className="material-symbols-outlined text-primary bg-white p-2 rounded-full border border-border-custom text-[24px]">
                        {b.icon || 'star'}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-secondary">{b.name}</span>
                        <span className="text-[10px] text-secondary/60 leading-none">{b.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Right Column: Activity History (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <h3 className="text-lg font-bold text-secondary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[22px]">history</span>
            Activity and Contributions History
          </h3>

          <Card className="p-6">
            {activityHistory.length === 0 ? (
              <div className="text-center py-12 text-secondary/40 flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[48px] text-secondary/20">history_edu</span>
                <p className="text-sm font-semibold">No recent activity logs recorded.</p>
                <p className="text-xs">Your actions on CivicConnect (RSVPs, volunteerings, reports) will form a timeline tracker here.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-border-custom ml-3 pl-6 flex flex-col gap-6">
                {activityHistory.map((act) => {
                  let actIcon = 'event_available';
                  let actType = 'Activity';
                  let badgeVariant = 'info';

                  if (act.type === 'report') {
                    actIcon = 'report_problem';
                    actType = 'Report Filed';
                    badgeVariant = act.status === 'Resolved' ? 'success' : 'warning';
                  } else if (act.type === 'volunteer') {
                    actIcon = 'handshake';
                    actType = 'Volunteer Drive';
                    badgeVariant = 'primary';
                  } else if (act.type === 'rsvp') {
                    actIcon = 'calendar_month';
                    actType = 'RSVP Status';
                    badgeVariant = 'secondary';
                  }

                  return (
                    <div key={act.id} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-[35px] top-0 w-8 h-8 rounded-full bg-white border border-border-custom flex items-center justify-center text-primary shadow-sm">
                        <span className="material-symbols-outlined text-[16px]">{actIcon}</span>
                      </span>

                      <div className="flex flex-col gap-1 pl-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs text-secondary/40 font-bold">{act.date}</span>
                          <Badge variant={badgeVariant}>{act.status || actType}</Badge>
                        </div>
                        <h4 className="text-sm font-bold text-secondary leading-tight mt-0.5">{act.title}</h4>
                        <p className="text-[11px] text-secondary/50 font-semibold">{actType}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
