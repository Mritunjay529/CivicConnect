import nodemailer from 'nodemailer';

// Configure SMTP transporter from environment variables
const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const config = {
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined
  };

  return nodemailer.createTransport(config);
};

export const transporter = createTransporter();

// Verify connection on startup without crashing the server
export const verifyTransporter = () => {
  transporter.verify((error) => {
    if (error) {
      console.warn('⚠️ SMTP Transporter verification warning (Check .env SMTP settings):', error.message);
    } else {
      console.log('✅ SMTP Transporter connected and ready to send emails');
    }
  });
};

/**
 * Base email layout wrapper with CivicConnect Teal & Navy brand identity
 */
const baseLayout = (title, bodyContent) => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 32px 16px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
              <!-- Header -->
              <tr>
                <td style="background-color: #0f172a; padding: 28px 32px; text-align: left; border-bottom: 4px solid #0f766e;">
                  <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                    Civic<span style="color: #2dd4bf;">Connect</span>
                  </h1>
                  <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">Empowering citizens, communities & local governance</p>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding: 32px; font-size: 15px; line-height: 1.6; color: #334155;">
                  ${bodyContent}
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
                  <p style="margin: 0 0 6px;">This is an automated notification from CivicConnect.</p>
                  <p style="margin: 0;">© ${new Date().getFullYear()} CivicConnect Platform. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
};

// 1. Signup Welcome Email Template
export const signupWelcomeTemplate = (user) => {
  const isAuthority = user.role === 'authority';
  const displayName = user.name || user.orgName || user.bizName || user.department || 'Civic Member';

  if (isAuthority) {
    const content = `
      <h2 style="margin: 0 0 16px; font-size: 20px; color: #0f172a;">Access Request Received</h2>
      <p>Hello <strong>${displayName}</strong>,</p>
      <p>Thank you for submitting an official registration for the <strong>${user.department || 'Municipal Authority'}</strong> division (Employee ID: <code>${user.employeeId || 'N/A'}</code>).</p>
      <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 16px; margin: 20px 0; border-radius: 4px;">
        <strong style="color: #b45309;">Pending Administrator Verification:</strong>
        <p style="margin: 4px 0 0; color: #92400e; font-size: 14px;">Your account access is currently in review. An administrator will verify your credentials shortly. You will receive an email confirmation as soon as your access is granted.</p>
      </div>
      <p>If you did not initiate this request, please contact our administrative security desk immediately.</p>
    `;
    return baseLayout('CivicConnect - Authority Verification Pending', content);
  }

  const roleLabel = {
    citizen: 'Citizen Advocate',
    ngo: 'NGO Partner',
    business: 'Corporate CSR Partner'
  }[user.role] || 'Member';

  const content = `
    <h2 style="margin: 0 0 16px; font-size: 20px; color: #0f172a;">Welcome to CivicConnect!</h2>
    <p>Hello <strong>${displayName}</strong>,</p>
    <p>Welcome to CivicConnect as a verified <strong>${roleLabel}</strong>. Your account is active and ready to make an impact in your local community.</p>
    <ul style="padding-left: 20px; margin: 16px 0; color: #475569;">
      ${user.role === 'citizen' ? `
        <li>Report civic issues and track resolutions in real-time</li>
        <li>Earn Civic reward points and badges for verified contributions</li>
        <li>Discover and join local NGO volunteer opportunities</li>
      ` : user.role === 'ngo' ? `
        <li>Post community volunteer opportunities and drives</li>
        <li>Review volunteer applications and track attendance</li>
        <li>Collaborate with corporate sponsors on CSR initiatives</li>
      ` : `
        <li>Sponsor community CSR projects and initiatives</li>
        <li>Track social impact metrics and civic engagement</li>
        <li>Partner with vetted non-profit organizations</li>
      `}
    </ul>
    <p>We are thrilled to have you partner with us for transparent and collaborative city building.</p>
  `;
  return baseLayout('Welcome to CivicConnect', content);
};

