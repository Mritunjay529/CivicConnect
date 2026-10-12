import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    organizerName: {
      type: String,
      default: ''
    },
    organizerRole: {
      type: String,
      enum: ['ngo', 'business', 'authority', 'admin'],
      default: 'ngo'
    },
    category: {
      type: String,
      default: 'Civic'
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      default: 'Metropolis City Hall'
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
      index: true
    },
    time: {
      type: String,
      default: '10:00 AM - 01:00 PM'
    },
    sponsoredBy: {
      type: String,
      default: ''
    },
    // RSVPs embedded as an array of user ObjectIds
    rsvps: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

export const Event = mongoose.model('Event', eventSchema);
export default Event;
