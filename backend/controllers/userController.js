import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { asyncHandler, calculateRewardProgress, evaluateBadges } from '../utils/helpers.js';
import { sendMail, authorityStatusTemplate } from '../utils/mailer.js';

/**
 * @desc    Get user profile with calculated reward points progress and badges
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User profile not found'
    });
  }

  // Ensure badges are up to date
  const evaluatedBadges = evaluateBadges(
    user.rewardPoints || 0,
    user.eventsCompleted || 0,
    0
  );

  const rewardProgress = calculateRewardProgress(user.rewardPoints || 0);

  const profileData = user.toObject();
  profileData.badges = evaluatedBadges;
  profileData.rewardProgress = rewardProgress;

  res.status(200).json({
    success: true,
    data: profileData
  });
});

/**
 * @desc    Update user profile fields
 * @route   PATCH /api/users/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'name',
    'phone',
    'orgName',
    'regNumber',
    'contact',
    'bizName',
    'gst',
    'focusArea',
    'department'
  ];

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  }

  await user.save();

  const rewardProgress = calculateRewardProgress(user.rewardPoints || 0);
  const updatedUserObj = user.toObject();
  updatedUserObj.rewardProgress = rewardProgress;

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedUserObj
  });
});

/**
 * @desc    Get logged-in user notifications
 * @route   GET /api/notifications
 * @access  Private
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });

  const unreadCount = notifications.filter((n) => !n.read).length;

  res.status(200).json({
    success: true,
    count: notifications.length,
    unreadCount,
    data: notifications
  });
});

/**
 * @desc    Mark single notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  notification.read = true;
  await notification.save();

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    data: notification
  });
});

/**
 * @desc    Mark all user notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { $set: { read: true } });

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

/**
 * @desc    Admin: Get list of pending municipal authority registrations
 * @route   GET /api/admin/pending-authorities
 * @access  Private (Admin)
 */
export const getPendingAuthorities = asyncHandler(async (req, res) => {
  const pendingUsers = await User.find({
    role: 'authority',
    status: 'pending'
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: pendingUsers.length,
    data: pendingUsers
  });
});

/**
 * @desc    Admin: Review and approve/reject authority registration
 * @route   PATCH /api/admin/authorities/:id
 * @access  Private (Admin)
 */
export const reviewAuthority = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['active', 'rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be 'active' to approve or 'rejected' to decline"
    });
  }

  const authorityUser = await User.findOne({
    _id: req.params.id,
    role: 'authority'
  });

  if (!authorityUser) {
    return res.status(404).json({
      success: false,
      message: 'Authority account record not found'
    });
  }

  authorityUser.status = status;
  await authorityUser.save();

  // Create in-app notification
  await Notification.create({
    user: authorityUser._id,
    title: status === 'active' ? 'Authority Access Approved' : 'Authority Access Rejected',
    message:
      status === 'active'
        ? 'Your municipal officer credentials have been verified. You can now access the authority portal.'
        : 'Your municipal authority access application was not approved.',
    type: 'authority'
  }).catch((err) => console.warn('Notification err:', err.message));

  // Send status email fire-and-forget
  const emailHtml = authorityStatusTemplate(authorityUser, status);
  sendMail({
    to: authorityUser.email,
    subject: `CivicConnect: Municipal Authority Access ${status === 'active' ? 'Approved' : 'Rejected'}`,
    html: emailHtml
  });

  res.status(200).json({
    success: true,
    message: `Authority access ${status === 'active' ? 'approved' : 'rejected'} successfully`,
    data: authorityUser
  });
});
