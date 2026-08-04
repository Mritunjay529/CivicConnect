import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rsvps: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  type: {
    type: String,
    enum: ['campaign', 'volunteering', 'csr'],
    required: true
  },
  sponsoredBy: {
    type: String, // Company name or business ref
    default: null
  }
}, { timestamps: true });

export const Event = mongoose.model('Event', eventSchema);
