import mongoose from 'mongoose';
import { Opportunity } from '../models/Opportunity.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { asyncHandler, evaluateBadges } from '../utils/helpers.js';
import {
  sendMail,
  volunteerApplicationStatusTemplate,
  volunteerApplicationReceivedTemplate,
  volunteerApplicationSubmittedTemplate,
  volunteerCompletedCertificateTemplate,
  csrInitiativeCreatedTemplate
} from '../utils/mailer.js';

/**
 * @desc    Create a volunteer opportunity or CSR initiative
 * @route   POST /api/opportunities
 * @access  Private (NGO, Business)
 */
export const createOpportunity = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category = 'Community',
    date,
    location = 'Metropolis',
    mode = 'onsite',
    icon = 'heart',
    capacity = 10,
    certificateOffered = true,
    type,
    budget,
    impactMetric,
    peopleImpacted
  } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      success: false,
      message: 'Title and description are required'
    });
  }

  // Auto-detect type if not provided: business defaults to csr, ngo defaults to volunteer
  const resolvedType = type || (req.user.role === 'business' ? 'csr' : 'volunteer');

  const opportunity = await Opportunity.create({
    creator: req.user._id,
    creatorName: req.user.name || req.user.orgName || req.user.bizName || 'Organizer',
    creatorRole: req.user.role,
    type: resolvedType,
    title,
    description,
    category,
    date: date ? new Date(date) : undefined,
    location,
    mode,
    icon,
    capacity: Number(capacity) || 10,
    certificateOffered: Boolean(certificateOffered),
    budget: budget || '',
    impactMetric: impactMetric || '',
    peopleImpacted: Number(peopleImpacted) || 0
  });

  // Send confirmation email for corporate CSR initiative
  if (resolvedType === 'csr' && req.user?.email) {
    const csrHtml = csrInitiativeCreatedTemplate(req.user, opportunity);
    sendMail({
      to: req.user.email,
      subject: `CivicConnect: CSR Initiative Registered - "${opportunity.title}"`,
      html: csrHtml
    });
  }

  res.status(201).json({
    success: true,
    message: `${resolvedType === 'csr' ? 'CSR Initiative' : 'Opportunity'} created successfully`,
    data: opportunity
  });
});

/**
 * @desc    Get all opportunities (with search, category, date, and type filters)
 * @route   GET /api/opportunities
 * @access  Private
 */
export const getOpportunities = asyncHandler(async (req, res) => {
  const { search, category, date, type = 'volunteer' } = req.query;

  const query = {};

  if (type) {
    query.type = type;
  }

  if (category && category !== 'All') {
    query.category = { $regex: new RegExp(category, 'i') };
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } }
    ];
  }

  if (date) {
    const searchDate = new Date(date);
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);
    query.date = { $gte: searchDate, $lt: nextDay };
  }

  const opportunities = await Opportunity.find(query).sort({ date: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: opportunities.length,
    data: opportunities
  });
});

/**
 * @desc    Get single opportunity by ID
 * @route   GET /api/opportunities/:id
 * @access  Private
 */
export const getOpportunityById = asyncHandler(async (req, res) => {
  const opportunity = await Opportunity.findById(req.params.id);

  if (!opportunity) {
    return res.status(404).json({
      success: false,
      message: 'Opportunity not found'
    });
  }

  res.status(200).json({
    success: true,
    data: opportunity
  });
});

/**
 * @desc    Apply to volunteer for an opportunity
 * @route   POST /api/opportunities/:id/apply
 * @access  Private (Citizen)
 */
