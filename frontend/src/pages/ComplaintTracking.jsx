import React, { useState } from 'react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';

export default function ComplaintTracking({ user, complaints = [] }) {
  const [filterStatus, setFilterStatus] = useState('All'); // All, Pending, In Progress, Resolved
  const [onlyMine, setOnlyMine] = useState(false);
  const [selectedId, setSelectedId] = useState(complaints[0]?.id || null);

  const selectedComplaint = complaints.find(c => c.id === selectedId);

  // Apply filters
  const filteredComplaints = complaints.filter(c => {
    const statusMatch = filterStatus === 'All' || c.status === filterStatus;
    const userMatch = !onlyMine || (user && c.reportedBy === user.name);
    return statusMatch && userMatch;
  });

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 flex flex-col gap-6 pb-20">
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-secondary">Complaint Tracking Queue</h2>
          <p className="text-sm text-secondary/60">Monitor current repair tickets and municipal workflow resolution states.</p>
        </div>

        {/* Filter Toggle for My Reports */}
        {user && user.role === 'Citizen' && (
          <label className="inline-flex items-center gap-2 cursor-pointer bg-white border border-border-custom px-4 py-2.5 rounded-custom-lg text-xs font-bold text-secondary hover:border-primary transition-all">
            <input
              type="checkbox"
              checked={onlyMine}
              onChange={(e) => setOnlyMine(e.target.checked)}
              className="rounded-custom-sm h-4 w-4 accent-primary"
            />
            <span>Show Only My Reports</span>
          </label>
        )}
      </div>

      {/* Tabs list */}
      <div className="flex gap-2 border-b border-border-custom pb-1 overflow-x-auto">
        {['All', 'Pending', 'In Progress', 'Resolved'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
              filterStatus === status
                ? 'border-primary text-primary'
                : 'border-transparent text-secondary/60 hover:text-primary/70'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* 2-Column Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Complaints List (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2">
          {filteredComplaints.length === 0 ? (
            <Card className="text-center py-12 text-secondary/50 flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-[48px] text-secondary/30">assignment_late</span>
              <p className="font-semibold text-sm">No complaints found</p>
              <p className="text-xs">Try changing the status tabs or reports filters above.</p>
            </Card>
          ) : (
            filteredComplaints.map((item) => (
              <Card
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`flex gap-4 p-4 border transition-all duration-200 ${
                  selectedId === item.id 
                    ? 'border-primary bg-surface-low/30 shadow-sm' 
                    : 'border-border-custom hover:border-primary/50'
                }`}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded-custom-lg border border-border-custom"
                />
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-bold text-secondary/40">{item.id}</span>
                    <Badge variant={item.status === 'Resolved' ? 'success' : item.status === 'In Progress' ? 'warning' : 'info'}>
                      {item.status}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-bold text-secondary truncate">{item.title}</h4>
                  <p className="text-[11px] text-secondary/60 flex items-center gap-0.5 truncate">
                    <span className="material-symbols-outlined text-[13px]">location_on</span>
                    {item.location}
                  </p>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Right Side: Detail Panel (7 Columns) */}
        <div className="lg:col-span-7">
          {selectedComplaint ? (
            <Card className="flex flex-col gap-6">
              {/* Photo & Basic Details */}
              <div className="relative rounded-custom-lg overflow-hidden border border-border-custom max-h-[250px]">
                <img
                  src={selectedComplaint.imageUrl}
                  alt={selectedComplaint.title}
                  className="w-full object-cover max-h-[250px]"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant={selectedComplaint.priority === 'High' ? 'danger' : 'warning'}>
                    Priority: {selectedComplaint.priority}
                  </Badge>
                  <Badge variant="secondary">
                    {selectedComplaint.category}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-secondary">{selectedComplaint.title}</h3>
                  <span className="text-xs text-secondary/50 font-semibold">{selectedComplaint.date}</span>
                </div>
                <p className="text-xs text-secondary/50 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">person</span>
                  Reported by: {selectedComplaint.reportedBy}
                </p>
                <p className="text-xs text-secondary/50 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  {selectedComplaint.location}
                </p>
                <p className="text-sm text-secondary/80 leading-relaxed mt-2 bg-background p-4 rounded-custom-lg border border-border-custom">
                  {selectedComplaint.description}
                </p>
              </div>

              {/* Workflow timeline */}
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-bold text-secondary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-primary">timeline</span>
                  Resolution Progress History
                </h4>
                
                <div className="relative border-l-2 border-border-custom ml-3 pl-4 flex flex-col gap-4">
                  {selectedComplaint.updates?.map((upd, index) => (
                    <div key={index} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white ring-2 ring-primary/20" />
                      <p className="text-[10px] text-secondary/50 font-bold">{upd.date}</p>
                      <p className="text-xs text-secondary/80 mt-0.5">{upd.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="text-center py-20 text-secondary/40 flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-[64px] text-secondary/20">visibility</span>
              <p className="font-semibold text-sm">Select a complaint from the list to view live tracking details.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
