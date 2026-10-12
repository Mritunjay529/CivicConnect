import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function TopNav({ user, onLogout, notificationCount = 0 }) {
  const location = useLocation();
  const navigate = useNavigate();

  const getNavLinks = () => {
    if (!user) {
      return [
        { label: 'Home', path: '/' },
        { label: 'Volunteer', path: '/volunteer-opportunities' },
        { label: 'Events', path: '/events-calendar' },
      ];
    }

    switch (user.role) {
      case 'Citizen':
        return [
          { label: 'Dashboard', path: '/citizen-dashboard' },
          { label: 'Report Issue', path: '/report-issue' },
          { label: 'Track Complaints', path: '/complaint-tracking' },
          { label: 'Volunteer', path: '/volunteer-opportunities' },
          { label: 'Events', path: '/events-calendar' },
        ];
      case 'NGO':
        return [
          { label: 'NGO Dashboard', path: '/ngo-dashboard' },
          { label: 'Events Calendar', path: '/events-calendar' },
          { label: 'Volunteer Feed', path: '/volunteer-opportunities' },
        ];
      case 'Business':
        return [
          { label: 'CSR Dashboard', path: '/business-dashboard' },
          { label: 'Events Calendar', path: '/events-calendar' },
          { label: 'Volunteer Feed', path: '/volunteer-opportunities' },
        ];
      case 'Municipal Authority':
        return [
          { label: 'Municipal Dashboard', path: '/municipal-dashboard' },
          { label: 'Track Complaints', path: '/complaint-tracking' },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <header className="hidden lg:block sticky top-0 bg-white border-b border-border-custom z-50 h-16">
      <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
          <span className="material-symbols-outlined text-[32px] font-semibold text-primary">diversity_3</span>
          <span className="tracking-tight">CivicConnect</span>
        </Link>

        {/* Navigation Items */}
        <nav className="flex items-center gap-6 h-full">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-semibold h-16 flex items-center border-b-2 px-1 transition-colors duration-200 ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-secondary hover:text-primary hover:border-primary/40'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls / Profile */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* Notification Bell */}
              <Link 
                to="/notifications" 
                className="relative p-2 rounded-full hover:bg-surface-low text-secondary hover:text-primary transition-all duration-200"
              >
                <span className="material-symbols-outlined text-[24px]">notifications</span>
                {notificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown Preview */}
              <div className="flex items-center gap-3 pl-3 border-l border-border-custom">
                <Link to="/profile" className="flex items-center gap-2 group">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm uppercase">
                    {(user.name || user.orgName || user.businessName || user.email || 'U').charAt(0)}
                  </div>
                  <div className="hidden xl:block text-left">
                    <p className="text-xs font-semibold text-secondary group-hover:text-primary transition-colors leading-none">
                      {user.name || user.orgName || user.businessName || user.email || 'User'}
                    </p>
                    <span className="text-[10px] text-secondary/60 leading-none">{user.role}</span>
                  </div>
                </Link>
                <button
                  onClick={onLogout}
                  className="p-1 rounded hover:bg-error-container hover:text-error text-secondary/60 transition-colors"
                  title="Sign Out"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                to="/login"
                className="text-sm font-semibold text-primary hover:underline px-4 h-12 flex items-center"
              >
                Log In
              </Link>
              <Link 
                to="/role-selection"
                className="bg-primary text-primary-on text-sm font-semibold rounded-custom-lg px-5 h-12 flex items-center justify-center hover:bg-primary/95 active:scale-[0.98] transition-all shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