export const applyToOpportunity = asyncHandler(async (req, res) => {
  const opportunity = await Opportunity.findById(req.params.id);

  if (!opportunity) {
    return res.status(404).json({
      success: false,
      message: 'Opportunity not found'
    });
  }

  if (opportunity.type !== 'volunteer') {
    return res.status(400).json({
      success: false,
      message: 'Applications are only open for volunteer opportunities'
    });
  }

  // Check if citizen already applied
  const alreadyApplied = opportunity.applications.some(
    (app) => app.applicant.toString() === req.user._id.toString()
  );

  if (alreadyApplied) {
    return res.status(400).json({
      success: false,
      message: 'You have already applied for this volunteer opportunity'
    });
  }

  // Check capacity
  const approvedCount = opportunity.applications.filter((a) => a.status === 'approved').length;
  if (opportunity.capacity && approvedCount >= opportunity.capacity) {
    return res.status(400).json({
      success: false,
      message: 'This volunteer drive has reached its maximum volunteer capacity'
    });
  }

  const newApplication = {
    applicant: req.user._id,
    applicantName: req.user.name || 'Citizen Volunteer',
    applicantEmail: req.user.email,
    applicantPhone: req.user.phone || '',
    status: 'pending',
    appliedAt: new Date()
  };

  opportunity.applications.push(newApplication);
  await opportunity.save();

  // Create in-app notification for opportunity organizer
  await Notification.create({
    user: opportunity.creator,
    title: 'New Volunteer Application',
    message: `${req.user.name || 'A citizen'} applied to "${opportunity.title}".`,
    type: 'opportunity',
    relatedId: opportunity._id
  }).catch((err) => console.warn('Notification err:', err.message));

  // Send email to NGO organizer
  const organizerUser = await User.findById(opportunity.creator);
  if (organizerUser && organizerUser.email) {
    const orgEmailHtml = volunteerApplicationReceivedTemplate(organizerUser, opportunity, req.user);
    sendMail({
      to: organizerUser.email,
      subject: `CivicConnect: New Volunteer Application for "${opportunity.title}"`,
      html: orgEmailHtml
    });
  }

  // Send confirmation email to Citizen applicant
  if (req.user && req.user.email) {
    const citEmailHtml = volunteerApplicationSubmittedTemplate(req.user, opportunity);
    sendMail({
      to: req.user.email,
      subject: `CivicConnect: Application Received - "${opportunity.title}"`,
      html: citEmailHtml
    });
  }

  res.status(201).json({
    success: true,
    message: 'Application submitted successfully. Awaiting organizer approval.',
    data: opportunity
  });
});

/**
 * @desc    Get all applications made by logged-in citizen
 * @route   GET /api/opportunities/applications/mine
 * @access  Private (Citizen)
 */
export const getMyApplications = asyncHandler(async (req, res) => {
  const opportunities = await Opportunity.find({
    'applications.applicant': req.user._id
  });

  const myApplications = [];

  for (const opp of opportunities) {
    for (const app of opp.applications) {
      if (app.applicant.toString() === req.user._id.toString()) {
        myApplications.push({
          id: app._id,
          applicationId: app._id,
          opportunityId: opp._id,
          opportunityTitle: opp.title,
          category: opp.category,
          date: opp.date,
          location: opp.location,
          ngoName: opp.creatorName,
          status: app.status,
          appliedAt: app.appliedAt,
          certificateIssued: app.certificateIssued
        });
      }
    }
  }

  res.status(200).json({
    success: true,
    count: myApplications.length,
    data: myApplications
  });
});

/**
 * @desc    Get applications submitted to NGO's opportunities
 * @route   GET /api/opportunities/applications
 * @access  Private (NGO, Admin)
 */
export const getNgoApplications = asyncHandler(async (req, res) => {
  const opportunities = await Opportunity.find({ creator: req.user._id });

  const allApplications = [];

  for (const opp of opportunities) {
    for (const app of opp.applications) {
      allApplications.push({
        id: app._id,
        opportunityId: opp._id,
        opportunityTitle: opp.title,
        applicantId: app.applicant,
        citizenName: app.applicantName,
        citizenEmail: app.applicantEmail,
        citizenPhone: app.applicantPhone,
        status: app.status,
        appliedAt: app.appliedAt,
        certificateIssued: app.certificateIssued
      });
    }
  }

  res.status(200).json({
    success: true,
    count: allApplications.length,
    data: allApplications
  });
});

/**
 * @desc    Review volunteer application (approve | reject)
 * @route   PATCH /api/opportunities/:id/applications/:appId
 * @access  Private (NGO, Admin)
 */
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const normalizedStatus = (status || '').toLowerCase();

  if (!['approved', 'rejected'].includes(normalizedStatus)) {
    return res.status(400).json({
      success: false,
      message: "Status must be 'approved' or 'rejected'"
    });
  }

  let opportunity;
  if (req.params.id && req.params.id !== 'undefined') {
    opportunity = await Opportunity.findById(req.params.id);
  }
  if (!opportunity) {
    opportunity = await Opportunity.findOne({
      'applications._id': req.params.appId
    });
  }

  if (!opportunity) {
    return res.status(404).json({
      success: false,
      message: 'Opportunity not found'
    });
  }

  // Permission check: NGO can only manage their own opportunities; admin can manage all
  if (
    req.user.role !== 'admin' &&
    opportunity.creator.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to manage applications for this opportunity'
    });
  }

  const application = opportunity.applications.id(req.params.appId);
  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }

  application.status = normalizedStatus;
  await opportunity.save();

  // Find applicant to send email and notification
  const applicantUser = await User.findById(application.applicant);

  if (applicantUser) {
    // In-app Notification
    await Notification.create({
      user: applicantUser._id,
      title: `Application ${status === 'approved' ? 'Approved!' : 'Update'}`,
      message: `Your application to "${opportunity.title}" was ${status}.`,
      type: 'opportunity',
      relatedId: opportunity._id
    }).catch((err) => console.warn('Notification err:', err.message));

    // Send email fire-and-forget
    const statusHtml = volunteerApplicationStatusTemplate(applicantUser, opportunity, status);
    sendMail({
      to: applicantUser.email,
      subject: `CivicConnect: Application ${status === 'approved' ? 'Approved' : 'Status Update'}`,
      html: statusHtml
    });
  }

  res.status(200).json({
    success: true,
    message: `Application ${status} successfully`,
    data: application
  });
});