// 2. Login Security Alert Template
export const loginAlertTemplate = (user, { ip = 'Unknown', userAgent = 'Unknown', timestamp = new Date() }) => {
  const content = `
    <h2 style="margin: 0 0 16px; font-size: 20px; color: #0f172a;">Security Alert: New Sign-in Detected</h2>
    <p>Hello <strong>${user.name || user.email}</strong>,</p>
    <p>We noticed a new sign-in to your CivicConnect account. Here are the details:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
      <tr>
        <td style="padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; font-weight: 600; width: 35%;">Date & Time:</td>
        <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${new Date(timestamp).toUTCString()}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; font-weight: 600;">IP Address:</td>
        <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${ip}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; font-weight: 600;">Device / Browser:</td>
        <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${userAgent}</td>
      </tr>
    </table>
    <p style="font-size: 13px; color: #64748b;">If this was you, you can safely disregard this email. If you did not log in, please reset your password immediately to safeguard your account.</p>
  `;
  return baseLayout('Security Alert: New Sign-in', content);
};

// 3. Forgot Password Template
export const forgotPasswordTemplate = (user, resetUrl) => {
  const content = `
    <h2 style="margin: 0 0 16px; font-size: 20px; color: #0f172a;">Password Reset Request</h2>
    <p>Hello <strong>${user.name || 'User'}</strong>,</p>
    <p>You requested to reset your password for your CivicConnect account. Click the button below to choose a new password:</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${resetUrl}" style="background-color: #0f766e; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">
        Reset My Password
      </a>
    </div>
    <p style="font-size: 13px; color: #64748b; margin-bottom: 8px;">Or copy and paste this link in your browser:</p>
    <p style="font-size: 12px; color: #0f766e; word-break: break-all; background: #f8fafc; padding: 8px 12px; border-radius: 4px; border: 1px solid #e2e8f0;">
      ${resetUrl}
    </p>
    <p style="font-size: 13px; color: #ef4444; font-weight: 500;">⏰ Note: This password reset link is valid for 15 minutes only.</p>
    <p style="font-size: 13px; color: #64748b;">If you did not request a password reset, you can safely ignore this email.</p>
  `;
  return baseLayout('Reset Your CivicConnect Password', content);
};

// 4. Password Changed Confirmation Template
export const passwordChangedTemplate = (user) => {
  const content = `
    <h2 style="margin: 0 0 16px; font-size: 20px; color: #0f172a;">Password Updated Successfully</h2>
    <p>Hello <strong>${user.name || 'User'}</strong>,</p>
    <p>This is a confirmation that the password for your CivicConnect account (<code>${user.email}</code>) was successfully updated.</p>
    <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 12px 16px; margin: 20px 0; border-radius: 4px; color: #166534; font-size: 14px;">
      Your account credentials have been securely updated. You can now log in using your new password.
    </div>
    <p style="font-size: 13px; color: #64748b;">If you did not perform this change, please reach out to CivicConnect support immediately.</p>
  `;
  return baseLayout('Password Changed Successfully', content);
};

// 5. Complaint Status Update Template
export const complaintStatusTemplate = (user, complaint, oldStatus, newStatus, note = '') => {
  const statusColor = {
    pending: '#eab308',
    in_progress: '#3b82f6',
    resolved: '#10b981',
    rejected: '#ef4444'
  }[newStatus] || '#0f766e';

  const statusLabel = {
    pending: 'Pending Review',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    rejected: 'Rejected'
  }[newStatus] || newStatus;

  const content = `
    <h2 style="margin: 0 0 16px; font-size: 20px; color: #0f172a;">Complaint Status Updated: ${statusLabel}</h2>
    <p>Hello <strong>${user.name || 'Citizen'}</strong>,</p>
    <p>There is an official update on your reported civic issue:</p>
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 18px 0;">
      <h3 style="margin: 0 0 8px; font-size: 16px; color: #0f172a;">${complaint.title || complaint.category}</h3>
      <p style="margin: 0 0 6px; font-size: 14px; color: #475569;"><strong>Location:</strong> ${typeof complaint.location === 'object' ? complaint.location.address : complaint.location}</p>
      <p style="margin: 0 0 6px; font-size: 14px; color: #475569;"><strong>Category:</strong> ${complaint.category} | <strong>Priority:</strong> ${complaint.priority}</p>
      <div style="margin-top: 12px; display: inline-block; background-color: ${statusColor}; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase;">
        Status: ${statusLabel}
      </div>
      ${note ? `<p style="margin: 12px 0 0; font-size: 14px; color: #1e293b; background: #ffffff; padding: 10px; border-radius: 4px; border-left: 3px solid ${statusColor};"><strong>Authority Note:</strong> ${note}</p>` : ''}
    </div>
    ${newStatus === 'resolved' ? `
      <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 14px; margin: 16px 0; color: #065f46;">
        🎉 <strong>+20 Civic Reward Points Awarded!</strong> Thank you for your active citizenship in making our city cleaner and safer. You can now leave feedback and ratings on this resolution in your dashboard.
      </div>
    ` : ''}
    <p style="font-size: 13px; color: #64748b;">You can view full updates and activity logs anytime on the CivicConnect portal.</p>
  `;
  return baseLayout(`Issue Update: ${statusLabel}`, content);
};

