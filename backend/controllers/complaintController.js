import mongoose from 'mongoose';
import { Complaint } from '../models/Complaint.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { asyncHandler, suggestCategoryAndPriority, evaluateBadges } from '../utils/helpers.js';
import { sendMail, complaintStatusTemplate } from '../utils/mailer.js';

/**
 * @desc    Suggest category and priority while user types
 * @route   POST /api/complaints/suggest
 * @access  Public / Private
 */
export const suggest = asyncHandler(async (req, res) => {
  const { text = '', description = '', title = '' } = req.body;
  const combinedText = `${title} ${description} ${text}`.trim();

  const suggestion = suggestCategoryAndPriority(combinedText);

  res.status(200).json({
    success: true,
    data: suggestion
  });
});

/**
 * @desc    Submit a new civic complaint (with optional image upload)
 * @route   POST /api/complaints
 * @access  Private (Citizen)
 */
export const createComplaint = asyncHandler(async (req, res) => {
  const { title, description, category, priority } = req.body;

  if (!description) {
    return res.status(400).json({
      success: false,
      message: 'Description is required to file a complaint'
    });
  }

  // Parse location (can be object, JSON string, or address string)
  let parsedLocation = { address: '', lat: null, lng: null };
  if (req.body.location) {
    if (typeof req.body.location === 'object') {
      parsedLocation = {
        address: req.body.location.address || '',
        lat: req.body.location.lat ? Number(req.body.location.lat) : null,
        lng: req.body.location.lng ? Number(req.body.location.lng) : null
      };
    } else if (typeof req.body.location === 'string') {
      try {
        const obj = JSON.parse(req.body.location);
        parsedLocation = {
          address: obj.address || req.body.location,
          lat: obj.lat ? Number(obj.lat) : null,
          lng: obj.lng ? Number(obj.lng) : null
        };
      } catch {
        parsedLocation = { address: req.body.location, lat: null, lng: null };
      }
    }
  }

  // Handle uploaded file or provided imageUrl string
  let imageUrl = '';
  if (req.file) {
    imageUrl = `/uploads/${req.file.filename}`;
  } else if (req.body.imageUrl) {
    imageUrl = req.body.imageUrl;
  }

  // Auto-suggest category and priority if not provided
  const aiSuggestion = suggestCategoryAndPriority(`${title || ''} ${description}`);
  const finalCategory = category || aiSuggestion.category;
  const finalPriority = priority || aiSuggestion.priority;
  const finalTitle = title || `${finalCategory} near ${parsedLocation.address || 'Local Area'}`;

  // Create complaint
  const complaint = await Complaint.create({
    title: finalTitle,
    description,
    imageUrl,
    category: finalCategory,
    priority: finalPriority,
    location: parsedLocation,
    citizen: req.user._id,
    citizenName: req.user.name || 'Citizen',
    status: 'pending',
    updates: [
      {
        date: new Date(),
        text: `Issue registered with AI-suggested priority: ${finalPriority}`
      }
    ]
  });

  // Award +10 reward points to citizen for reporting issue
  await User.findByIdAndUpdate(req.user._id, {
    $inc: { rewardPoints: 10 }
  });

  // In-app Notification for citizen
  await Notification.create({
    user: req.user._id,
    title: 'Report Submitted (+10 Points)',
    message: `Your report "${finalTitle}" has been logged successfully. You earned 10 Civic Points!`,
    type: 'complaint',
    relatedId: complaint._id
  }).catch((err) => console.warn('Notification err:', err.message));

  // Send confirmation email fire-and-forget
  const statusHtml = complaintStatusTemplate(req.user, complaint, 'none', 'pending', 'Your issue has been logged and queued for department assignment.');
  sendMail({
    to: req.user.email,
    subject: `CivicConnect: Issue Logged - ${finalTitle}`,
    html: statusHtml
  });

  res.status(201).json({
    success: true,
    message: 'Complaint submitted successfully and 10 reward points awarded',
    data: complaint
  });
});

/**
 * @desc    Get logged-in citizen's complaints
 * @route   GET /api/complaints/mine
 * @access  Private (Citizen)
 */
export const getMyComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({ citizen: req.user._id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: complaints.length,
    data: complaints
  });
});

/**
 * @desc    Get complaints for authorities (sorted by priority High -> Med -> Low, support count, date)
 * @route   GET /api/complaints
 * @access  Private (Authority, Admin)
 */
export const getComplaints = asyncHandler(async (req, res) => {
  const { status, category } = req.query;

  const match = {};
  if (status) {
    match.status = status;
  }
  if (category) {
    match.category = category;
  }

  // Aggregation for custom priority ordering (High -> Medium -> Low)
  const complaints = await Complaint.aggregate([
    { $match: match },
    {
      $addFields: {
        priorityRank: {
          $switch: {
            branches: [
              { case: { $eq: ['$priority', 'High'] }, then: 1 },
              { case: { $eq: ['$priority', 'Medium'] }, then: 2 },
              { case: { $eq: ['$priority', 'Low'] }, then: 3 }
            ],
            default: 4
          }
        }
      }
    },
    {
      $sort: {
        priorityRank: 1,
        supportCount: -1,
        createdAt: -1
      }
    }
  ]);

  res.status(200).json({
    success: true,
    count: complaints.length,
    data: complaints
  });
});

/**
 * @desc    Get complaint details by ID
 * @route   GET /api/complaints/:id
 * @access  Private
 */
