import mongoose from 'mongoose';

const options = { 
  discriminatorKey: 'role', 
  timestamps: true 
};

// Base User Schema
const baseUserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String, 
    required: false 
  },
  role: { 
    type: String, 
    enum: ['citizen', 'ngo', 'business', 'authority'], 
    required: true 
  }
}, options);

export const User = mongoose.model('User', baseUserSchema);

// Citizen Discriminator Schema
export const Citizen = User.discriminator('citizen', new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  points: { 
    type: Number, 
    default: 0 
  },
  badges: [{
    name: { type: String },
    icon: { type: String },
    description: { type: String },
    earnedAt: { type: Date, default: Date.now }
  }]
}));

// NGO Discriminator Schema
export const NGO = User.discriminator('ngo', new mongoose.Schema({
  orgName: { 
    type: String, 
    required: true 
  },
  registrationNumber: { 
    type: String, 
    required: true 
  },
  contactPerson: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'verified'], 
    default: 'pending' 
  }
}));

// Business Discriminator Schema
export const Business = User.discriminator('business', new mongoose.Schema({
  businessName: { 
    type: String, 
    required: true 
  },
  gstNumber: { 
    type: String, 
    required: true 
  },
  csrFocusArea: { 
    type: String, 
    required: true 
  }
}));

// Authority Discriminator Schema
export const Authority = User.discriminator('authority', new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  department: { 
    type: String, 
    required: true 
  },
  employeeId: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved'], 
    default: 'pending' 
  }
}));
