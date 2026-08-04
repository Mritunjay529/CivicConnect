import React, { useState } from 'react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Input from '../components/Input';

export default function MunicipalDashboard({
  user,
  complaints = [],
  onUpdateComplaintStatus
}) {
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedId, setSelectedId] = useState(complaints[0]?.id || null);

  const departments = [
    { value: 'All', label: 'All Departments' },
    { value: 'Road Repair', label: 'Road Repair & Paving' },
    { value: 'Street Lighting', label: 'Street Lighting & Solar' },
    { value: 'Waste Management', label: 'Waste & Sanitation' },
    { value: 'Traffic Signage', label: 'Traffic & Signage' },
    { value: 'Sanitation & Sewage', label: 'Sewage & Drainage' }
  ];

  // Map priorities to weights for sorting
  const priorityWeight = {
    'High': 3,
    'Medium': 2,
    'Low': 1
  };

  // Filter complaints by Department / Category
  const departmentComplaints = complaints.filter(c => {
    return selectedDept === 'All' || c.category === selectedDept;
  });

  // Sort by AI priority weight (highest first)
  const sortedComplaints = [...departmentComplaints].sort((a, b) => {
    return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
  });

  const selectedComplaint = sortedComplaints.find(c => c.id === selectedId) || sortedComplaints[0];

  const handleUpdateStatus = (id, newStatus) => {
    onUpdateComplaintStatus(id, newStatus);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 flex flex-col gap-8 pb-20">
      {/* Welcome Banner */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white rounded-custom-lg p-6 lg:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-2xl lg:text-3xl font-extrabold">Municipal Control Panel</h2>
          <p className="text-white/80 text-sm max-w-[500px]">
            Review incoming citizen reports categorized and sorted by AI priority weighting. Dispatch field crews and log progress updates.
          </p>
        </div>
        <div className="w-full sm:w-64 bg-white/10 p-2.5 rounded-custom-lg border border-white/10">
          <span className="text-[10px] uppercase font-bold text-white/70 block mb-1">Active Department View</span>
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setSelectedId(null); // Reset detail view
            }}
            className="w-full bg-transparent text-white font-semibold text-sm outline-none border-none cursor-pointer focus:ring-0"
          >
            {departments.map(d => (
              <option key={d.value} value={d.value} className="text-secondary bg-white">
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Numerical Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4 flex items-center gap-4 bg-white">
          <span className="material-symbols-outlined text-[32px] text-primary bg-surface-low p-3 rounded-custom-lg">
            list_alt
          </span>
          <div>
            <h4 className="text-2xl font-black text-secondary">{sortedComplaints.length}</h4>
            <p className="text-xs text-secondary/50 font-bold uppercase">Total Tickets</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-white">
          <span className="material-symbols-outlined text-[32px] text-error bg-error-container p-3 rounded-custom-lg">
            priority_high
          </span>
          <div>
            <h4 className="text-2xl font-black text-error">
              {sortedComplaints.filter(c => c.priority === 'High' && c.status !== 'Resolved').length}
            </h4>
            <p className="text-xs text-secondary/50 font-bold uppercase">High Priority Open</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-white">
          <span className="material-symbols-outlined text-[32px] text-amber-600 bg-amber-50 p-3 rounded-custom-lg">
            progress_activity
          </span>
          <div>
            <h4 className="text-2xl font-black text-secondary">
              {sortedComplaints.filter(c => c.status === 'In Progress').length}
            </h4>
            <p className="text-xs text-secondary/50 font-bold uppercase">In Progress</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-white">
          <span className="material-symbols-outlined text-[32px] text-green-700 bg-green-50 p-3 rounded-custom-lg">
            task_alt
          </span>
          <div>
            <h4 className="text-2xl font-black text-secondary">
              {sortedComplaints.filter(c => c.status === 'Resolved').length}
            </h4>
            <p className="text-xs text-secondary/50 font-bold uppercase">Resolved Tickets</p>
          </div>
        </Card>
      </div>

      {/* Queue Split-Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Sorted Queue List (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2">
          <div className="flex justify-between items-center px-1 border-b border-border-custom pb-2">
            <span className="text-xs font-bold text-secondary/50 uppercase tracking-wider">AI Sorted Queue List</span>
            <span className="text-[10px] text-primary bg-primary/10 font-bold px-2 py-0.5 rounded-full border border-primary/20">Priority Order</span>
          </div>

          {sortedComplaints.length === 0 ? (
            <Card className="text-center py-12 text-secondary/40">
              <p className="text-sm font-semibold">No complaints registered in this department queue.</p>
            </Card>
          ) : (
            sortedComplaints.map((item) => (
              <Card
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`flex gap-4 p-4 border transition-all duration-200 ${
                  (selectedComplaint && selectedComplaint.id === item.id)
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
                    <div className="flex gap-1.5 items-center">
                      <Badge variant={item.priority === 'High' ? 'danger' : 'warning'}>
                        {item.priority}
                      </Badge>
                      <Badge variant={item.status === 'Resolved' ? 'success' : item.status === 'In Progress' ? 'warning' : 'info'}>
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-secondary truncate">{item.title}</h4>
                  <p className="text-[11px] text-secondary/50 font-semibold flex items-center gap-0.5 truncate">
                    <span className="material-symbols-outlined text-[13px]">location_on</span>
                    {item.location}
                  </p>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Right Side: Action Console Detail Panel (7 Columns) */}
        <div className="lg:col-span-7">
          {selectedComplaint ? (
            <Card className="flex flex-col gap-6">
              {/* Header and Details */}
              <div className="relative rounded-custom-lg overflow-hidden border border-border-custom max-h-[250px]">
                <img
                  src={selectedComplaint.imageUrl}
                  alt={selectedComplaint.title}
                  className="w-full object-cover max-h-[250px]"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant={selectedComplaint.priority === 'High' ? 'danger' : 'warning'}>
                    AI priority: {selectedComplaint.priority}
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
                  Citizen Contact: {selectedComplaint.reportedBy}
                </p>
                <p className="text-xs text-secondary/50 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  {selectedComplaint.location}
                </p>
                <p className="text-sm text-secondary/80 leading-relaxed mt-2 bg-background p-4 rounded-custom-lg border border-border-custom">
                  {selectedComplaint.description}
                </p>
              </div>

              {/* Status Update Actions Bar */}
              <div className="bg-surface-low border border-border-custom p-4 rounded-custom-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-xs font-bold text-secondary/50 uppercase tracking-wider block mb-1">Update Ticket State</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-secondary">Current Status:</span>
                    <Badge variant={selectedComplaint.status === 'Resolved' ? 'success' : selectedComplaint.status === 'In Progress' ? 'warning' : 'info'}>
                      {selectedComplaint.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  {selectedComplaint.status === 'Pending' && (
                    <Button
                      variant="secondary"
                      onClick={() => handleUpdateStatus(selectedComplaint.id, 'In Progress')}
                      className="flex-1 sm:flex-none h-10 min-h-0 text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
                    >
                      Mark In Progress
                    </Button>
                  )}
                  {selectedComplaint.status !== 'Resolved' && (
                    <Button
                      variant="primary"
                      onClick={() => handleUpdateStatus(selectedComplaint.id, 'Resolved')}
                      className="flex-1 sm:flex-none h-10 min-h-0 text-xs text-primary-on"
                    >
                      Mark Resolved
                    </Button>
                  )}
                  {selectedComplaint.status === 'Resolved' && (
                    <span className="text-xs font-bold text-green-700 flex items-center gap-1 bg-green-100 px-3 py-2 rounded-custom-lg border border-green-200">
                      <span className="material-symbols-outlined text-[16px]">done_all</span>
                      Resolved & Documented
                    </span>
                  )}
                </div>
              </div>

              {/* Workflow timeline updates */}
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-bold text-secondary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-primary">timeline</span>
                  Resolution Timeline History
                </h4>
                
                <div className="relative border-l-2 border-border-custom ml-3 pl-4 flex flex-col gap-4">
                  {selectedComplaint.updates?.map((upd, index) => (
                    <div key={index} className="relative">
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
              <p className="font-semibold text-sm">Select an active ticket from the queue to process resolution actions.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
