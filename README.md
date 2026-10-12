# CivicConnect — Frontend

React (JavaScript) + Vite + Tailwind CSS + React Router frontend for CivicConnect,
matching the Stitch-generated design system (teal/navy, Inter font, 12px radius cards).

## Setup

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Structure

```
src/
  components/     Button, Card, Badge, Input, TopNav, BottomNav, PageShell, AuthForm
  pages/          Landing, RoleSelection, Login, Profile, Notifications,
                   VolunteerOpportunities, EventCalendar
  pages/signup/   CitizenSignup, NgoSignup, BusinessSignup, AuthoritySignup
  pages/citizen/  CitizenDashboard, ReportIssue, ComplaintTracking
  pages/ngo/      NgoDashboard
  pages/business/ BusinessDashboard
  pages/authority/AuthorityDashboard
```

## Features & Architecture

- Standalone React + Vite application with Tailwind CSS and React Router.
- Full role-based user flows (Citizen, NGO, Corporate CSR, Municipal Authority).
- Client-side mock state management and simulated OTP authentication.
