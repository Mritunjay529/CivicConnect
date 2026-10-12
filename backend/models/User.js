import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    phone: {
      type: String,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false
    },
    role: {
      type: String,
      enum: ['citizen', 'ngo', 'business', 'authority', 'admin'],
      default: 'citizen',
      index: true
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'rejected'],
      default: function () {
        return this.role === 'authority' ? 'pending' : 'active';
      },
      index: true
    },
    rewardPoints: {
      type: Number,
      default: 0
    },
    badges: [
      {
        id: String,
        name: String,
        icon: String,
        description: String,
        earnedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    resetPasswordToken: {
      type: String
    },
    resetPasswordExpiry: {
      type: Date
    },
    lastLoginAt: {
      type: Date
    },
    eventsCompleted: {
      type: Number,
      default: 0
    },

    // NGO specific fields
    orgName: {
      type: String,
      trim: true
    },
    regNumber: {
      type: String,
      trim: true
    },
    contact: {
      type: String,
      trim: true
    },

    // Business specific fields
    bizName: {
      type: String,
      trim: true
    },
    gst: {
      type: String,
      trim: true
    },
    focusArea: {
      type: String,
      trim: true
    },

    // Authority specific fields
    department: {
      type: String,
      trim: true
    },
    employeeId: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password candidate
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);
export default User;
