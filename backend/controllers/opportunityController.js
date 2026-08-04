import { Opportunity } from '../models/Opportunity.js';
import { User, Citizen } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { RewardActivity } from '../models/RewardActivity.js';
import { recommendOpportunities as recommendAI } from '../services/aiService.js';

// NGO/Business posts a volunteer opportunity
export const createOpportunity = async (req, res, next) => {
  try {
    const { title, description, category, date, location, capacity } = req.body;

    const opp = await Opportunity.create({
      postedBy: req.user._id,
      title,
      description,
      category,
      date,
      location,
      capacity: parseInt(capacity)
    });

    res.status(201).json({ success: true, opportunity: opp });
  } catch (error) {
    next(error);
  }
};

// List all opportunities with filters
export const getOpportunities = async (req, res, next) => {
  try {
    const { category, location, search } = req.query;

    let query = {};
    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const list = await Opportunity.find(query).populate('postedBy', 'name orgName businessName');
    res.status(200).json({ success: true, count: list.length, opportunities: list });
  } catch (error) {
    next(error);
  }
};

// Citizen applies for an opportunity
export const applyOpportunity = async (req, res, next) => {
  try {
    const { id } = req.params;

    const opp = await Opportunity.findById(id);
    if (!opp) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    // Check if citizen has already applied
    const alreadyApplied = opp.applicants.some(
      (app) => app.userId.toString() === req.user._id.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: 'You have already applied for this volunteer opportunity' });
    }

    // Check capacity limit
    const approvedCount = opp.applicants.filter(a => a.status === 'approved').length;
    if (approvedCount >= opp.capacity) {
      return res.status(400).json({ success: false, message: 'This opportunity has reached its maximum volunteer capacity' });
    }

    opp.applicants.push({ userId: req.user._id, status: 'pending' });
    await opp.save();

    // Trigger Notification for NGO organizer
    await Notification.create({
      userId: opp.postedBy,
      title: 'New Volunteer Application',
      message: `Citizen "${req.user.name}" has applied for "${opp.title}".`
    });

    res.status(200).json({ success: true, message: 'Application registered successfully', opportunity: opp });
  } catch (error) {
    next(error);
  }
};

// NGO/Business approves or rejects applicant
export const updateApplicantStatus = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const { status } = req.body; // approved / rejected

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    const opp = await Opportunity.findById(id);
    if (!opp) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    // Verify ownership
    if (opp.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access Denied: You are not the organizer of this opportunity' });
    }

    // Find and update the applicant
    const applicant = opp.applicants.find(app => app.userId.toString() === userId.toString());
    if (!applicant) {
      return res.status(404).json({ success: false, message: 'Applicant registration not found' });
    }

    applicant.status = status;
    await opp.save();

    // If approved, trigger points credit for citizen (+30 points) and check badge "Eco Warrior"
    if (status === 'approved') {
      const citizen = await Citizen.findById(userId);
      if (citizen) {
        citizen.points += 30;

        // Earn a Badge: Eco Warrior if approved applications >= 3
        const approvedCount = await Opportunity.countDocuments({
          'applicants.userId': userId,
          'applicants.status': 'approved'
        });
        
        let badgeName = null;
        if (approvedCount >= 3 && !citizen.badges.some(b => b.name === 'Eco Warrior')) {
          badgeName = 'Eco Warrior';
          citizen.badges.push({
            name: 'Eco Warrior',
            icon: 'forest',
            description: 'Participated in 3+ environmental cleanup events'
          });
        }
        await citizen.save();

        // Log Reward activity
        await RewardActivity.create({
          userId: citizen._id,
          points: 30,
          reason: `Approved volunteer application for "${opp.title}"`,
          badgeEarned: badgeName
        });
      }
    }

    // Trigger Notification for the citizen
    await Notification.create({
      userId: userId,
      title: `Volunteer Drive ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Your application to volunteer for "${opp.title}" was ${status}.`
    });

    res.status(200).json({ success: true, message: `Applicant status updated to ${status}`, opportunity: opp });
  } catch (error) {
    next(error);
  }
};

// AI Recommend matching opportunities for citizen
export const getRecommendedOpportunities = async (req, res, next) => {
  try {
    const citizen = await Citizen.findById(req.user._id);
    if (!citizen) {
      return res.status(404).json({ success: false, message: 'Citizen profile not found' });
    }

    // Fetch user's points history to determine interest tags
    const history = await RewardActivity.find({ userId: req.user._id });
    
    // Fetch all future opportunities
    const allOpps = await Opportunity.find({ date: { $gte: new Date() } }).populate('postedBy', 'name orgName');
    
    // Run AI recommend matching
    const recommendations = recommendAI(citizen.badges, history, allOpps);

    res.status(200).json({
      success: true,
      count: recommendations.length,
      opportunities: recommendations
    });
  } catch (error) {
    next(error);
  }
};
