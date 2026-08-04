import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNav({ user, notificationCount = 0 }) {
  const location = useLocation();

  const getMobileTabs = () => {
    if (!user) {
      return [
        { label: 'Home', path: '/', icon: 'home' },
        { label: 'Volunteer', path: '/volunteer-opportunities', icon: 'volunteer_activism' },
        { label: 'Events', path: '/events-calendar', icon: 'calendar_month' },
        { label: 'Log In', path: '/login', icon: 'login' }
      ];
    }

    switch (user.role) {
      case 'Citizen':
        return [
          { label: 'Home', path: '/citizen-dashboard', icon: 'home' },
          { label: 'Report', path: '/report-issue', icon: 'add_circle' },
          { label: 'Track', path: '/complaint-tracking', icon: 'list_alt' },
          { label: 'Volunteer', path: '/volunteer-opportunities', icon: 'volunteer_activism' },
          { label: 'Profile', path: '/profile', icon: 'person' },
        ];
      case 'NGO':
        return [
          { label: 'Dashboard', path: '/ngo-dashboard', icon: 'home' },
          { label: 'Volunteer', path: '/volunteer-opportunities', icon: 'volunteer_activism' },
          { label: 'Events', path: '/events-calendar', icon: 'calendar_month' },
          { label: 'Profile', path: '/profile', icon: 'person' },
        ];
      case 'Business':
        return [
          { label: 'Dashboard', path: '/business-dashboard', icon: 'home' },
          { label: 'Volunteer', path: '/volunteer-opportunities', icon: 'volunteer_activism' },
          { label: 'Events', path: '/events-calendar', icon: 'calendar_month' },
          { label: 'Profile', path: '/profile', icon: 'person' },
        ];
      case 'Municipal Authority':
        return [
          { label: 'Dashboard', path: '/municipal-dashboard', icon: 'home' },
          { label: 'Complaints', path: '/complaint-tracking', icon: 'list_alt' },
          { label: 'Profile', path: '/profile', icon: 'person' },
        ];
      default:
        return [];
    }
  };

  const tabs = getMobileTabs();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border-custom h-[64px] z-50 flex items-center justify-around px-2 pb-safe shadow-sm">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors duration-200 ${
              isActive ? 'text-primary' : 'text-secondary/70 hover:text-primary/70'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <span className={`material-symbols-outlined text-[24px] ${isActive ? 'font-semibold' : ''}`}>
                {tab.icon}
              </span>
              
              {/* Conditional Notification badge on Profile tab or Dashboard tab */}
              {tab.label === 'Profile' && notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-error rounded-full" />
              )}
            </div>
            <span className="text-[10px] md:text-[12px] mt-0.5 leading-none truncate max-w-full font-medium">
              {tab.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
