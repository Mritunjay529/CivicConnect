import React, { useState } from 'react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Input from '../components/Input';

export default function VolunteerListing({ user, opportunities = [], initiatives = [], onApplyOpportunity }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedType, setSelectedType] = useState('All'); // 'All' | 'volunteer' | 'csr'
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [appliedOppTitle, setAppliedOppTitle] = useState('');
  const [supportedInits, setSupportedInits] = useState({});

  const [isApplying, setIsApplying] = useState(false);

  // Combine all organization activities (volunteer + CSR)
  const allActivities = [
    ...opportunities,
    ...initiatives.filter(
      (init) => !opportunities.some((opp) => (opp.id || opp._id) === (init.id || init._id))
    )
  ];

  // Extract unique locations and categories for filter options
  const categories = ['All', ...new Set(allActivities.map((o) => o.category).filter(Boolean))];
  const locations = [
    'All',
    ...new Set(
      allActivities
        .map((o) => (o.location ? o.location.split(',')[0].trim() : ''))
        .filter(Boolean)
    )
  ];

  const handleApply = async (opp) => {
    if (!user) {
      alert('Please log in as a Citizen to apply for volunteering opportunities.');
      return;
    }
    const roleLower = (user.role || '').toLowerCase();
    if (roleLower !== 'citizen') {
      alert('Only Citizen accounts can sign up for volunteer positions.');
      return;
    }

    setIsApplying(true);
    try {
      await onApplyOpportunity(opp.id || opp._id, user.name);
      setAppliedOppTitle(opp.title);
      setShowSuccessModal(true);
    } catch (err) {
      alert('Failed to submit application: ' + (err.message || 'Please try again.'));
    } finally {
      setIsApplying(false);
    }
  };

  const handleSupportCsr = (id) => {
    setSupportedInits((prev) => ({ ...prev, [id]: true }));
  };

  // Filter
  const filteredActivities = allActivities.filter((opp) => {
    const oppType = opp.type || (opp.budget ? 'csr' : 'volunteer');
    const matchesType = selectedType === 'All' || oppType === selectedType;
    const titleMatch = (opp.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const descMatch = (opp.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const orgMatch = (opp.creatorName || opp.ngoName || opp.businessName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = titleMatch || descMatch || orgMatch;
    const matchesCategory = selectedCategory === 'All' || opp.category === selectedCategory;
    const matchesLocation =
      selectedLocation === 'All' || (opp.location || '').includes(selectedLocation);
    return matchesType && matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 flex flex-col gap-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-secondary">Organization Activities & Civic Opportunities</h2>
          <p className="text-sm text-secondary/60">Explore community drives posted by registered NGOs and corporate CSR programs funded by local businesses.</p>
        </div>

        {/* Activity Type Filter Tabs */}
        <div className="flex bg-surface-low p-1 rounded-custom-lg border border-border-custom self-stretch sm:self-auto">
          <button
            onClick={() => setSelectedType('All')}
            className={`px-3 py-1.5 text-xs font-bold rounded-custom-md transition-all ${
              selectedType === 'All'
                ? 'bg-white text-primary shadow-sm'
                : 'text-secondary/70 hover:text-secondary'
            }`}
          >
            All ({allActivities.length})
          </button>
          <button
            onClick={() => setSelectedType('volunteer')}
            className={`px-3 py-1.5 text-xs font-bold rounded-custom-md transition-all ${
              selectedType === 'volunteer'
                ? 'bg-white text-primary shadow-sm'
                : 'text-secondary/70 hover:text-secondary'
            }`}
          >
            Volunteer Drives ({allActivities.filter(a => a.type !== 'csr').length})
          </button>
          <button
            onClick={() => setSelectedType('csr')}
            className={`px-3 py-1.5 text-xs font-bold rounded-custom-md transition-all ${
              selectedType === 'csr'
                ? 'bg-white text-primary shadow-sm'
                : 'text-secondary/70 hover:text-secondary'
            }`}
          >
            Corporate CSR ({allActivities.filter(a => a.type === 'csr').length})
          </button>
        </div>
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

      {/* Opportunities & CSR Initiatives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredActivities.length === 0 ? (
          <div className="col-span-2 text-center py-16 text-secondary/40 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-[64px] text-secondary/20">search_off</span>
            <p className="font-semibold text-sm">No community activities match your filter parameters.</p>
          </div>
        ) : (
          filteredActivities.map((opp) => {
            const oppId = opp.id || opp._id;
            const isCsr = opp.type === 'csr';
            const userId = (user?._id || user?.id)?.toString();
            const hasApplied =
              user &&
              ((opp.volunteers || []).includes(user.name) ||
                (opp.applications || []).some(
                  (a) =>
                    (a.applicant?._id || a.applicant)?.toString() === userId ||
                    a.applicantName === user.name
                ));
            const appliedCount =
              opp.appliedCount !== undefined
                ? opp.appliedCount
                : opp.applications?.length || 0;
            const capacity = opp.capacity || 10;
            const isFull = appliedCount >= capacity;
            const isSupported = Boolean(supportedInits[oppId]);

            return (
              <Card
                key={oppId}
                className={`flex flex-col gap-4 justify-between h-full hover:border-primary/50 transition-all duration-200 ${
                  isCsr ? 'border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge
                        variant={
                          isCsr
                            ? 'primary'
                            : opp.category === 'Environment'
                            ? 'success'
                            : opp.category === 'Social Support'
                            ? 'warning'
                            : 'info'
                        }
                      >
                        {isCsr ? 'Corporate CSR' : opp.category}
                      </Badge>
                      {isCsr && opp.budget && (
                        <Badge variant="success" className="font-mono font-bold">
                          {opp.budget}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-secondary/50 font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">event</span>
                      {opp.date || 'Active'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-secondary">{opp.title}</h3>
                    <p className="text-xs text-primary font-bold mt-0.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">
                        {isCsr ? 'corporate_fare' : 'volunteer_activism'}
                      </span>
                      {isCsr
                        ? `Funded by ${opp.businessName || opp.creatorName || 'Corporate Partner'}`
                        : `Organized by ${opp.ngoName || opp.creatorName || 'Civic Organization'}`}
                    </p>
                  </div>

                  <p className="text-sm text-secondary/70 leading-relaxed line-clamp-3">
                    {opp.description}
                  </p>

                  {isCsr ? (
                    <div className="text-xs text-secondary/60 flex flex-col gap-1.5 mt-2 bg-surface-low/40 p-3 rounded-custom-lg border border-border-custom">
                      {opp.impactMetric && (
                        <p className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-primary">eco</span>
                          <span className="font-semibold text-secondary">ESG Metric:</span> {opp.impactMetric}
                        </p>
                      )}
                      <p className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                        <span className="font-semibold text-secondary">Target Location:</span> {opp.location || 'Metropolis'}
                      </p>
                    </div>
                  ) : (
                    <div className="text-xs text-secondary/60 flex flex-col gap-1.5 mt-2 bg-surface-low/30 p-3 rounded-custom-lg border border-border-custom">
                      <p className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                        <span className="font-semibold text-secondary">Location:</span> {opp.location}
                      </p>
                      <p className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-primary">group</span>
                        <span className="font-semibold text-secondary">Volunteers Joined:</span> {appliedCount} / {capacity} ({Math.max(0, capacity - appliedCount)} spots left)
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-border-custom flex justify-end">
                  {isCsr ? (
                    <Button
                      variant={isSupported ? "secondary" : "primary"}
                      onClick={() => handleSupportCsr(oppId)}
                      disabled={isSupported}
                      className={`w-full sm:w-auto ${
                        isSupported ? 'text-green-700 bg-green-50 border-green-200' : ''
                      }`}
                    >
                      {isSupported ? (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          Supported (+10 pts)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">thumb_up</span>
                          Support & Follow
                        </span>
                      )}
                    </Button>
                  ) : hasApplied ? (
                    <Button variant="secondary" disabled className="w-full sm:w-auto text-green-700 bg-green-50 border-green-200">
                      <span className="material-symbols-outlined mr-2">check_circle</span>
                      Applied Successfully
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => handleApply(opp)}
                      disabled={isFull || isApplying}
                      className="w-full sm:w-auto"
                    >
                      {isFull ? 'Opportunity Full' : isApplying ? 'Submitting...' : 'Apply Now'}
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
