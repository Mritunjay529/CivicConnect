import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { connectDB } from './config/db.js';
import { verifyTransporter } from './utils/mailer.js';
import { errorHandler } from './middleware/index.js';
import { User } from './models/User.js';
import { Opportunity } from './models/Opportunity.js';
import routes from './routes.js';

const app = express();

// 1. Security HTTP Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// 2. CORS configuration: explicitly allow configured frontend origins.
const configuredClientUrls = (process.env.CLIENT_URLS || process.env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);
const allowedOrigins = new Set([
  ...configuredClientUrls,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
]);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error('Origin is not allowed by CivicConnect CORS policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// 3. Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Static folder for uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// 5. Rate limiting for Authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.'
  }
});
app.use('/api/auth', authLimiter);

// 6. Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CivicConnect API server is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// 7. Mount all API routes
app.use('/api', routes);

// 8. 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found`
  });
});

// 9. Centralized Error Handler Middleware
app.use(errorHandler);

// Admin Seeder function
const seedAdminUser = async () => {
  try {
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      console.warn('Admin seeding skipped: set ADMIN_EMAIL and ADMIN_PASSWORD in the host environment.');
      return;
    }
    const adminEmail = process.env.ADMIN_EMAIL.toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD;

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: 'CivicConnect Administrator',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        status: 'active',
        isEmailVerified: true
      });
      console.log(`🛡️  Admin user successfully seeded: ${adminEmail}`);
    } else {
      console.log(`🛡️  Admin account ready: ${adminEmail}`);
    }
  } catch (error) {
    console.error('⚠️  Failed to seed admin user:', error.message);
  }
};

// Seed initial volunteer opportunities if none exist
const seedOpportunities = async () => {
  try {
    const count = await Opportunity.countDocuments();
    if (count === 0) {
      const creator = (await User.findOne({ role: 'ngo' })) || (await User.findOne({ role: 'admin' }));
      if (creator) {
        await Opportunity.create([
          {
            creator: creator._id,
            creatorName: 'GreenEarth Network',
            creatorRole: 'ngo',
            type: 'volunteer',
            title: 'Community Tree Planting Drive',
            description: 'Join us to plant over 500 indigenous saplings across the East Riverbank Park to combat urban heat islands.',
            category: 'Environment',
            date: new Date('2026-08-05'),
            location: 'East Riverbank Park, Gate 3',
            capacity: 12,
            applications: []
          },
          {
            creator: creator._id,
            creatorName: 'Metropolis Care Foundation',
            creatorRole: 'ngo',
            type: 'volunteer',
            title: 'Weekend Soup Kitchen Helpers',
            description: 'We need volunteers to assist with food preparation, table services, and cleanup at our weekly soup kitchen. Bring an apron and a smile!',
            category: 'Social Support',
            date: new Date('2026-08-09'),
            location: 'Central Soup Kitchen, 45 Pine St',
            capacity: 10,
            applications: []
          },
          {
            creator: creator._id,
            creatorName: 'FutureMinds Academics',
            creatorRole: 'ngo',
            type: 'volunteer',
            title: 'Interactive Math Tutoring for Kids',
            description: 'Help underrepresented elementary school children catch up on foundational mathematics. Sessions are held at the local public library.',
            category: 'Education',
            date: new Date('2026-08-12'),
            location: 'Metropolis Public Library (Room B)',
            capacity: 6,
            applications: []
          }
        ]);
        console.log('🌱 Sample volunteer opportunities initialized in database');
      }
    }
  } catch (error) {
    console.error('⚠️  Failed to seed opportunities:', error.message);
  }
};

// Server Initialization
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Verify SMTP configuration (non-blocking)
    verifyTransporter();

    // Seed default admin user if not already present
    await seedAdminUser();

    // Seed initial opportunities if database is empty
    await seedOpportunities();

    app.listen(PORT, () => {
      console.log(`🚀 CivicConnect Backend Server running on http://localhost:${PORT}`);
      console.log(`🌐 CORS enabled for configured origins: ${[...allowedOrigins].join(', ')}`);
    });
  } catch (error) {
    console.error('❌ Failed to start CivicConnect server:', error.message);
    process.exit(1);
  }
};

startServer();

export default app;
