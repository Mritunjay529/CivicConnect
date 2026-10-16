const API_BASE = 'http://localhost:5000/api';

/**
 * Token and User Session Storage
 */
export const getToken = () => localStorage.getItem('civic_token');

export const setToken = (token) => {
  if (token) {
    localStorage.setItem('civic_token', token);
  } else {
    localStorage.removeItem('civic_token');
  }
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('civic_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem('civic_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('civic_user');
  }
};

export const clearAuth = () => {
  localStorage.removeItem('civic_token');
  localStorage.removeItem('civic_user');
};

/**
 * Standard HTTP Request Wrapper
 */
async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * Normalize an opportunity record from backend or local seed
 */
export function normalizeOpportunity(opp) {
  if (!opp) return null;
  const oppId = opp.id || opp._id;
  const rawDate = opp.date;
  let dateFormatted = '';
  if (rawDate) {
    if (typeof rawDate === 'string' && rawDate.includes('T')) {
      dateFormatted = rawDate.split('T')[0];
    } else if (rawDate instanceof Date) {
      dateFormatted = rawDate.toISOString().split('T')[0];
    } else {
      dateFormatted = String(rawDate);
    }
  }

  const apps = Array.isArray(opp.applications) ? opp.applications : [];
  const volunteers = opp.volunteers && opp.volunteers.length > 0
    ? opp.volunteers
    : apps.map((a) => a.applicantName || 'Volunteer');

  const resolvedType = opp.type || (opp.creatorRole === 'business' || opp.budget ? 'csr' : 'volunteer');
  const orgName = opp.creatorName || opp.ngoName || opp.businessName || (resolvedType === 'csr' ? 'Corporate Partner' : 'Civic Organization');

  return {
    ...opp,
    id: oppId,
    _id: oppId,
    title: opp.title || 'Untitled Opportunity',
    description: opp.description || '',
    category: opp.category || (resolvedType === 'csr' ? 'Corporate CSR' : 'Community'),
    location: opp.location || 'Metropolis',
    date: dateFormatted || 'TBA',
    capacity: Number(opp.capacity) || 10,
    appliedCount: opp.appliedCount !== undefined ? opp.appliedCount : apps.length,
    volunteers,
    applications: apps,
    type: resolvedType,
    creatorRole: opp.creatorRole || (resolvedType === 'csr' ? 'business' : 'ngo'),
    creatorName: orgName,
    ngoName: orgName,
    ngoId: opp.creator || opp.ngoId || '',
    businessName: opp.businessName || (opp.creatorRole === 'business' ? orgName : 'Corporate Partner'),
    businessId: opp.businessId || opp.creator || '',
    budget: opp.budget ? (String(opp.budget).startsWith('$') ? opp.budget : `$${opp.budget}`) : '',
    impactMetric: opp.impactMetric || '',
    peopleImpacted: Number(opp.peopleImpacted) || 0,
    sponsoredEventId: opp.sponsoredEventId || null
  };
}

/**
 * API Client Services
 */
