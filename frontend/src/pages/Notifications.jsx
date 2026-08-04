import React from 'react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';

export default function Notifications({
  notifications = [],
  onMarkRead,
  onMarkAllRead
}) {
  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 flex flex-col gap-6 pb-20 max-w-[700px]">
      {/* Header Controls */}
      <div className="flex justify-between items-center border-b border-border-custom pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-secondary">System Notifications</h2>
          <p className="text-sm text-secondary/60">Updates on your filed tickets, event reminders, and rewards logs.</p>
        </div>

        {notifications.some(n => !n.read) && (
          <Button
            variant="secondary"
            onClick={onMarkAllRead}
            className="h-10 min-h-0 text-xs px-4"
          >
            Mark All Read
          </Button>
        )}
      </div>

      {/* Notifications list */}
      <div className="flex flex-col gap-4">
        {notifications.length === 0 ? (
          <Card className="text-center py-16 text-secondary/40 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-[64px] text-secondary/20">notifications_off</span>
            <p className="font-semibold text-sm">All clean! No system notifications found.</p>
          </Card>
        ) : (
          notifications.map((notif) => {
            // Determine icon and color based on title keywords
            let notifIcon = 'notifications';
            let iconColor = 'text-primary bg-surface-low';

            if (notif.title.toLowerCase().includes('resolved') || notif.title.toLowerCase().includes('approved')) {
              notifIcon = 'check_circle';
              iconColor = 'text-green-700 bg-green-50';
            } else if (notif.title.toLowerCase().includes('new') || notif.title.toLowerCase().includes('posted')) {
              notifIcon = 'campaign';
              iconColor = 'text-blue-700 bg-blue-50';
            } else if (notif.title.toLowerCase().includes('priority') || notif.title.toLowerCase().includes('alert')) {
              notifIcon = 'warning';
              iconColor = 'text-error bg-error-container';
            }

            return (
              <Card
                key={notif.id}
                onClick={() => onMarkRead(notif.id)}
                className={`p-4 flex gap-4 items-center justify-between border cursor-pointer transition-all duration-200 ${
                  notif.read 
                    ? 'bg-white border-border-custom opacity-70' 
                    : 'bg-surface-low/10 border-primary/30 shadow-sm'
                }`}
              >
                <div className="flex gap-4 items-start flex-1 min-w-0">
                  <span className={`material-symbols-outlined text-[24px] p-2.5 rounded-full ${iconColor} shrink-0`}>
                    {notifIcon}
                  </span>
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-secondary truncate">{notif.title}</h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-secondary/70 leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] text-secondary/40 font-semibold mt-1 block">{notif.date}</span>
                  </div>
                </div>

                <div className="flex items-center">
                  {!notif.read ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkRead(notif.id);
                      }}
                      className="p-1 rounded text-secondary/40 hover:text-primary transition-colors hover:bg-surface-low"
                      title="Mark as Read"
                    >
                      <span className="material-symbols-outlined text-[20px]">drafts</span>
                    </button>
                  ) : (
                    <span className="material-symbols-outlined text-[20px] text-secondary/25">mark_email_read</span>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