/**
 * @desc    Mark volunteer attendance/completion (+50 points, certificate flag)
 * @route   PATCH /api/opportunities/:id/complete/:userId
 * @access  Private (NGO, Admin)
 */
export const completeVolunteer = asyncHandler(async (req, res) => {
  const opportunity = await Opportunity.findOne({
    _id: req.params.id,
    ...(req.user.role !== 'admin' ? { creator: req.user._id } : {})
  });

  if (!opportunity) {
    return res.status(404).json({
      success: false,
      message: 'Opportunity not found or you do not have permission'
    });
  }

  const application = opportunity.applications.find(
    (app) => app.applicant.toString() === req.params.userId
  );

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application for this volunteer not found'
    });
  }

  application.status = 'completed';
  application.certificateIssued = true;
  application.completedAt = new Date();
  await opportunity.save();

  // Award +50 reward points, increment events completed, evaluate badges
  const volunteerUser = await User.findById(req.params.userId);
  if (volunteerUser) {
    volunteerUser.rewardPoints = (volunteerUser.rewardPoints || 0) + 50;
    volunteerUser.eventsCompleted = (volunteerUser.eventsCompleted || 0) + 1;
    volunteerUser.badges = evaluateBadges(
      volunteerUser.rewardPoints,
      volunteerUser.eventsCompleted,
      0
    );
    await volunteerUser.save();

    // In-app notification
    await Notification.create({
      user: volunteerUser._id,
      title: 'Volunteer Drive Completed (+50 Points)',
      message: `Congratulations! You successfully completed "${opportunity.title}". Certificate issued and +50 points added to your profile!`,
      type: 'opportunity',
      relatedId: opportunity._id
    }).catch((err) => console.warn('Notification err:', err.message));

    // Send Certificate and completion email
    if (volunteerUser.email) {
      const certHtml = volunteerCompletedCertificateTemplate(volunteerUser, opportunity);
      sendMail({
        to: volunteerUser.email,
        subject: `CivicConnect: Certificate & Completion for "${opportunity.title}"`,
        html: certHtml
      });
    }
  }

  res.status(200).json({
    success: true,
    message: 'Volunteer participation marked as completed (+50 points awarded)',
    data: {
      application,
      rewardPoints: volunteerUser ? volunteerUser.rewardPoints : undefined
    }
  });
});

/**
 * @desc    NGO dashboard statistics
 * @route   GET /api/opportunities/stats
 * @access  Private (NGO, Admin)
 */
export const getNgoStats = asyncHandler(async (req, res) => {
  const opportunities = await Opportunity.find({ creator: req.user._id });

  let activeOpportunities = 0;
  let totalVolunteers = 0;
  let pendingApplications = 0;

  for (const opp of opportunities) {
    if (opp.status === 'active') activeOpportunities++;
    for (const app of opp.applications) {
      if (app.status === 'approved' || app.status === 'completed') totalVolunteers++;
      if (app.status === 'pending') pendingApplications++;
    }
  }

  res.status(200).json({
    success: true,
    data: {
      activeOpportunities,
      totalVolunteers,
      pendingApplications,
      totalListings: opportunities.length
    }
  });
});

/**
 * @desc    Business CSR initiatives dashboard numbers
 * @route   GET /api/opportunities/csr/mine
 * @access  Private (Business, Admin)
 */
export const getMyCsrInitiatives = asyncHandler(async (req, res) => {
  const initiatives = await Opportunity.find({
    creator: req.user._id,
    type: 'csr'
  }).sort({ createdAt: -1 });

  const totalPeopleImpacted = initiatives.reduce(
    (sum, item) => sum + (Number(item.peopleImpacted) || 0),
    0
  );

  res.status(200).json({
    success: true,
    data: {
      initiativesSponsored: initiatives.length,
      peopleImpacted: totalPeopleImpacted,
      initiatives
    }
  });
});
