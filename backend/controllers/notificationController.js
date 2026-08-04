import { Notification } from '../models/Notification.js';

// Get notifications for logged in user
export const getMineNotifications = async (req, res, next) => {
  try {
    const list = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: list.length, notifications: list });
  } catch (error) {
    next(error);
  }
};

// Mark notification as read
export const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notif = await Notification.findById(id);
    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notif.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access Denied: Notification belongs to another user' });
    }

    notif.read = true;
    await notif.save();

    res.status(200).json({ success: true, notification: notif });
  } catch (error) {
    next(error);
  }
};