// 6. Volunteer Application Status Template
export const volunteerApplicationStatusTemplate = (user, opportunity, status) => {
  const isApproved = status === 'approved';
  const statusColor = isApproved ? '#10b981' : '#ef4444';
  const statusTitle = isApproved ? 'Application Approved!' : 'Application Update';

  const content = `
    <h2 style="margin: 0 0 16px; font-size: 20px; color: #0f172a;">${statusTitle}</h2>
    <p>Hello <strong>${user.name || 'Volunteer'}</strong>,</p>
    <p>Your application to participate in the volunteer opportunity <strong>"${opportunity.title}"</strong> has been <strong>${status}</strong> by the organizer.</p>
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 18px 0;">
      <h3 style="margin: 0 0 8px; font-size: 16px; color: #0f172a;">${opportunity.title}</h3>
      <p style="margin: 0 0 6px; font-size: 14px; color: #475569;"><strong>Date:</strong> ${opportunity.date ? new Date(opportunity.date).toLocaleDateString() : 'TBA'}</p>
      <p style="margin: 0 0 6px; font-size: 14px; color: #475569;"><strong>Location:</strong> ${opportunity.location || 'Local Metropolis'}</p>
      <p style="margin: 0; font-size: 14px; color: #475569;"><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: 700; text-transform: uppercase;">${status}</span></p>
    </div>
    ${isApproved ? `
      <p style="color: #047857; font-weight: 500;">Please arrive 15 minutes before the scheduled time. Upon completion, you will receive +50 reward points and a certificate of participation.</p>
    ` : `
      <p style="color: #64748b;">Thank you for your willingness to help! Please check our listings for other exciting volunteer drives.</p>
    `}
  `;
  return baseLayout(`Volunteer Drive: Application ${status}`, content);
};

// 7. Authority Account Verification Template
export const authorityStatusTemplate = (user, status) => {
  const isApproved = status === 'active';
  const statusTitle = isApproved ? 'Authority Access Approved' : 'Authority Application Update';

  const content = `
    <h2 style="margin: 0 0 16px; font-size: 20px; color: #0f172a;">${statusTitle}</h2>
    <p>Hello <strong>${user.name || user.department || 'Officer'}</strong>,</p>
    ${isApproved ? `
      <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 14px; margin: 16px 0; color: #065f46;">
        ✅ <strong>Your municipal credentials have been verified and approved by the system administrator.</strong>
      </div>
      <p>You can now log in to the <strong>Municipal Authority Dashboard</strong> to review citizen complaints, update work orders, and assign department resolution teams.</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" style="background-color: #0f766e; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
          Log In to Municipal Portal
        </a>
      </div>
    ` : `
      <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 14px; margin: 16px 0; color: #991b1b;">
        ❌ <strong>Your municipal access application has been rejected by the administrator.</strong>
      </div>
      <p>If you believe this is in error, please contact your municipal IT desk or CivicConnect administrator with your official employee identification.</p>
    `}
  `;
  return baseLayout(`CivicConnect Authority Status: ${isApproved ? 'Approved' : 'Rejected'}`, content);
};

/**
 * Fire-and-forget email sender helper
 * Logs failures without breaking the API response
 */
export const sendMail = async ({ to, subject, html, text }) => {
  if (!to) {
    console.warn('⚠️ sendMail: No recipient email provided. Skipping.');
    return;
  }

  const from = process.env.MAIL_FROM || 'CivicConnect <no-reply@civicconnect.in>';

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text: text || 'This email requires HTML support.'
    });
    console.log(`✉️ Email sent to ${to} (${subject}) - ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    // Never throw error in fire-and-forget
    return null;
  }
};
