import PDFDocument from 'pdfkit';
import { User, Citizen } from '../models/User.js';
import { RewardActivity } from '../models/RewardActivity.js';
import { Complaint } from '../models/Complaint.js';
import { Opportunity } from '../models/Opportunity.js';
import { Event } from '../models/Event.js';

// Get profile details & contribution timelines
export const getUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    let profile = {
      id: user._id,
      email: user.email,
      role: user.role,
      phone: user.phone,
      createdAt: user.createdAt
    };

    let activityHistory = [];

    if (user.role === 'citizen') {
      const citizen = await Citizen.findById(id);
      profile.name = citizen.name;
      profile.points = citizen.points;
      profile.badges = citizen.badges;

      // Compile Citizen timeline: reports, volunteering, rsvps
      const citizenComplaints = await Complaint.find({ reporterId: id }).sort({ createdAt: -1 });
      const citizenOpps = await Opportunity.find({ 'applicants.userId': id }).sort({ createdAt: -1 });
      const citizenEvents = await Event.find({ rsvps: id }).sort({ createdAt: -1 });

      citizenComplaints.forEach(c => {
        activityHistory.push({
          id: c._id,
          type: 'report',
          title: c.title,
          date: c.createdAt.toISOString().split('T')[0],
          status: c.status
        });
      });

      citizenOpps.forEach(opp => {
        const app = opp.applicants.find(a => a.userId.toString() === id.toString());
        activityHistory.push({
          id: opp._id,
          type: 'volunteer',
          title: opp.title,
          date: opp.createdAt.toISOString().split('T')[0],
          status: app ? app.status : 'applied'
        });
      });

      citizenEvents.forEach(evt => {
        activityHistory.push({
          id: evt._id,
          type: 'rsvp',
          title: evt.title,
          date: evt.date.toISOString().split('T')[0],
          status: 'going'
        });
      });

    } else if (user.role === 'ngo') {
      profile.orgName = user.orgName;
      profile.contactPerson = user.contactPerson;
      profile.registrationNumber = user.registrationNumber;
      profile.status = user.status;

      const ngoOpps = await Opportunity.find({ postedBy: id }).sort({ createdAt: -1 });
      ngoOpps.forEach(opp => {
        activityHistory.push({
          id: opp._id,
          type: 'opportunity_posted',
          title: opp.title,
          date: opp.createdAt.toISOString().split('T')[0],
          status: `${opp.applicants.length} applications`
        });
      });

    } else if (user.role === 'business') {
      profile.businessName = user.businessName;
      profile.gstNumber = user.gstNumber;
      profile.csrFocusArea = user.csrFocusArea;

      const bizOpps = await Opportunity.find({ postedBy: id }).sort({ createdAt: -1 });
      bizOpps.forEach(opp => {
        activityHistory.push({
          id: opp._id,
          type: 'csr_posted',
          title: opp.title,
          date: opp.createdAt.toISOString().split('T')[0],
          status: `${opp.applicants.length} applications`
        });
      });
      
    } else if (user.role === 'authority') {
      profile.name = user.name;
      profile.department = user.department;
      profile.employeeId = user.employeeId;
      profile.status = user.status;

      const resolvedTickets = await Complaint.find({ status: 'resolved', assignedDepartment: user.department }).sort({ updatedAt: -1 });
      resolvedTickets.forEach(t => {
        activityHistory.push({
          id: t._id,
          type: 'resolved_ticket',
          title: t.title,
          date: t.updatedAt.toISOString().split('T')[0],
          status: 'resolved'
        });
      });
    }

    // Sort complete history by date descending
    activityHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    profile.activityHistory = activityHistory;

    // Retrieve points history logs (citizen only)
    if (user.role === 'citizen') {
      profile.pointsLog = await RewardActivity.find({ userId: id }).sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    next(error);
  }
};

// Compile and Download Certificate PDF stream
export const generateCertificate = async (req, res, next) => {
  try {
    const { id, activityId } = req.params;

    const citizen = await Citizen.findById(id);
    if (!citizen) {
      return res.status(404).json({ success: false, message: 'Citizen profile not found' });
    }

    const activity = await RewardActivity.findById(activityId);
    if (!activity) {
      // Fallback dummy activity for mock links `/api/users/:id/certificate/gen`
      const dummyActivity = {
        reason: 'Active participation in community cleanup and infrastructure reports',
        points: 100,
        createdAt: new Date()
      };
      return streamPdf(res, citizen, dummyActivity, 'MOCK-GEN');
    }

    return streamPdf(res, citizen, activity, activityId);
  } catch (error) {
    next(error);
  }
};

// Stream helper using PDFKit layout
const streamPdf = (res, user, activity, activityId) => {
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=certificate_${activityId}.pdf`);

  doc.pipe(res);

  // Borders
  doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
    .lineWidth(6)
    .stroke('#00685f'); // Primary color

  doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
    .lineWidth(2)
    .stroke('#565e74'); // Secondary color

  // Certificate text titles
  doc.font('Helvetica-Bold')
    .fontSize(38)
    .fillColor('#00685f')
    .text('CERTIFICATE OF CIVIC ACTION', 0, 100, { align: 'center' });

  doc.font('Helvetica')
    .fontSize(16)
    .fillColor('#565e74')
    .text('This token is proudly presented to', 0, 180, { align: 'center' });

  // Citizen Name
  doc.font('Helvetica-Bold')
    .fontSize(30)
    .fillColor('#2d3748')
    .text(user.name, 0, 220, { align: 'center' });

  // Detail body
  doc.font('Helvetica-Oblique')
    .fontSize(14)
    .fillColor('#718096')
    .text('In recognition of active citizenship and contribution to urban development:', 0, 280, { align: 'center' });

  doc.font('Helvetica-Bold')
    .fontSize(16)
    .fillColor('#1a202c')
    .text(`"${activity.reason}"`, 0, 310, { align: 'center' });

  doc.font('Helvetica')
    .fontSize(12)
    .fillColor('#718096')
    .text(`Points Logged: ${activity.points} | Token ID: ${activityId}`, 0, 345, { align: 'center' });

  doc.font('Helvetica')
    .fontSize(12)
    .fillColor('#718096')
    .text(`Awarded on: ${new Date(activity.createdAt).toISOString().split('T')[0]}`, 0, 375, { align: 'center' });

  // Signatures
  doc.lineCap('butt')
    .moveTo(120, 470)
    .lineTo(320, 470)
    .lineWidth(1)
    .stroke('#a0aec0');

  doc.lineCap('butt')
    .moveTo(520, 470)
    .lineTo(720, 470)
    .lineWidth(1)
    .stroke('#a0aec0');

  doc.font('Helvetica')
    .fontSize(10)
    .fillColor('#718096')
    .text('MUNICIPAL OFFICE COMMISSIONER', 120, 480, { width: 200, align: 'center' })
    .text('CIVICCONNECT NETWORK BOARD', 520, 480, { width: 200, align: 'center' });

  doc.end();
};
