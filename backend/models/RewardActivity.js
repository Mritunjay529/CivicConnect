import mongoose from 'mongoose';

const rewardActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  badgeEarned: {
    type: String,
    default: null
  },
  certificateUrl: {
    type: String,
    default: null
  }
}, { timestamps: true });

export const RewardActivity = mongoose.model('RewardActivity', rewardActivitySchema);
