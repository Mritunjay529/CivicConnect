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

## What's mocked vs. real

- All pages are fully functional React components with local state (`useState`) and routing.
- Data (complaints, opportunities, events, notifications) is hardcoded — no backend calls yet.
- Forms navigate on submit but don't persist data — wire these up to your MERN API
  (`/api/auth`, `/api/complaints`, `/api/opportunities`, etc.) next.
- The "AI suggests: category + priority" bit on the Report Issue page is a simple
  keyword mock — replace with a real call to your AI service.

## Next steps

1. Add an Express + MongoDB backend and connect forms via `fetch`/`axios`.
2. Add JWT-based auth and protect role-specific routes.
3. Replace mock data with API responses.
4. Wire the AI category/priority suggestion and volunteer-matching to a real model or LLM call.