export const api = {
  // Auth
  async login(identifier, password, role) {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password, role })
    });
    if (res.token) setToken(res.token);
    if (res.data) setStoredUser(res.data);
    return res;
  },

  async signup(payload) {
    const res = await request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res.token) setToken(res.token);
    if (res.data) setStoredUser(res.data);
    return res;
  },

  async getMe() {
    const token = getToken();
    if (!token) return null;
    try {
      const res = await request('/auth/me');
      if (res.data) setStoredUser(res.data);
      return res.data;
    } catch (err) {
      if (err.status === 401) {
        clearAuth();
      }
      return null;
    }
  },

  // Opportunities & CSR Initiatives
  async getOpportunities(query = {}) {
    const qs = new URLSearchParams(query).toString();
    const endpoint = `/opportunities${qs ? `?${qs}` : ''}`;
    const res = await request(endpoint);
    const list = Array.isArray(res.data) ? res.data : [];
    return list.map(normalizeOpportunity);
  },

  async getOpportunityById(id) {
    const res = await request(`/opportunities/${id}`);
    return normalizeOpportunity(res.data);
  },

  async createOpportunity(oppData) {
    const res = await request('/opportunities', {
      method: 'POST',
      body: JSON.stringify({
        title: oppData.title,
        description: oppData.description,
        location: oppData.location || 'Metropolis',
        category: oppData.category || 'Environment',
        date: oppData.date,
        capacity: Number(oppData.capacity) || 10,
        type: oppData.type || 'volunteer',
        budget: oppData.budget || '',
        impactMetric: oppData.impactMetric || '',
        peopleImpacted: Number(oppData.peopleImpacted) || 0,
        sponsoredEventId: oppData.sponsoredEventId || undefined
      })
    });
    return normalizeOpportunity(res.data);
  },

  async createCsrInitiative(initData) {
    const res = await request('/opportunities', {
      method: 'POST',
      body: JSON.stringify({
        title: initData.title,
        description: initData.description,
        location: initData.location || 'Metropolis',
        category: initData.category || 'CSR & Community',
        date: initData.date || new Date().toISOString().split('T')[0],
        type: 'csr',
        budget: initData.budget || '',
        impactMetric: initData.impactMetric || '',
        peopleImpacted: Number(initData.peopleImpacted) || 0,
        sponsoredEventId: initData.sponsoredEventId || undefined
      })
    });
    return normalizeOpportunity(res.data);
  },

  async getMyCsrInitiatives() {
    const res = await request('/opportunities/csr/mine');
    return res.data;
  },

  async applyToOpportunity(oppId) {
    const res = await request(`/opportunities/${oppId}/apply`, {
      method: 'POST'
    });
    return normalizeOpportunity(res.data);
  },

  async getNgoApplications() {
    const res = await request('/opportunities/applications');
    const apps = Array.isArray(res.data) ? res.data : [];
    return apps.map((app) => ({
      id: app.id || app._id,
      _id: app.id || app._id,
      opportunityId: app.opportunityId,
      opportunityTitle: app.opportunityTitle,
      citizenName: app.citizenName || 'Citizen Applicant',
      citizenEmail: app.citizenEmail || '',
      citizenPhone: app.citizenPhone || '',
      status: app.status === 'approved' ? 'Approved' : app.status === 'rejected' ? 'Rejected' : 'Pending',
      appliedAt: app.appliedAt
    }));
  },

  async updateApplicationStatus(oppId, appId, status) {
    const normalized = (status || '').toLowerCase();
    const res = await request(`/opportunities/${oppId || 'undefined'}/applications/${appId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: normalized })
    });
    return res.data;
  },

  async getNgoStats() {
    const res = await request('/opportunities/stats');
    return res.data;
  },

  // Notifications
  async getNotifications() {
    const res = await request('/notifications');
    const list = Array.isArray(res.data) ? res.data : [];
    return list.map((n) => ({
      id: n._id || n.id,
      _id: n._id || n.id,
      title: n.title,
      message: n.message,
      type: n.type || 'general',
      relatedId: n.relatedId,
      read: Boolean(n.read),
      date: n.createdAt ? n.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]
    }));
  },

  async markNotificationRead(id) {
    const res = await request(`/notifications/${id}/read`, {
      method: 'PATCH'
    });
    return res.data;
  },

  async markAllNotificationsRead() {
    const res = await request('/notifications/read-all', {
      method: 'PATCH'
    });
    return res.data;
  },

  // Complaints
  async getComplaints() {
    const res = await request('/complaints');
    return Array.isArray(res.data) ? res.data : [];
  },

  async createComplaint(complaintData) {
    const res = await request('/complaints', {
      method: 'POST',
      body: JSON.stringify(complaintData)
    });
    return res.data;
  },

  async updateComplaintStatus(id, status) {
    const res = await request(`/complaints/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    return res.data;
  },

  // Events
  async getEvents() {
    const res = await request('/events');
    return Array.isArray(res.data) ? res.data : [];
  },

  async createEvent(eventData) {
    const res = await request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
    return res.data;
  },

  async toggleRsvp(id) {
    const res = await request(`/events/${id}/rsvp`, {
      method: 'POST'
    });
    return res.data;
  }
};

export default api;
