import { Complaint } from '../models/Complaint.js';
import { User, Citizen } from '../models/User.js';
import { RewardActivity } from '../models/RewardActivity.js';
import { Notification } from '../models/Notification.js';
import { 
  categorizeComplaint, 
  detectDuplicate 
} from '../services/aiService.js';
import { uploadImage } from '../services/uploadService.js';
import { sendEmail } from '../services/emailService.js';

// Citizen submits a new complaint
export const createComplaint = async (req, res, next) => {
  try {
    const { title, description, address, lat, lng } = req.body;
    
    if (!title || !description || !address || !lat || !lng) {
      return res.status(400).json({ success: false, message: 'Missing required issue parameters' });
    }

    // Upload image file
    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadImage(req.file);
    } else {
      imageUrl = req.body.imageUrl || 'https://images.unsplash.com/photo-1599740831146-7a69476b5270?auto=format&fit=crop&w=600&q=80';
    }

    // AI Categorization & Priority scoring
    const aiTags = await categorizeComplaint(description, imageUrl);

    // AI Proximity check for duplicate complaints (fetch open complaints in same category)
    const nearbyComplaints = await Complaint.find({ 
      category: aiTags.category, 
      status: { $ne: 'resolved' } 
    });

    const mockNewComp = {
      description,
      location: { lat: parseFloat(lat), lng: parseFloat(lng) }
    };

    const duplicateId = detectDuplicate(mockNewComp, nearbyComplaints);

    // Create complaint
    const complaint = await Complaint.create({
      reporterId: req.user._id,
      title,
      description,
      imageUrl,
      category: aiTags.category,
      priority: aiTags.priority,
      status: 'pending',
      location: {
        address,
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      },
      duplicateOf: duplicateId,
      updates: [{
        text: `Complaint registered. Category tagged as "${aiTags.category}" with priority "${aiTags.priority}" by AI.`
      }]
    });

    // Award +50 points to reporter for submitting a report
    const citizen = await Citizen.findById(req.user._id);
    if (citizen) {
      citizen.points += 50;
      
      // Check for first report badge
      const hasBadge = citizen.badges.some(b => b.name === 'First Reporter');
      if (!hasBadge) {
        citizen.badges.push({
          name: 'First Reporter',
          icon: 'stars',
          description: 'Filed your first civic complaint'
        });
      }
      await citizen.save();

      // Log reward activity
      await RewardActivity.create({
        userId: citizen._id,
        points: 50,
        reason: 'Reported a new civic issue',
        badgeEarned: !hasBadge ? 'First Reporter' : null
      });
    }

    // Generate System Notification
    await Notification.create({
      userId: req.user._id,
      title: 'Ticket Submitted',
      message: `Your report "${title}" has been registered. AI classification tag: ${aiTags.category}.`
    });

    res.status(201).json({
      success: true,
      complaint
    });
  } catch (error) {
    next(error);
  }
};

// Citizen views their own complaints list
export const getMineComplaints = async (req, res, next) => {
  try {
    const mine = await Complaint.find({ reporterId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: mine.length, complaints: mine });
  } catch (error) {
    next(error);
  }
};

// Authority views complaints queue
export const getComplaints = async (req, res, next) => {
  try {
    const { status, category, priority } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const list = await Complaint.find(query).populate('reporterId', 'name email phone');

    // Mapped priorities to weights for sorting (high priority first)
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    
    const sorted = [...list].sort((a, b) => {
      return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    });

    res.status(200).json({
      success: true,
      count: sorted.length,
      complaints: sorted
    });
  } catch (error) {
    next(error);
  }
};

// Authority assigns complaint
export const assignComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { department } = req.body;

    if (!department) {
      return res.status(400).json({ success: false, message: 'Please supply a department name' });
    }

    const comp = await Complaint.findById(id);
    if (!comp) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    comp.assignedDepartment = department;
    comp.status = 'in_progress';
    comp.updates.push({
      text: `Issue assigned to ${department} department. Progress: In Progress.`
    });
    await comp.save();

    // Trigger notify for reporter
    await Notification.create({
      userId: comp.reporterId,
      title: 'Ticket In Progress',
      message: `Your report "${comp.title}" is assigned to the "${department}" department.`
    });

    res.status(200).json({ success: true, complaint: comp });
  } catch (error) {
    next(error);
  }
};

