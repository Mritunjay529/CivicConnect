import { Event } from '../models/Event.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { asyncHandler } from '../utils/helpers.js';
import { sendMail, eventRsvpConfirmationTemplate } from '../utils/mailer.js';

/**
 * @desc    Create a new community event
 * @route   POST /api/events
 * @access  Private (NGO, Business, Authority, Admin)
 */
export const createEvent = asyncHandler(async (req, res) => {
  const { title, description, category, location, date, time, sponsoredBy } = req.body;

  if (!title || !description || !location || !date) {
    return res.status(400).json({
      success: false,
      message: 'Title, description, location, and date are required'
    });
  }

  const event = await Event.create({
    title,
    description,
    category: category || 'Civic Engagement',
    location,
    date: new Date(date),
    time: time || '10:00 AM - 01:00 PM',
    sponsoredBy: sponsoredBy || '',
    organizer: req.user._id,
    organizerName: req.user.name || req.user.orgName || req.user.bizName || req.user.department || 'Civic Leader',
    organizerRole: req.user.role,
    rsvps: []
  });

  // Notify all citizens about newly posted community event
  try {
    const citizens = await User.find({ role: 'citizen' }).select('_id');
    if (citizens && citizens.length > 0) {
      const orgName = req.user.name || req.user.orgName || req.user.bizName || req.user.department || 'An organization';
      const eventDateFormatted = date ? new Date(date).toISOString().split('T')[0] : '';
      const notifTitle = `New Community Event: ${event.title}`;
      const notifMessage = `${orgName} announced a new event: "${event.title}" on ${eventDateFormatted} at ${location}. RSVP now!`;

      const notifications = citizens.map((c) => ({
        user: c._id,
        title: notifTitle,
        message: notifMessage,
        type: 'general',
        relatedId: event._id,
        read: false
      }));

      await Notification.insertMany(notifications);
    }
  } catch (notifErr) {
    console.warn('Failed to notify citizens of event:', notifErr.message);
  }

  res.status(201).json({
    success: true,
    message: 'Event published successfully',
    data: event
  });
});

/**
 * @desc    Get upcoming events (optionally filtered by ?month=YYYY-MM)
 * @route   GET /api/events
 * @access  Private
 */
export const getEvents = asyncHandler(async (req, res) => {
  const { month } = req.query;

  const query = {};

  if (month) {
    // Expected format: YYYY-MM (e.g., 2026-08) or month index/name
    let year, monthIndex;
    if (month.includes('-')) {
      const parts = month.split('-');
      year = parseInt(parts[0], 10);
      monthIndex = parseInt(parts[1], 10) - 1;
    } else {
      year = new Date().getFullYear();
      monthIndex = parseInt(month, 10) - 1;
    }

    if (!isNaN(year) && !isNaN(monthIndex)) {
      const startDate = new Date(year, monthIndex, 1);
      const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }
  }

  const events = await Event.find(query)
    .populate('organizer', 'name orgName bizName department')
    .sort({ date: 1 });

  // Map events to include whether logged-in user has RSVP'd
  const userIdStr = req.user ? req.user._id.toString() : null;
  const formattedEvents = events.map((evt) => {
    const obj = evt.toObject();
    obj.rsvpCount = evt.rsvps.length;
    obj.hasRsvp = userIdStr ? evt.rsvps.some((id) => id.toString() === userIdStr) : false;
    return obj;
  });

  res.status(200).json({
    success: true,
    count: formattedEvents.length,
    data: formattedEvents
  });
});

/**
 * @desc    Toggle RSVP for an event
 * @route   POST /api/events/:id/rsvp
 * @access  Private
 */
export const toggleRsvp = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  const userIdStr = req.user._id.toString();
  const existingIndex = event.rsvps.findIndex((id) => id.toString() === userIdStr);

  let isRsvpd = false;
  if (existingIndex > -1) {
    // Remove RSVP
    event.rsvps.splice(existingIndex, 1);
    isRsvpd = false;
  } else {
    // Add RSVP
    event.rsvps.push(req.user._id);
    isRsvpd = true;
  }

  await event.save();

  // Send RSVP confirmation email to attendee
  if (isRsvpd && req.user?.email) {
    const rsvpHtml = eventRsvpConfirmationTemplate(req.user, event);
    sendMail({
      to: req.user.email,
      subject: `CivicConnect: RSVP Confirmed for "${event.title}"`,
      html: rsvpHtml
    });
  }

  res.status(200).json({
    success: true,
    message: isRsvpd ? 'RSVP confirmed' : 'RSVP cancelled',
    data: {
      hasRsvp: isRsvpd,
      rsvpCount: event.rsvps.length
    }
  });
});
