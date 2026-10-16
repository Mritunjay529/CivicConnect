import React, { useState } from 'react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Input from '../components/Input';

export default function NgoDashboard({
  user,
  opportunities = [],
  initiatives = [],
  applications = [],
  onAddOpportunity,
  onUpdateApplicationStatus
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [partneredInits, setPartneredInits] = useState({});
  const [newOpp, setNewOpp] = useState({
    title: '',
    description: '',
    location: '',
    category: 'Environment',
    date: '',
    capacity: 10
  });

  if (!user) {
    return <div className="p-6 text-center text-secondary">Loading Profile Context...</div>;
  }

  const userId = (user._id || user.id)?.toString();
  const userName = (user.name || user.orgName || '').toLowerCase().trim();

  // Filter opportunities posted by this NGO (robust against MongoDB ID or creatorName)
  const ngoOpps = opportunities.filter((opp) => {
    // Only volunteer opportunities posted by this NGO
    if (opp.type === 'csr') return false;
    const oppCreatorId = (opp.creator?._id || opp.creator || opp.ngoId)?.toString();
    const oppCreatorName = (opp.creatorName || opp.ngoName || '').toLowerCase().trim();
    const idMatch = userId && oppCreatorId && userId === oppCreatorId;
    const nameMatch = userName && oppCreatorName && (oppCreatorName.includes(userName) || userName.includes(oppCreatorName));
    return idMatch || nameMatch;
  });

  // Corporate CSR activities posted by businesses that NGOs can partner with or view
  const allCsrList = [
    ...initiatives,
    ...opportunities.filter(
      (o) => o.type === 'csr' && !initiatives.some((i) => (i.id || i._id) === (o.id || o._id))
    )
  ];

  const totalCsrBudget = allCsrList.reduce((acc, curr) => {
    const num = parseInt((curr.budget || '').replace(/[^0-9]/g, ''), 10) || 0;
    return acc + num;
  }, 0);

  const handlePartner = (initId) => {
    setPartneredInits(prev => ({ ...prev, [initId]: true }));
  };

  const oppIds = ngoOpps.map((opp) => (opp._id || opp.id)?.toString()).filter(Boolean);

  // Filter applications targeting this NGO's opportunities
  const ngoApps = applications.filter((app) => {
    const appOppId = (app.opportunityId?._id || app.opportunityId || app.oppId)?.toString();
    // If applications are fetched specifically for this NGO, show them, or match by oppId
    return oppIds.includes(appOppId) || (!appOppId && applications.length > 0);
  });

  const handlePostOpportunity = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!newOpp.title || !newOpp.location || !newOpp.date) {
      setErrorMsg('Please fill out all required fields.');
      return;
    }

    setIsPosting(true);
    try {
      const createdOpp = {
        title: newOpp.title,
        description: newOpp.description,
        ngoName: user.name || user.orgName,
        ngoId: user._id || user.id,
        location: newOpp.location,
        category: newOpp.category,
        date: newOpp.date,
        capacity: parseInt(newOpp.capacity, 10) || 10
      };

      await onAddOpportunity(createdOpp);
      setShowCreateModal(false);
      setNewOpp({ title: '', description: '', location: '', category: 'Environment', date: '', capacity: 10 });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to post opportunity');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 flex flex-col gap-8 pb-20">
      {/* Header and Banner */}
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white rounded-custom-lg p-6 lg:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-2xl lg:text-3xl font-extrabold">{user.name} Dashboard</h2>
          <p className="text-white/80 text-sm max-w-[500px]">
            Manage volunteer registrations, organize outreach events, and partner on corporate CSR initiatives.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          icon="add_circle"
          className="w-full sm:w-auto text-primary-on"
        >
          Post Opportunity
        </Button>
      </section>

      {/* Grid statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-4 flex items-center gap-4 bg-white">
          <span className="material-symbols-outlined text-[32px] text-primary bg-surface-low p-3 rounded-custom-lg">
            handshake
          </span>
          <div>
            <h4 className="text-2xl font-black text-secondary">{ngoOpps.length}</h4>
            <p className="text-xs text-secondary/50 font-bold uppercase">Active Programs</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-white">
          <span className="material-symbols-outlined text-[32px] text-primary bg-surface-low p-3 rounded-custom-lg">
            how_to_reg
          </span>
          <div>
            <h4 className="text-2xl font-black text-secondary">
              {ngoApps.filter(a => a.status === 'Approved').length}
            </h4>
            <p className="text-xs text-secondary/50 font-bold uppercase">Approved Volunteers</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-white">
          <span className="material-symbols-outlined text-[32px] text-primary bg-surface-low p-3 rounded-custom-lg">
            pending_actions
          </span>
          <div>
            <h4 className="text-2xl font-black text-secondary">
              {ngoApps.filter(a => a.status === 'Pending').length}
            </h4>
            <p className="text-xs text-secondary/50 font-bold uppercase">Pending Review</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-white">
          <span className="material-symbols-outlined text-[32px] text-primary bg-surface-low p-3 rounded-custom-lg">
            payments
          </span>
          <div>
            <h4 className="text-2xl font-black text-secondary">
              ${totalCsrBudget.toLocaleString()}
            </h4>
            <p className="text-xs text-secondary/50 font-bold uppercase">CSR Grants Available</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Posted Opportunities & CSR Grants (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <h3 className="text-lg font-bold text-secondary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[22px]">list_alt</span>
            Your Recruiting Campaigns
          </h3>

          <div className="flex flex-col gap-4">
            {ngoOpps.length === 0 ? (
              <Card className="text-center py-12 text-secondary/50 flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[48px] text-secondary/30">post_add</span>
                <p className="text-sm font-semibold">No active volunteering campaigns posted</p>
                <Button variant="secondary" onClick={() => setShowCreateModal(true)} className="h-10 min-h-0 text-xs mt-1">
                  Post Your First Campaign
                </Button>
              </Card>
            ) : (
              ngoOpps.map((opp) => (
                <Card key={opp.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-secondary">{opp.title}</h4>
                      <Badge variant="primary">{opp.category}</Badge>
                    </div>
                    <p className="text-xs text-secondary/50 font-semibold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      {opp.location} | Date: {opp.date}
                    </p>
                    <p className="text-[11px] text-secondary/60 mt-1">{opp.description}</p>
                  </div>
                  <div className="bg-surface-low border border-border-custom px-4 py-2 rounded-custom-lg text-center min-w-[100px]">
                    <span className="text-lg font-black text-primary">{opp.appliedCount} / {opp.capacity}</span>
                    <p className="text-[9px] uppercase font-bold text-secondary/50">Joined</p>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Corporate CSR Initiatives Section for NGOs */}
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-secondary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[22px]">corporate_fare</span>
                Corporate CSR Initiatives & Grants Available
              </h3>
              <Badge variant="primary" className="text-xs">{allCsrList.length} Available</Badge>
            </div>

            {allCsrList.length === 0 ? (
              <Card className="text-center py-8 text-secondary/40">
                <p className="text-sm font-semibold">No corporate CSR activities posted yet.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {allCsrList.map((init) => {
                  const initId = init.id || init._id;
                  const isPartnered = partneredInits[initId];
                  return (
                    <Card key={initId} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-l-4 border-l-primary hover:border-primary/40 transition-all">
                      <div className="flex flex-col gap-1 max-w-[550px]">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-secondary">{init.title}</h4>
                          {init.budget && <Badge variant="success" className="font-mono">{init.budget}</Badge>}
                        </div>
                        <p className="text-xs text-primary font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px]">apartment</span>
                          Sponsored by {init.businessName || init.creatorName || 'Corporate Business'}
                        </p>
                        <p className="text-xs text-secondary/70 leading-relaxed mt-0.5">{init.description}</p>
                        {init.impactMetric && (
                          <p className="text-[11px] text-secondary/60 flex items-center gap-1 mt-1">
                            <span className="material-symbols-outlined text-[13px] text-primary">eco</span>
                            <span className="font-semibold text-secondary">Target Impact:</span> {init.impactMetric}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <Button
                          variant={isPartnered ? "secondary" : "primary"}
                          onClick={() => handlePartner(initId)}
                          disabled={isPartnered}
                          className={`h-9 min-h-0 text-xs px-4 ${
                            isPartnered ? 'text-green-700 bg-green-50 border-green-200' : ''
                          }`}
                        >
                          {isPartnered ? (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>
                              Partner Inquired
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">handshake</span>
                              Apply For Grant
                            </span>
                          )}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Manage Applications (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <h3 className="text-lg font-bold text-secondary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[22px]">group</span>
            Volunteers Applications
          </h3>

          <div className="flex flex-col gap-4">
            {ngoApps.length === 0 ? (
              <Card className="text-center py-12 text-secondary/40">
                <p className="text-sm font-semibold">No volunteer registrations registered yet.</p>
              </Card>
            ) : (
              ngoApps.map((app) => (
                <Card key={app.id} className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-secondary">{app.citizenName}</h4>
                      <span className="text-[10px] text-secondary/50 font-semibold">{app.citizenEmail}</span>
                    </div>
                    <Badge variant={app.status === 'Approved' ? 'success' : app.status === 'Rejected' ? 'danger' : 'warning'}>
                      {app.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-secondary/70 italic">Applied for: <span className="font-bold text-primary">"{app.opportunityTitle}"</span></p>

                  {app.status === 'Pending' && (
                    <div className="flex gap-2 justify-end mt-2 pt-2 border-t border-border-custom">
                      <Button
                        variant="secondary"
                        onClick={() => onUpdateApplicationStatus(app.id || app._id, 'Rejected', app.opportunityId)}
                        className="h-8 min-h-0 text-[10px] px-3 font-bold border-error text-error hover:bg-error-container/20"
                      >
                        Reject
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => onUpdateApplicationStatus(app.id || app._id, 'Approved', app.opportunityId)}
                        className="h-8 min-h-0 text-[10px] px-3 font-bold bg-primary text-primary-on"
                      >
                        Approve
                      </Button>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Opportunity Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-secondary/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <Card className="w-full max-w-[500px] flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-border-custom pb-3">
              <h3 className="text-lg font-bold text-secondary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary">post_add</span>
                Post Recruiting Opportunity
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-secondary/55 hover:text-error">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handlePostOpportunity} className="flex flex-col gap-4">
              <Input
                label="Opportunity Title"
                placeholder="e.g. Park Trash Sorting Drive"
                value={newOpp.title}
                onChange={(e) => setNewOpp({ ...newOpp, title: e.target.value })}
                required
              />

              <Input
                label="Scope Description"
                type="textarea"
                placeholder="Detailed description of what volunteers will do, equipment requirements, and schedule."
                value={newOpp.description}
                onChange={(e) => setNewOpp({ ...newOpp, description: e.target.value })}
                required
              />

              <Input
                label="Location Meeting Point"
                placeholder="e.g. 15 North Park Gates, Metropolis"
                value={newOpp.location}
                onChange={(e) => setNewOpp({ ...newOpp, location: e.target.value })}
                required
              />

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Input
                    label="Focus Category"
                    type="select"
                    value={newOpp.category}
                    onChange={(e) => setNewOpp({ ...newOpp, category: e.target.value })}
                    options={[
                      { value: 'Environment', label: 'Environmental Support' },
                      { value: 'Social Support', label: 'Social Kitchen / Care' },
                      { value: 'Education', label: 'Education / Mentorship' }
                    ]}
                  />
                </div>
                <div>
                  <Input
                    label="Capacity"
                    type="number"
                    value={newOpp.capacity}
                    onChange={(e) => setNewOpp({ ...newOpp, capacity: e.target.value })}
                    required
                  />
                </div>
              </div>

              <Input
                label="Execution Date"
                type="date"
                value={newOpp.date}
                onChange={(e) => setNewOpp({ ...newOpp, date: e.target.value })}
                required
              />

              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-2.5 rounded-custom-lg text-xs font-semibold text-center">
                  {errorMsg}
                </div>
              )}

              <div className="pt-4 border-t border-border-custom flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setShowCreateModal(false)} disabled={isPosting} className="h-10 min-h-0 text-xs">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isPosting} className="h-10 min-h-0 text-xs">
                  {isPosting ? 'Publishing...' : 'Publish Drive'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
