// Seed data for CivicConnect state management

export const initialUser = {
  id: 'usr-1',
  name: 'Aria Chen',
  role: 'Citizen', // Citizen, NGO, Business, Municipal Authority
  email: 'aria.chen@citizen.org',
  location: 'Metropolis City',
  points: 450,
  badges: [
    { id: 'b1', name: 'Eco Warrior', icon: 'forest', description: 'Participated in 3+ environmental cleanup events' },
    { id: 'b2', name: 'Civic Guardian', icon: 'shield', description: 'Reported a civic issue that was resolved' },
    { id: 'b3', name: 'Voice of Change', icon: 'campaign', description: 'Attended a public town hall session' }
  ],
  activityHistory: [
    { id: 'act-2', type: 'volunteer', title: 'Community Park Cleanup', date: '2026-07-28', status: 'Attended' },
    { id: 'act-3', type: 'rsvp', title: 'Green Energy Forum', date: '2026-07-15', status: 'Attended' }
  ]
};

export const initialComplaints = [];

export const initialOpportunities = [
  {
    id: 'opp-201',
    title: 'Community Tree Planting Drive',
    description: 'Join us to plant 100 native saplings in the northern forest reserve. Help build Metropolis\'s new green lung! Tools, gloves, and refreshments will be provided.',
    ngoName: 'GreenEarth Network',
    ngoId: 'ngo-1',
    location: 'Metropolis Northern Reserve',
    category: 'Environment',
    date: '2026-08-08',
    capacity: 25,
    appliedCount: 12,
    volunteers: ['Aria Chen', 'David Kim']
  },
  {
    id: 'opp-202',
    title: 'Weekend Soup Kitchen Helpers',
    description: 'We need volunteers to assist with food preparation, table services, and cleanup at our weekly soup kitchen. Bring an apron and a smile!',
    ngoName: 'Metropolis Care Foundation',
    ngoId: 'ngo-2',
    location: 'Central Soup Kitchen, 45 Pine St',
    category: 'Social Support',
    date: '2026-08-09',
    capacity: 10,
    appliedCount: 8,
    volunteers: ['Sarah Jenkins']
  },
  {
    id: 'opp-203',
    title: 'Interactive Math Tutoring for Kids',
    description: 'Help underrepresented elementary school children catch up on foundational mathematics. Sessions are held at the local public library.',
    ngoName: 'FutureMinds Academics',
    ngoId: 'ngo-3',
    location: 'Metropolis Public Library (Room B)',
    category: 'Education',
    date: '2026-08-12',
    capacity: 6,
    appliedCount: 3,
    volunteers: []
  },
  {
    id: 'opp-204',
    title: 'E-Waste Recycling Drop-off Coordinator',
    description: 'Help collect, categorize, and load old electronics into the recycling bins during our annual e-waste drive. Training on hazardous parts provided.',
    ngoName: 'GreenEarth Network',
    ngoId: 'ngo-1',
    location: 'Civic Plaza Parking Lot',
    category: 'Environment',
    date: '2026-08-15',
    capacity: 8,
    appliedCount: 2,
    volunteers: []
  }
];

export const initialEvents = [
  {
    id: 'evt-301',
    title: 'Annual Green Living Workshop',
    description: 'Learn sustainable household practices, home waste composting, and rainwater harvesting techniques from expert environmental planners.',
    organizer: 'GreenEarth Network',
    organizerRole: 'NGO',
    location: 'Metropolis Botanical Gardens',
    date: '2026-08-10',
    time: '10:00 AM - 02:00 PM',
    rsvps: ['Aria Chen', 'Marcus Vance', 'John Doe'],
    sponsoredBy: 'EcoTech Innovations'
  },
  {
    id: 'evt-302',
    title: 'Youth Career Mentoring Day',
    description: 'A mock-interview and resume review session where experienced professionals counsel local high-school students on career prospects.',
    organizer: 'FutureMinds Academics',
    organizerRole: 'NGO',
    location: 'Civic Community Center Hall',
    date: '2026-08-14',
    time: '01:00 PM - 05:00 PM',
    rsvps: ['Rohan Gupta', 'David Kim'],
    sponsoredBy: 'Apex Finance Corp'
  },
  {
    id: 'evt-303',
    title: 'Public Town Hall: Smart City Infrastructure',
    description: 'A formal dialogue between citizens and city officials discussing plans for solar streetlights and smart traffic management.',
    organizer: 'Metropolis Municipality',
    organizerRole: 'Municipal Authority',
    location: 'City Hall Auditorium',
    date: '2026-08-20',
    time: '06:00 PM - 08:30 PM',
    rsvps: ['Aria Chen', 'Marcus Vance', 'Sarah Jenkins'],
    sponsoredBy: null
  }
];

export const initialInitiatives = [
  {
    id: 'init-401',
    title: 'Solar Smart Streetlight Sponsorship',
    description: 'Sponsorship of 15 next-generation solar-powered LED streetlights along dark corridors in underserved neighborhoods.',
    businessName: 'EcoTech Innovations',
    businessId: 'biz-1',
    sponsoredEventId: 'evt-301',
    budget: '$15,000',
    impactMetric: '15 lights installed, reducing neighborhood crime report rate by simulated 12%.'
  },
  {
    id: 'init-402',
    title: 'FutureMinds Tech Lab Funding',
    description: 'Donated 10 refurbished laptops and set up high-speed internet access in the Community Center learning lab.',
    businessName: 'Apex Finance Corp',
    businessId: 'biz-2',
    sponsoredEventId: 'evt-302',
    budget: '$8,000',
    impactMetric: 'Provides computer access to 60+ low-income students weekly.'
  }
];

export const initialNotifications = [
  {
    id: 'notif-1',
    title: 'New Volunteer Work Near You',
    message: 'GreenEarth Network posted "Community Tree Planting Drive" matching your interests in Environment.',
    date: '2026-08-02',
    read: false
  }
];

export const initialApplications = [
  {
    id: 'app-501',
    opportunityId: 'opp-201',
    opportunityTitle: 'Community Tree Planting Drive',
    citizenName: 'Aria Chen',
    citizenEmail: 'aria.chen@citizen.org',
    status: 'Approved' // Pending, Approved, Rejected
  },
  {
    id: 'app-502',
    opportunityId: 'opp-201',
    opportunityTitle: 'Community Tree Planting Drive',
    citizenName: 'David Kim',
    citizenEmail: 'david.kim@example.com',
    status: 'Pending'
  },
  {
    id: 'app-503',
    opportunityId: 'opp-202',
    opportunityTitle: 'Weekend Soup Kitchen Helpers',
    citizenName: 'Sarah Jenkins',
    citizenEmail: 'sarah.j@outlook.com',
    status: 'Approved'
  },
  {
    id: 'app-504',
    opportunityId: 'opp-203',
    opportunityTitle: 'Interactive Math Tutoring for Kids',
    citizenName: 'Marcus Vance',
    citizenEmail: 'marcus.v@example.com',
    status: 'Pending'
  }
];
