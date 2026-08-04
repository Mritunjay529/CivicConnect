import { Event } from '../models/Event.js';
import { User, Citizen, Business } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { RewardActivity } from '../models/RewardActivity.js';

// Create Event (NGO/Business)
export const createEvent = async (req, res, next) => {
  try {
    const { title, description, date, type } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      type,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

// Get Events (Calendar view, supports date-range)
export const getEvents = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let query = {};
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const list = await Event.find(query)
      .populate('createdBy', 'name orgName businessName')
      .sort({ date: 1 });

    res.status(200).json({ success: true, count: list.length, events: list });
  } catch (error) {
    next(error);
  }
};

// Citizen RSVPs to an event
export const rsvpEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if user has already RSVPed
    const alreadyRsvped = event.rsvps.some(
      (userId) => userId.toString() === req.user._id.toString()
    );

    if (alreadyRsvped) {
      return res.status(400).json({ success: false, message: 'You have already RSVPed to this community event' });
    }

    event.rsvps.push(req.user._id);
    await event.save();

    // If citizen, award +15 points for RSVPing to event
    if (req.user.role === 'citizen') {
      const citizen = await Citizen.findById(req.user._id);
      if (citizen) {
        citizen.points += 15;
        
        // Earn Badge "Voice of Change" if attended/RSVPed >= 2 events
        const rsvpCount = await Event.countDocuments({ rsvps: req.user._id });
        let badgeName = null;
        if (rsvpCount >= 2 && !citizen.badges.some(b => b.name === 'Voice of Change')) {
          badgeName = 'Voice of Change';
          citizen.badges.push({
            name: 'Voice of Change',
            icon: 'campaign',
            description: 'RSVPed to 2+ public town halls / community events'
          });
        }
        await citizen.save();

        // Log Reward activity
        await RewardActivity.create({
          userId: citizen._id,
          points: 15,
          reason: `RSVPed to event: "${event.title}"`,
          badgeEarned: badgeName
        });
      }
    }

    // Trigger Notification for the organizer
    await Notification.create({
      userId: event.createdBy,
      title: 'New Event RSVP',
      message: `User "${req.user.name || req.user.email}" registered to attend "${event.title}".`
    });

    // Notify user
    await Notification.create({
      userId: req.user._id,
      title: 'RSVP Confirmed',
      message: `You are registered to attend "${event.title}". You earned 15 reward points!`
    });

    res.status(200).json({ success: true, message: 'RSVP successful', event });
  } catch (error) {
    next(error);
  }
};

// Business Sponsors an event
export const sponsorEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.sponsoredBy) {
      return res.status(400).json({ success: false, message: 'This event is already corporate sponsored' });
    }

    const business = await Business.findById(req.user._id);
    event.sponsoredBy = business.businessName;
    await event.save();

    // Notify Event Organizer
    await Notification.create({
      userId: event.createdBy,
      title: 'Corporate Sponsorship Secured',
      message: `Corporate entity "${business.businessName}" sponsored your event "${event.title}" for $5,000.`
    });

    res.status(200).json({ 
      success: true, 
      message: `Sponsorship confirmed for "${event.title}" by ${business.businessName}`,
      event 
    });
  } catch (error) {
    next(error);
  }
};
