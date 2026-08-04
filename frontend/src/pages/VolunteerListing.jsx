import React, { useState } from 'react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Input from '../components/Input';

export default function VolunteerListing({ user, opportunities = [], onApplyOpportunity }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [appliedOppTitle, setAppliedOppTitle] = useState('');

  // Extract unique locations and categories for filter options
  const categories = ['All', ...new Set(opportunities.map(o => o.category))];
  const locations = ['All', ...new Set(opportunities.map(o => o.location.split(',')[0].trim()))];

  const handleApply = (opp) => {
    if (!user) {
      alert('Please log in as a Citizen to apply for volunteering opportunities.');
      return;
    }
    if (user.role !== 'Citizen') {
      alert('Only Citizen accounts can sign up for volunteer positions.');
      return;
    }

    onApplyOpportunity(opp.id, user.name);
    setAppliedOppTitle(opp.title);
    setShowSuccessModal(true);
  };

  // Filter
  const filteredOpps = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          opp.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || opp.category === selectedCategory;
    const matchesLocation = selectedLocation === 'All' || opp.location.includes(selectedLocation);
    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 flex flex-col gap-6 pb-20">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-secondary">Volunteer Opportunities</h2>
        <p className="text-sm text-secondary/60">Find and apply for local service initiatives hosted by registered NGOs.</p>
      </div>

      {/* Filter panel */}
      <Card className="p-4 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <Input
            placeholder="Search keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-48">
          <Input
            type="select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={categories.map(c => ({ value: c, label: c }))}
            placeholder="Filter Category"
          />
        </div>
        <div className="w-full md:w-48">
          <Input
            type="select"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            options={locations.map(l => ({ value: l, label: l }))}
            placeholder="Filter Area"
          />
        </div>
      </Card>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredOpps.length === 0 ? (
          <div className="col-span-2 text-center py-16 text-secondary/40 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-[64px] text-secondary/20">search_off</span>
            <p className="font-semibold text-sm">No volunteering opportunities match your filter parameters.</p>
          </div>
        ) : (
          filteredOpps.map((opp) => {
            const hasApplied = user && opp.volunteers.includes(user.name);
            const isFull = opp.appliedCount >= opp.capacity;

            return (
              <Card key={opp.id} className="flex flex-col gap-4 justify-between h-full hover:border-primary/50 transition-all duration-200">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-2">
                    <Badge variant={
                      opp.category === 'Environment' ? 'success' : opp.category === 'Social Support' ? 'warning' : 'info'
                    }>
                      {opp.category}
                    </Badge>
                    <span className="text-xs text-secondary/50 font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">event</span>
                      {opp.date}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-secondary">{opp.title}</h3>
                    <p className="text-xs text-primary font-bold mt-0.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">corporate_fare</span>
                      Organized by {opp.ngoName}
                    </p>
                  </div>

                  <p className="text-sm text-secondary/70 leading-relaxed line-clamp-3">
                    {opp.description}
                  </p>

                  <div className="text-xs text-secondary/60 flex flex-col gap-1.5 mt-2 bg-surface-low/30 p-3 rounded-custom-lg border border-border-custom">
                    <p className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                      <span className="font-semibold text-secondary">Location:</span> {opp.location}
                    </p>
                    <p className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-primary">group</span>
                      <span className="font-semibold text-secondary">Volunteers Joined:</span> {opp.appliedCount} / {opp.capacity} ({opp.capacity - opp.appliedCount} spots left)
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border-custom flex justify-end">
                  {hasApplied ? (
                    <Button variant="secondary" disabled className="w-full sm:w-auto text-green-700 bg-green-50 border-green-200">
                      <span className="material-symbols-outlined mr-2">check_circle</span>
                      Applied Successfully
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => handleApply(opp)}
                      disabled={isFull}
                      className="w-full sm:w-auto"
                    >
                      {isFull ? 'Opportunity Full' : 'Apply Now'}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-secondary/40 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-fade-in">
          <Card className="w-full max-w-[450px] text-center flex flex-col gap-6 scale-up-animation">
            <div className="flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-[64px] text-green-700 bg-green-100 p-4 rounded-full">
                celebration
              </span>
              <h3 className="text-xl font-bold text-secondary">Application Registered!</h3>
              <p className="text-sm text-secondary/70">
                You've successfully applied for: <span className="font-bold text-primary block mt-1">"{appliedOppTitle}"</span>
              </p>
              <p className="text-xs text-secondary/50">
                The organizing NGO has been notified. They will contact you via email with meeting coordinates.
              </p>
            </div>
            <div className="flex justify-center">
              <Button variant="primary" onClick={() => setShowSuccessModal(false)} className="px-8">
                Awesome
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
