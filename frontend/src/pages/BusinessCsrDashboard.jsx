import React, { useState } from 'react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Input from '../components/Input';

export default function BusinessCsrDashboard({
  user,
  initiatives = [],
  events = [],
  onAddInitiative,
  onSponsorEvent
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newInit, setNewInit] = useState({
    title: '',
    description: '',
    budget: '',
    impactMetric: '',
    eventId: ''
  });

  if (!user) {
    return <div className="p-6 text-center text-secondary">Loading Profile Context...</div>;
  }

  // Filter initiatives created by this corporate business
  const bizInitiatives = initiatives.filter(init => init.businessName === user.name || init.businessId === user.id);

  // Filter unsponsored events that are eligible for sponsorship
  const unsponsoredEvents = events.filter(evt => !evt.sponsoredBy);

  const handleCreateInitiative = (e) => {
    e.preventDefault();
    if (!newInit.title || !newInit.budget) {
      alert('Please fill out all required fields.');
      return;
    }

    const createdInit = {
      id: 'init-' + Math.floor(Math.random() * 1000),
      title: newInit.title,
      description: newInit.description,
      businessName: user.name,
      businessId: user.id,
      sponsoredEventId: newInit.eventId || null,
      budget: '$' + newInit.budget.replace('$', ''),
      impactMetric: newInit.impactMetric || 'Pending project deployment verification'
    };

    onAddInitiative(createdInit);

    // If an event was selected to sponsor, update the event sponsor in state
    if (newInit.eventId) {
      onSponsorEvent(newInit.eventId, user.name);
    }

    setShowCreateModal(false);
    setNewInit({ title: '', description: '', budget: '', impactMetric: '', eventId: '' });
  };

  const handleDirectSponsor = (eventId) => {
    onSponsorEvent(eventId, user.name);
    
    // Auto-create matching initiative
    const matchingEvent = events.find(e => e.id === eventId);
    const generatedInit = {
      id: 'init-' + Math.floor(Math.random() * 1000),
      title: `Event Sponsorship: ${matchingEvent.title}`,
      description: `Corporate funding for logistics, refreshments, and coordinator salaries for the community event.`,
      businessName: user.name,
      businessId: user.id,
      sponsoredEventId: eventId,
      budget: '$5,000',
      impactMetric: `Helped fund gathering space for estimated ${matchingEvent.rsvps.length + 10} neighborhood attendees.`
    };
    onAddInitiative(generatedInit);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 flex flex-col gap-8 pb-20">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white rounded-custom-lg p-6 lg:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-2xl lg:text-3xl font-extrabold">{user.name} CSR Hub</h2>
          <p className="text-white/80 text-sm max-w-[500px]">
            Publish funding initiatives, sponsor NGO projects, and track ESG environmental metrics.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          icon="add_circle"
          className="w-full sm:w-auto text-primary-on border-white/20"
        >
          Create CSR Initiative
        </Button>
      </section>

      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4 flex items-center gap-4">
          <span className="material-symbols-outlined text-[32px] text-primary bg-surface-low p-3 rounded-custom-lg">
            payments
          </span>
          <div>
            <h4 className="text-2xl font-black text-secondary">
              ${bizInitiatives.reduce((acc, curr) => acc + parseInt(curr.budget.replace(/[^0-9]/g, '') || 0), 0).toLocaleString()}
            </h4>
            <p className="text-xs text-secondary/50 font-bold uppercase">Budget Deployed</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <span className="material-symbols-outlined text-[32px] text-primary bg-surface-low p-3 rounded-custom-lg">
            verified
          </span>
          <div>
            <h4 className="text-2xl font-black text-secondary">{bizInitiatives.length}</h4>
            <p className="text-xs text-secondary/50 font-bold uppercase">Funded Initiatives</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <span className="material-symbols-outlined text-[32px] text-primary bg-surface-low p-3 rounded-custom-lg">
            spa
          </span>
          <div>
            <h4 className="text-2xl font-black text-secondary">A+ Rank</h4>
            <p className="text-xs text-secondary/50 font-bold uppercase">ESG Rating</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: CSR Initiatives & Impact (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <h3 className="text-lg font-bold text-secondary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[22px]">spa</span>
            Initiatives & ESG Impact Ledger
          </h3>

          <div className="flex flex-col gap-4">
            {bizInitiatives.map((init) => (
              <Card key={init.id} className="p-4 flex flex-col gap-3 hover:border-primary/30 transition-all duration-200">
                <div className="flex justify-between items-start">
                  <h4 className="text-base font-bold text-secondary">{init.title}</h4>
                  <Badge variant="success" className="font-mono">{init.budget}</Badge>
                </div>
                <p className="text-xs text-secondary/60 leading-relaxed">{init.description}</p>
                
                <div className="mt-2 pt-2 border-t border-border-custom flex flex-col gap-1 text-[11px] text-secondary/65">
                  <p className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-primary">analytics</span>
                    <span className="font-semibold text-secondary">Verified ESG Metric:</span> {init.impactMetric}
                  </p>
                  {init.sponsoredEventId && (
                    <p className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-primary">link</span>
                      <span className="font-semibold text-secondary">Sponsored Event ID:</span> {init.sponsoredEventId}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right: Sponsor Opportunities & ESG Chart (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          {/* Sponsor Center */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-secondary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[22px]">volunteer_activism</span>
              Events Seeking Corporate Sponsorship
            </h3>

            <div className="flex flex-col gap-4">
              {unsponsoredEvents.length === 0 ? (
                <Card className="text-center py-6 text-secondary/40">
                  <p className="text-sm font-semibold">All community events have been funded!</p>
                </Card>
              ) : (
                unsponsoredEvents.map((evt) => (
                  <Card key={evt.id} className="p-4 flex flex-col gap-3 bg-white">
                    <div>
                      <h4 className="text-sm font-bold text-secondary leading-tight">{evt.title}</h4>
                      <p className="text-[10px] text-secondary/50 font-bold mt-0.5">{evt.organizer} ({evt.organizerRole})</p>
                    </div>
                    <p className="text-[11px] text-secondary/60 line-clamp-2">{evt.description}</p>
                    
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-border-custom">
                      <span className="text-[10px] text-secondary/50 font-semibold">{evt.date}</span>
                      <Button
                        variant="secondary"
                        onClick={() => handleDirectSponsor(evt.id)}
                        className="h-8 min-h-0 text-[10px] px-3 border-primary text-primary"
                      >
                        Sponsor $5,000
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* ESG simulated visual chart */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-secondary">CSR Impact Ledger</h3>
            <Card className="p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-bold text-secondary">
                  <span>Carbon Offset Equivalent</span>
                  <span>78% towards 10k tons goal</span>
                </div>
                <div className="w-full bg-surface-low rounded-full h-3 overflow-hidden border border-border-custom">
                  <div className="bg-primary h-full rounded-full" style={{ width: '78%' }} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-bold text-secondary">
                  <span>Community Members Engaged</span>
                  <span>45% towards 5,000 goal</span>
                </div>
                <div className="w-full bg-surface-low rounded-full h-3 overflow-hidden border border-border-custom">
                  <div className="bg-primary h-full rounded-full" style={{ width: '45%' }} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-bold text-secondary">
                  <span>Urban Spaces Repaired</span>
                  <span>92% towards 20 parks goal</span>
                </div>
                <div className="w-full bg-surface-low rounded-full h-3 overflow-hidden border border-border-custom">
                  <div className="bg-primary h-full rounded-full" style={{ width: '92%' }} />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Create CSR Initiative Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-secondary/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <Card className="w-full max-w-[500px] flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-border-custom pb-3">
              <h3 className="text-lg font-bold text-secondary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary">add_chart</span>
                Launch CSR Initiative
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-secondary/55 hover:text-error">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateInitiative} className="flex flex-col gap-4">
              <Input
                label="Initiative Campaign Title"
                placeholder="e.g. Clean Energy Neighborhood Fund"
                value={newInit.title}
                onChange={(e) => setNewInit({ ...newInit, title: e.target.value })}
                required
              />

              <Input
                label="Campaign Description"
                type="textarea"
                placeholder="Details of the initiative, corporate alignment, and target objectives."
                value={newInit.description}
                onChange={(e) => setNewInit({ ...newInit, description: e.target.value })}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Budget Allocation ($)"
                  type="number"
                  placeholder="25000"
                  value={newInit.budget}
                  onChange={(e) => setNewInit({ ...newInit, budget: e.target.value })}
                  required
                />
                <Input
                  label="Link to Open Event (Optional)"
                  type="select"
                  value={newInit.eventId}
                  onChange={(e) => setNewInit({ ...newInit, eventId: e.target.value })}
                  options={[
                    { value: '', label: 'None - Direct Fund' },
                    ...unsponsoredEvents.map(evt => ({ value: evt.id, label: evt.title }))
                  ]}
                />
              </div>

              <Input
                label="Projected Impact Metric Target"
                placeholder="e.g. Plants 500 trees, reducing CO2 by 5 tons annually."
                value={newInit.impactMetric}
                onChange={(e) => setNewInit({ ...newInit, impactMetric: e.target.value })}
              />

              <div className="pt-4 border-t border-border-custom flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setShowCreateModal(false)} className="h-10 min-h-0 text-xs">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="h-10 min-h-0 text-xs">
                  Publish ESG Campaign
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