export const getComplaintById = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('citizen', 'name email phone')
    .populate('assignedTo', 'name department');

  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: 'Complaint not found'
    });
  }

  res.status(200).json({
    success: true,
    data: complaint
  });
});

/**
 * @desc    Update complaint status (authority only)
 * @route   PATCH /api/complaints/:id/status
 * @access  Private (Authority, Admin)
 */
export const updateStatus = asyncHandler(async (req, res) => {
  const { status, note, assignedTo } = req.body;

  const validStatuses = ['pending', 'in_progress', 'resolved', 'rejected'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    });
  }

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: 'Complaint not found'
    });
  }

  const previousStatus = complaint.status;
  complaint.status = status;

  if (assignedTo) {
    complaint.assignedTo = assignedTo;
  }

  if (note) {
    complaint.notes.push({
      note,
      updatedBy: req.user._id,
      createdAt: new Date()
    });
  }

  const statusLabel = {
    pending: 'Pending',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    rejected: 'Rejected'
  }[status];

  complaint.updates.push({
    date: new Date(),
    text: note ? `Status updated to ${statusLabel}: ${note}` : `Status updated to ${statusLabel}`
  });

  await complaint.save();

  // Find reporting citizen
  const citizenUser = await User.findById(complaint.citizen);

  // If newly marked resolved, award +20 reward points
  if (previousStatus !== 'resolved' && status === 'resolved' && citizenUser) {
    citizenUser.rewardPoints = (citizenUser.rewardPoints || 0) + 20;

    // Check & evaluate badges
    const resolvedCount = await Complaint.countDocuments({ citizen: citizenUser._id, status: 'resolved' });
    citizenUser.badges = evaluateBadges(citizenUser.rewardPoints, citizenUser.eventsCompleted || 0, resolvedCount);
    await citizenUser.save();

    // Create in-app notification
    await Notification.create({
      user: citizenUser._id,
      title: 'Issue Resolved! (+20 Points)',
      message: `Your report "${complaint.title}" has been resolved. You earned 20 Reward Points!`,
      type: 'complaint',
      relatedId: complaint._id
    }).catch((err) => console.warn('Notification err:', err.message));
  } else if (citizenUser) {
    // Notification for other status changes
    await Notification.create({
      user: citizenUser._id,
      title: `Status Update: ${statusLabel}`,
      message: `Municipal team updated your report "${complaint.title}" to ${statusLabel}.`,
      type: 'complaint',
      relatedId: complaint._id
    }).catch((err) => console.warn('Notification err:', err.message));
  }

  // Send status update email fire-and-forget
  if (citizenUser) {
    const statusHtml = complaintStatusTemplate(citizenUser, complaint, previousStatus, status, note);
    sendMail({
      to: citizenUser.email,
      subject: `CivicConnect: Complaint Status Update - ${statusLabel}`,
      html: statusHtml
    });
  }

  res.status(200).json({
    success: true,
    message: `Complaint status updated to ${status}`,
    data: complaint
  });
});

/**
 * @desc    Submit citizen feedback after resolution
 * @route   POST /api/complaints/:id/feedback
 * @access  Private (Citizen)
 */
export const submitFeedback = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be an integer between 1 and 5'
    });
  }

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: 'Complaint not found'
    });
  }

  if (complaint.status !== 'resolved') {
    return res.status(400).json({
      success: false,
      message: 'Feedback can only be submitted once the complaint has been resolved'
    });
  }

  if (complaint.citizen.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Only the citizen who reported this issue can submit resolution feedback'
    });
  }

  complaint.feedback = {
    rating: Number(rating),
    comment: comment || '',
    submittedAt: new Date()
  };

  await complaint.save();

  res.status(200).json({
    success: true,
    message: 'Thank you for your feedback!',
    data: complaint.feedback
  });
});

/**
 * @desc    Citizen support toggle ("I am facing this too")
 * @route   POST /api/complaints/:id/support
 * @access  Private (Citizen)
 */
export const toggleSupport = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: 'Complaint not found'
    });
  }

  const userIdStr = req.user._id.toString();
  const existingIndex = complaint.supporters.findIndex((id) => id.toString() === userIdStr);

  let isSupported = false;
  if (existingIndex > -1) {
    // Already supported, toggle off
    complaint.supporters.splice(existingIndex, 1);
    isSupported = false;
  } else {
    // Add support
    complaint.supporters.push(req.user._id);
    isSupported = true;
  }

  complaint.supportCount = complaint.supporters.length;
  await complaint.save();

  res.status(200).json({
    success: true,
    message: isSupported ? 'You flagged that you are facing this issue too' : 'Removed support for this issue',
    data: {
      isSupported,
      supportCount: complaint.supportCount
    }
  });
});

/**
 * @desc    Authority dashboard stats (open count, resolved this week, active volunteers)
 * @route   GET /api/complaints/stats
 * @access  Private (Authority, Admin)
 */
export const getStats = asyncHandler(async (req, res) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [openCount, resolvedThisWeek, totalResolved, activeCitizens] = await Promise.all([
    Complaint.countDocuments({ status: { $in: ['pending', 'in_progress'] } }),
    Complaint.countDocuments({ status: 'resolved', updatedAt: { $gte: oneWeekAgo } }),
    Complaint.countDocuments({ status: 'resolved' }),
    User.countDocuments({ role: 'citizen', rewardPoints: { $gt: 0 } })
  ]);

  res.status(200).json({
    success: true,
    data: {
      openCount,
      resolvedThisWeek,
      totalResolved,
      activeVolunteers: activeCitizens
    }
  });
});
