import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User, Citizen, NGO, Business, Authority } from '../models/User.js';
import { Complaint } from '../models/Complaint.js';
import { Opportunity } from '../models/Opportunity.js';
import { Event } from '../models/Event.js';
import { RewardActivity } from '../models/RewardActivity.js';
import { Notification } from '../models/Notification.js';

dotenv.config();

const seed = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/civicconnect');
    console.log('Connected! Cleaning database collections...');

    // Wipe tables
    await User.deleteMany({});
    await Complaint.deleteMany({});
    await Opportunity.deleteMany({});
    await Event.deleteMany({});
    await RewardActivity.deleteMany({});
    await Notification.deleteMany({});

    console.log('Creating demo users...');
    const salt = await bcrypt.genSalt(10);
    const commonPassword = await bcrypt.hash('password123', salt);

    // 1. Citizen
    const citizenUser = await Citizen.create({
      name: 'Aria Chen',
      email: 'aria.chen@citizen.org',
      password: commonPassword,
      phone: '+1 (555) 123-4567',
      role: 'citizen',
      points: 150,
      badges: [
        { name: 'First Reporter', icon: 'stars', description: 'Filed your first civic complaint' }
      ]
    });

    // 2. NGO
    const ngoUser = await NGO.create({
      orgName: 'GreenEarth Network',
      registrationNumber: 'NGO-102938',
      contactPerson: 'Sarah Jenkins',
      email: 'info@greenearth.org',
      password: commonPassword,
      phone: '+1 (555) 987-6543',
      role: 'ngo',
      status: 'verified'
    });

    // 3. Business
    const businessUser = await Business.create({
      businessName: 'EcoTech Innovations',
      gstNumber: 'GST-9988776655',
      csrFocusArea: 'Environment',
      email: 'csr@ecotech.com',
      password: commonPassword,
      phone: '+1 (555) 333-4444',
      role: 'business'
    });

    // 4. Approved Authority Rep
    const authorityUser = await Authority.create({
      name: 'Inspector Henderson',
      department: 'Road Repair',
      employeeId: 'EMP-998',
      email: 'henderson@metropolis.gov',
      password: commonPassword,
      phone: '+1 (555) 222-1111',
      role: 'authority',
      status: 'approved'
    });

    // 5. Pending Authority Rep
    const pendingAuthority = await Authority.create({
      name: 'Officer Miller',
      department: 'Waste Management',
      employeeId: 'EMP-997',
      email: 'miller@metropolis.gov',
      password: commonPassword,
      phone: '+1 (555) 222-1112',
      role: 'authority',
      status: 'pending'
    });

    console.log('Seeding complaints...');
    // Complaint 1: In Progress
    const comp1 = await Complaint.create({
      reporterId: citizenUser._id,
      title: 'Hazardous Pothole on Main Street',
      description: 'A deep pothole has formed in the middle lane of Main St near the 5th Avenue crossing. It poses a high risk to passing motorcyclists.',
      imageUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80',
      category: 'Road Repair',
      priority: 'high',
      status: 'in_progress',
      location: {
        address: '5th Ave & Main St, Metropolis',
        lat: 40.7128,
        lng: -74.0060
      },
      assignedDepartment: 'Road Repair',
      updates: [
        { text: 'Complaint registered. Category tagged as "Road Repair" with priority "high" by AI.' },
        { text: 'Issue assigned to Road Repair department. Progress: In Progress.' }
      ]
    });

    // Complaint 2: Pending
    const comp2 = await Complaint.create({
      reporterId: citizenUser._id,
      title: 'Broken Streetlights in Central Park Path',
      description: 'Three consecutive solar streetlights along the eastern walking trail of Central Park are completely out.',
      imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80',
      category: 'Street Lighting',
      priority: 'medium',
      status: 'pending',
      location: {
        address: 'East Trail, Central Park',
        lat: 40.7829,
        lng: -73.9654
      },
      updates: [
        { text: 'Complaint registered. Category tagged as "Street Lighting" with priority "medium" by AI.' }
      ]
    });

    // Complaint 3: Resolved
    const comp3 = await Complaint.create({
      reporterId: citizenUser._id,
      title: 'Illegal Garbage Dumping behind Community Center',
      description: 'Large piles of plastic trash, wooden construction scrap, and broken appliances have been dumped in the alleyway.',
      imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80',
      category: 'Waste Management',
      priority: 'medium',
      status: 'resolved',
      location: {
        address: '12 Civic Plaza (Back Alley), Metropolis',
        lat: 40.7306,
        lng: -73.9352
      },
      updates: [
        { text: 'Complaint registered. Category tagged as "Waste Management" by AI.' },
        { text: 'Municipal Sanitation crew resolved the issue. Verified by representative.' }
      ]
    });

    console.log('Seeding opportunities...');
    const opp1 = await Opportunity.create({
      postedBy: ngoUser._id,
      title: 'Community Tree Planting Drive',
      description: 'Join us to plant 100 native saplings in the northern forest reserve. Help build Metropolis\'s new green lung!',
      category: 'Environment',
      date: new Date('2026-08-08'),
      location: 'Metropolis Northern Reserve',
      capacity: 25,
      applicants: [
        { userId: citizenUser._id, status: 'approved' }
      ]
    });

    const opp2 = await Opportunity.create({
      postedBy: ngoUser._id,
      title: 'Weekend Soup Kitchen Helpers',
      description: 'We need volunteers to assist with food preparation and cleanup at our weekly soup kitchen.',
      category: 'Social Support',
      date: new Date('2026-08-09'),
      location: 'Central Soup Kitchen, 45 Pine St',
      capacity: 10
    });

    console.log('Seeding events...');
    await Event.create({
      title: 'Annual Green Living Workshop',
      description: 'Learn sustainable household practices, home waste composting, and rainwater harvesting techniques.',
      date: new Date('2026-08-10'),
      createdBy: ngoUser._id,
      rsvps: [citizenUser._id],
      type: 'volunteering',
      sponsoredBy: businessUser.businessName
    });

    console.log('Seeding Reward logs...');
    await RewardActivity.create({
      userId: citizenUser._id,
      points: 50,
      reason: 'Reported a new civic issue: "Hazardous Pothole on Main Street"'
    });

    await RewardActivity.create({
      userId: citizenUser._id,
      points: 100,
      reason: 'Report resolved: "Illegal Garbage Dumping behind Community Center"',
      badgeEarned: 'First Reporter',
      certificateUrl: `/api/users/${citizenUser._id}/certificate/gen`
    });

    console.log('Seeding notifications...');
    await Notification.create({
      userId: citizenUser._id,
      title: 'Ticket Submitted',
      message: 'Your report "Hazardous Pothole on Main Street" is queued for verification.',
      read: true
    });

    await Notification.create({
      userId: citizenUser._id,
      title: 'Issue Resolved!',
      message: 'Awesome! Your reported ticket "Illegal Garbage Dumping behind Community Center" is resolved. You earned 100 reward points!',
      read: false
    });

    console.log('Database seeded successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

seed();
