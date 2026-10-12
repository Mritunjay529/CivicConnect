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
import routes from './routes.js';

const app = express();

// 1. Security HTTP Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// 2. CORS configuration (allows frontend origin from env or default localhost)
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: [clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
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
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@civicconnect.in').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'adminPassword123!';

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

    app.listen(PORT, () => {
      console.log(`🚀 CivicConnect Backend Server running on http://localhost:${PORT}`);
      console.log(`🌐 CORS enabled for: ${clientUrl}`);
    });
  } catch (error) {
    console.error('❌ Failed to start CivicConnect server:', error.message);
    process.exit(1);
  }
};

startServer();

export default app;