// Authority resolves complaint
export const resolveComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comp = await Complaint.findById(id);
    if (!comp) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    comp.status = 'resolved';
    comp.updates.push({
      text: 'Municipal Roadworks/Sanitation crew resolved the issue. Verified by representative.'
    });
    await comp.save();

    // Award points to citizen reporter (+100 pts)
    const reporter = await Citizen.findById(comp.reporterId);
    if (reporter) {
      reporter.points += 100;
      
      // Earn a Badge: Civic Guardian if resolved reports >= 2
      const resolvedCount = await Complaint.countDocuments({ reporterId: reporter._id, status: 'resolved' });
      let badgeName = null;
      
      if (resolvedCount >= 2 && !reporter.badges.some(b => b.name === 'Civic Guardian')) {
        badgeName = 'Civic Guardian';
        reporter.badges.push({
          name: 'Civic Guardian',
          icon: 'shield',
          description: 'Reported 2+ resolved civic issues'
        });
      }
      await reporter.save();

      // Log Reward log
      await RewardActivity.create({
        userId: reporter._id,
        points: 100,
        reason: `Report resolved: ${comp.title}`,
        badgeEarned: badgeName,
        certificateUrl: `/api/users/${reporter._id}/certificate/gen` // Dynamic certificate link
      });

      // Generate System Notification
      await Notification.create({
        userId: reporter._id,
        title: 'Issue Resolved!',
        message: `Awesome! Your reported ticket "${comp.title}" is resolved. You earned 100 reward points!`
      });

      // Mock Email notify
      await sendEmail({
        to: reporter.email,
        subject: 'CivicConnect Issue Resolved Notification',
        html: `<h3>Great news, ${reporter.name}!</h3>
        <p>Your reported issue <strong>"${comp.title}"</strong> has been successfully resolved by municipal crews.</p>
        <p>You have been awarded <strong>100 points</strong>. Keep helping your community!</p>`
      });
    }

    res.status(200).json({ success: true, complaint: comp });
  } catch (error) {
    next(error);
  }
};

// Authority rejects complaint
export const rejectComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const comp = await Complaint.findById(id);
    if (!comp) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    comp.status = 'rejected';
    comp.updates.push({
      text: `Issue rejected. Reason: ${reason || 'Invalid report/insufficient data.'}`
    });
    await comp.save();

    // Notify citizen
    await Notification.create({
      userId: comp.reporterId,
      title: 'Ticket Rejected',
      message: `Your report "${comp.title}" was marked as rejected by authority.`
    });

    res.status(200).json({ success: true, complaint: comp });
  } catch (error) {
    next(error);
  }
};

// Citizen feedback post
export const addFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating) {
      return res.status(400).json({ success: false, message: 'Please supply a rating score between 1 and 5' });
    }

    const comp = await Complaint.findById(id);
    if (!comp) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (comp.reporterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied: You can only submit feedback for your own reports' });
    }

    if (comp.status !== 'resolved') {
      return res.status(400).json({ success: false, message: 'Feedback can only be posted after the ticket has been resolved' });
    }

    comp.feedback = { rating, comment };
    await comp.save();

    res.status(200).json({ success: true, message: 'Feedback registered successfully', complaint: comp });
  } catch (error) {
    next(error);
  }
};

// Export Complaints CSV
export const exportComplaints = async (req, res, next) => {
  try {
    const list = await Complaint.find().populate('reporterId', 'name email');
    
    let csv = 'ID,Title,Category,Priority,Status,Address,Reporter,Date\n';
    
    for (const comp of list) {
      const escapedTitle = comp.title.replace(/"/g, '""');
      const escapedAddress = comp.location?.address?.replace(/"/g, '""') || '';
      const reporterName = comp.reporterId ? comp.reporterId.name : 'Deleted User';
      const dateStr = comp.createdAt.toISOString().split('T')[0];
      
      csv += `"${comp._id}","${escapedTitle}","${comp.category}","${comp.priority}","${comp.status}","${escapedAddress}","${reporterName}","${dateStr}"\n`;
    }

    res.header('Content-Type', 'text/csv');
    res.attachment('complaints_export.csv');
    return res.send(csv);
  } catch (error) {
    next(error);
  }
};
