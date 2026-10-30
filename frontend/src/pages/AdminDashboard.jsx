import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';

export default function AdminDashboard({ user, complaints = [], opportunities = [], events = [], initiatives = [] }) {
  const navigate = useNavigate();
  const openComplaints = complaints.filter((item) => !['resolved', 'completed'].includes(String(item.status || '').toLowerCase()));
  const stats = [
    { label: 'Total Complaints (loaded)', value: complaints.length, icon: 'campaign' },
    { label: 'Open Complaints (loaded)', value: openComplaints.length, icon: 'pending_actions' },
    { label: 'Opportunities', value: opportunities.length, icon: 'volunteer_activism' },
    { label: 'Events & CSR Initiatives', value: events.length + initiatives.length, icon: 'event' }
  ];

  return (
    <div className="px-4 sm:px-6 py-8 flex flex-col gap-8">
      <section className="rounded-2xl bg-gradient-to-r from-teal-800 to-teal-600 text-white p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wider opacity-80">CivicConnect Administration</p>
        <h1 className="text-3xl font-extrabold mt-2">Welcome, {user?.name || 'Administrator'}</h1>
        <p className="mt-2 opacity-90">Admin access is active. Review the current project overview and open the municipal complaint workspace.</p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5 flex items-center gap-4">
            <span className="material-symbols-outlined text-3xl text-primary">{stat.icon}</span>
            <div><p className="text-2xl font-extrabold text-secondary">{stat.value}</p><p className="text-xs font-bold uppercase tracking-wide text-secondary/60">{stat.label}</p></div>
          </Card>
        ))}
      </section>

      <Card className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-secondary">Complaint management</h2>
          <p className="text-sm text-secondary/70 mt-1">Open the existing municipal dashboard to inspect and update complaint statuses.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/municipal-dashboard')}>Open Complaint Workspace</Button>
      </Card>

      <p className="text-xs text-secondary/50">Overview counts reflect data currently loaded by the frontend; this page does not modify or delete database records.</p>
    </div>
  );
}
