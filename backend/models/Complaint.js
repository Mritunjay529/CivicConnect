import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    imageUrl: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      enum: [
        'Pothole',
        'Water leakage',
        'Broken streetlight',
        'Garbage overflow',
        'Road Repair',
        'Waste Management',
        'Street Lighting',
        'Sanitation & Sewage',
        'Traffic Signage',
        'Other'
      ],
      default: 'Other',
      index: true
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
      index: true
    },
    location: {
      address: {
        type: String,
        default: ''
      },
      lat: {
        type: Number,
        default: null
      },
      lng: {
        type: Number,
        default: null
      }
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved', 'rejected'],
      default: 'pending',
      index: true
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    citizenName: {
      type: String,
      default: ''
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    department: {
      type: String,
      default: ''
    },
    notes: [
      {
        note: String,
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    updates: [
      {
        date: {
          type: Date,
          default: Date.now
        },
        text: String
      }
    ],
    supporters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    supportCount: {
      type: Number,
      default: 0,
      index: true
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        trim: true
      },
      submittedAt: {
        type: Date
      }
    }
  },
  {
    timestamps: true
  }
);

// Compound index for authority sorting
complaintSchema.index({ status: 1, priority: 1, supportCount: -1, createdAt: -1 });

export const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint;
