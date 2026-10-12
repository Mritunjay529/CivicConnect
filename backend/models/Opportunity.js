import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    applicantName: {
      type: String,
      default: ''
    },
    applicantEmail: {
      type: String,
      default: ''
    },
    applicantPhone: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date
    },
    certificateIssued: {
      type: Boolean,
      default: false
    },
    note: {
      type: String,
      trim: true
    }
  },
  {
    _id: true,
    timestamps: true
  }
);

const opportunitySchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    creatorName: {
      type: String,
      default: ''
    },
    creatorRole: {
      type: String,
      enum: ['ngo', 'business'],
      default: 'ngo'
    },
    type: {
      type: String,
      enum: ['volunteer', 'csr'],
      default: 'volunteer',
      index: true
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    category: {
      type: String,
      default: 'Community',
      index: true
    },
    date: {
      type: Date,
      index: true
    },
    location: {
      type: String,
      default: 'Metropolis'
    },
    mode: {
      type: String,
      enum: ['onsite', 'online'],
      default: 'onsite'
    },
    icon: {
      type: String,
      default: 'heart'
    },
    capacity: {
      type: Number,
      default: 10
    },
    certificateOffered: {
      type: Boolean,
      default: true
    },
    applications: [applicationSchema],

    // CSR Initiative specific fields
    budget: {
      type: String,
      default: ''
    },
    impactMetric: {
      type: String,
      default: ''
    },
    peopleImpacted: {
      type: Number,
      default: 0
    },
    sponsoredEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'completed'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

opportunitySchema.index({ type: 1, date: 1, category: 1 });

export const Opportunity = mongoose.model('Opportunity', opportunitySchema);
export default Opportunity;
