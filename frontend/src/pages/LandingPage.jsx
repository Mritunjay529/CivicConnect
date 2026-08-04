import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-surface-low to-surface-container py-16 px-6 lg:py-24 text-center border-b border-border-custom">
        <div className="max-w-[800px] mx-auto flex flex-col items-center gap-6">
          <Badge>Version 1.0 Active</Badge>
          <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-secondary leading-tight">
            Empower Your Community with <span className="text-primary">CivicConnect</span>
          </h1>
          <p className="text-base lg:text-lg text-secondary/80 leading-relaxed">
            The bridge between citizens, local authorities, NGOs, and businesses. Co-create a better neighborhood by reporting issues, volunteering, and sponsoring civic initiatives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
            <Link to="/role-selection" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full sm:w-auto text-base px-8 h-14">Get Started</Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-auto text-base px-8 h-14">Log In</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grids */}
      <section className="max-w-[1280px] mx-auto px-6 py-16 w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-secondary">How CivicConnect Works</h2>
          <p className="text-secondary/70 mt-2">A unified civic participation ecosystem built for all stakeholders</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Citizens */}
          <Card className="flex flex-col gap-4 justify-between h-full">
            <div className="flex flex-col gap-3">
              <span className="material-symbols-outlined text-[36px] text-primary bg-surface-low p-3 rounded-custom-lg self-start">
                emoji_people
              </span>
              <h3 className="text-lg font-bold text-secondary">Citizens</h3>
              <p className="text-sm text-secondary/70 leading-relaxed">
                Report local issues with automatic location tagging, track real-time repair progress, volunteer for causes, and RSVP to community events.
              </p>
            </div>
            <Link to="/role-selection" className="mt-4">
              <span className="text-sm font-semibold text-primary flex items-center hover:underline">
                Register as Citizen <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
              </span>
            </Link>
          </Card>

          {/* Card 2: NGOs */}
          <Card className="flex flex-col gap-4 justify-between h-full">
            <div className="flex flex-col gap-3">
              <span className="material-symbols-outlined text-[36px] text-primary bg-surface-low p-3 rounded-custom-lg self-start">
                volunteer_activism
              </span>
              <h3 className="text-lg font-bold text-secondary">NGOs</h3>
              <p className="text-sm text-secondary/70 leading-relaxed">
                Post volunteering drives, coordinate local events, verify attendees, and collaborate with corporate sponsors to secure funding.
              </p>
            </div>
            <Link to="/role-selection" className="mt-4">
              <span className="text-sm font-semibold text-primary flex items-center hover:underline">
                Register as NGO <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
              </span>
            </Link>
          </Card>

          {/* Card 3: Businesses */}
          <Card className="flex flex-col gap-4 justify-between h-full">
            <div className="flex flex-col gap-3">
              <span className="material-symbols-outlined text-[36px] text-primary bg-surface-low p-3 rounded-custom-lg self-start">
                domain
              </span>
              <h3 className="text-lg font-bold text-secondary">Businesses</h3>
              <p className="text-sm text-secondary/70 leading-relaxed">
                Drive CSR initiatives, sponsor environmental or infrastructure improvements, view live impact statistics, and support NGO community goals.
              </p>
            </div>
            <Link to="/role-selection" className="mt-4">
              <span className="text-sm font-semibold text-primary flex items-center hover:underline">
                Register as Business <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
              </span>
            </Link>
          </Card>

          {/* Card 4: Municipal Authorities */}
          <Card className="flex flex-col gap-4 justify-between h-full">
            <div className="flex flex-col gap-3">
              <span className="material-symbols-outlined text-[36px] text-primary bg-surface-low p-3 rounded-custom-lg self-start">
                account_balance
              </span>
              <h3 className="text-lg font-bold text-secondary">Municipalities</h3>
              <p className="text-sm text-secondary/70 leading-relaxed">
                Review verified civic complaints sorted by AI priority, update statuses, dispatch repair squads, and host public town hall meetings.
              </p>
            </div>
            <Link to="/role-selection" className="mt-4">
              <span className="text-sm font-semibold text-primary flex items-center hover:underline">
                Request Auth Access <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
              </span>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
}

// Simple internal Badge component for localized styling
function Badge({ children }) {
  return (
    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
      {children}
    </span>
  );
}
