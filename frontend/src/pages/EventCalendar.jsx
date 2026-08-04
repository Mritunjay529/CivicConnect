import React, { useState } from 'react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Input from '../components/Input';

export default function EventCalendar({ user, events = [], onAddEvent, onRsvpEvent }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEventData, setNewEventData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    time: '',
    sponsoredBy: ''
  });

  const handleRsvp = (eventId) => {
    if (!user) {
      alert('Please log in to RSVP for community events.');
      return;
    }
    onRsvpEvent(eventId, user.name);
  };

  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!newEventData.title || !newEventData.location || !newEventData.date || !newEventData.time) {
      alert('Please fill out all required fields.');
      return;
    }

    const createdEvent = {
      id: 'evt-' + Math.floor(Math.random() * 1000),
      title: newEventData.title,
      description: newEventData.description,
      organizer: user.name,
      organizerRole: user.role,
      location: newEventData.location,
      date: newEventData.date,
      time: newEventData.time,
      rsvps: [],
      sponsoredBy: newEventData.sponsoredBy || null
    };

    onAddEvent(createdEvent);
    setShowCreateModal(false);
    setNewEventData({ title: '', description: '', location: '', date: '', time: '', sponsoredBy: '' });
  };

  const isNgoOrBiz = user && (user.role === 'NGO' || user.role === 'Business');

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 flex flex-col gap-8 pb-20">
      {/* Header section with Create trigger */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-secondary">Community Event Calendar</h2>
          <p className="text-sm text-secondary/60">Interact and RSVP to neighborhood forums, green programs, and educational seminars.</p>
        </div>

        {isNgoOrBiz && (
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            icon="add_circle"
            className="w-full sm:w-auto h-12"
          >
            Create Event
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Simulated Month Calendar Grid (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4 border-b border-border-custom pb-2">
              <h4 className="text-sm font-bold text-secondary flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px] text-primary">calendar_month</span>
                August 2026
              </h4>
              <div className="flex gap-1">
                <span className="material-symbols-outlined text-[18px] text-secondary/40 hover:text-primary cursor-pointer">chevron_left</span>
                <span className="material-symbols-outlined text-[18px] text-secondary/40 hover:text-primary cursor-pointer">chevron_right</span>
              </div>
            </div>
            {/* Week headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-secondary/40 uppercase mb-1">
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
            </div>
            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-secondary">
              {Array.from({ length: 31 }, (_, idx) => {
                const day = idx + 1;
                // Highlight days where events exist (Aug 8, 10, 12, 14, 20)
                const hasEvent = [8, 10, 12, 14, 20].includes(day);
                return (
                  <div
                    key={day}
                    className={`aspect-square flex items-center justify-center rounded-custom-sm cursor-pointer transition-all ${
                      hasEvent 
                        ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white' 
                        : 'hover:bg-surface-low'
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-4 bg-surface-low/30 border-dashed border-2 flex flex-col gap-2">
            <h5 className="text-xs font-bold text-secondary">Calendar Guide</h5>
            <div className="flex items-center gap-2 text-xs text-secondary/70">
              <span className="w-3 h-3 rounded-full bg-primary/20 border border-primary/30" />
              <span>Days with registered community actions</span>
            </div>
            <p className="text-[11px] text-secondary/50 leading-relaxed mt-1">
              Select highlighted days to inspect schedules, or scroll through the list on the right.
            </p>
          </Card>
        </div>

        {/* Right Column: Events Feed (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <h3 className="text-lg font-bold text-secondary flex items-center gap-2">
            Upcoming Events Scheduler
            <Badge variant="secondary">{events.length} Events Listed</Badge>
          </h3>

          <div className="flex flex-col gap-6">
            {events.map((evt) => {
              const userHasRsvped = user && evt.rsvps.includes(user.name);
              return (
                <Card key={evt.id} className="flex flex-col md:flex-row gap-6 p-6 hover:border-primary/40 transition-all duration-200">
                  {/* Left Side: Date Block */}
                  <div className="flex flex-row md:flex-col items-center justify-center md:justify-start gap-1 bg-surface-low p-4 rounded-custom-lg border border-border-custom min-w-[80px]">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-secondary/50">Aug</span>
                    <span className="text-3xl font-black text-primary leading-none">{evt.date.split('-')[2] || '08'}</span>
                    <span className="text-[10px] text-secondary/50 font-semibold">{evt.date.split('-')[0]}</span>
                  </div>

                  {/* Right Side: Details */}
                  <div className="flex-1 flex flex-col gap-3 justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <Badge variant="primary">{evt.organizerRole}</Badge>
                        {evt.sponsoredBy && (
                          <Badge variant="success">Sponsored by {evt.sponsoredBy}</Badge>
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-secondary">{evt.title}</h4>
                      <p className="text-xs text-secondary/60 font-semibold flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[16px] text-primary">pin_drop</span>
                        {evt.location}
                      </p>
                      <p className="text-xs text-secondary/60 font-semibold flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
                        {evt.time}
                      </p>
                      <p className="text-sm text-secondary/70 mt-2 leading-relaxed">
                        {evt.description}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-border-custom">
                      <span className="text-xs text-secondary/60 font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-primary">how_to_reg</span>
                        {evt.rsvps.length} Attending
                      </span>

                      {userHasRsvped ? (
                        <Button variant="secondary" disabled className="h-10 min-h-0 text-xs text-green-700 bg-green-50 border-green-200">
                          <span className="material-symbols-outlined mr-1">done</span>
                          Going
                        </Button>
                      ) : (
                        <Button variant="primary" onClick={() => handleRsvp(evt.id)} className="h-10 min-h-0 text-xs px-4">
                          RSVP Go
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-secondary/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <Card className="w-full max-w-[500px] flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-border-custom pb-3">
              <h3 className="text-lg font-bold text-secondary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary">add_circle</span>
                Schedule a New Event
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-secondary/55 hover:text-error">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="flex flex-col gap-4">
              <Input
                label="Event Title"
                placeholder="e.g. Smart City Infrastructure Town Hall"
                value={newEventData.title}
                onChange={(e) => setNewEventData({ ...newEventData, title: e.target.value })}
                required
              />

              <Input
                label="Description"
                type="textarea"
                placeholder="Details about the event, objectives, and agenda."
                value={newEventData.description}
                onChange={(e) => setNewEventData({ ...newEventData, description: e.target.value })}
                required
              />

              <Input
                label="Location Address"
                placeholder="e.g. City Auditorium Hall A"
                value={newEventData.location}
                onChange={(e) => setNewEventData({ ...newEventData, location: e.target.value })}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Date"
                  type="date"
                  value={newEventData.date}
                  onChange={(e) => setNewEventData({ ...newEventData, date: e.target.value })}
                  required
                />
                <Input
                  label="Time Span"
                  placeholder="e.g. 10:00 AM - 1:00 PM"
                  value={newEventData.time}
                  onChange={(e) => setNewEventData({ ...newEventData, time: e.target.value })}
                  required
                />
              </div>

              <Input
                label="Corporate Sponsor (Optional)"
                placeholder="e.g. EcoTech Innovations"
                value={newEventData.sponsoredBy}
                onChange={(e) => setNewEventData({ ...newEventData, sponsoredBy: e.target.value })}
              />

              <div className="pt-4 border-t border-border-custom flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setShowCreateModal(false)} className="h-10 min-h-0 text-xs">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="h-10 min-h-0 text-xs">
                  Publish Event
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
