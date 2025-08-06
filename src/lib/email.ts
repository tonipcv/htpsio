import { createTransport } from 'nodemailer';

// Check for SMTP configuration
let smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && 
                      process.env.SMTP_PASSWORD && process.env.SMTP_FROM);

// Debug SMTP configuration on startup
console.log('SMTP Configuration Status:', {
  configured: smtpConfigured,
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER ? 'Set' : 'Not set',
  pass: process.env.SMTP_PASSWORD ? 'Set' : 'Not set',
  from: process.env.SMTP_FROM
});

if (!smtpConfigured) {
  console.warn('Missing SMTP configuration environment variables. Email functionality will be limited.');
}

// Only create transporter if SMTP is configured
export const transporter = smtpConfigured ? createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // Port 2525 is not secure by default
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false // Accept self-signed certificates
  },
  debug: true // Enable debug mode to get detailed logs
}) : null;

// Verify connection if transporter exists
if (transporter) {
  transporter.verify((error, success) => {
    if (error) {
      console.error('SMTP configuration error:', error);
    } else {
      console.log('SMTP server is ready to send emails');
    }
  });
}

interface SendPatientConfirmationEmailParams {
  to: string;
  patientName: string;
  doctorName: string;
  accessLink: string;
}

export async function sendPatientConfirmationEmail({
  to,
  patientName,
  doctorName,
  accessLink
}: SendPatientConfirmationEmailParams) {
  if (!transporter) {
    console.warn('SMTP not configured, cannot send patient confirmation email');
    return false;
  }
  
  try {
    await transporter.verify();
    console.log('SMTP connection verified');

    await transporter.sendMail({
      from: {
        name: 'Xase',
        address: process.env.SMTP_FROM as string
      },
      to,
      subject: 'Access to your patient area',
      html: `
        <h1>Hello ${patientName}!</h1>
        <p>You requested access to your patient area. Click the link below to access:</p>
        <a href="${accessLink}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">
          Access my area
        </a>
        <p>If you did not request this access, please ignore this email.</p>
        <p>This link is valid for 24 hours.</p>
      `
    });
    console.log('Email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending patient confirmation email:', error);
    return false;
  }
}

export async function sendWelcomeEmail(
  patientName: string,
  patientEmail: string,
  temporaryPassword: string,
  doctorName: string
) {
  if (!transporter) {
    console.warn('SMTP not configured, cannot send welcome email');
    return false;
  }
  
  const emailContent = `
    <h1>Welcome to the Patient Portal</h1>
    <p>Hello ${patientName},</p>
    <p>Your doctor ${doctorName} has created access for you to the patient portal.</p>
    <p>To access, use the following credentials:</p>
    <ul>
      <li>Email: ${patientEmail}</li>
      <li>Temporary password: ${temporaryPassword}</li>
    </ul>
    <p>Please access the portal and change your password on first login.</p>
    <p>Access link: ${process.env.NEXT_PUBLIC_APP_URL}/patient/login</p>
    <p>Regards,<br>Portal Team</p>
  `;

  try {
    await transporter.sendMail({
      from: {
        name: 'Xase',
        address: process.env.SMTP_FROM as string
      },
      to: patientEmail,
      subject: 'Welcome to the Patient Portal',
      html: emailContent,
    });
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

interface SendPasswordResetEmailProps {
  to: string;
  name: string;
  resetLink: string;
}

export async function sendPasswordResetEmail({ to, name, resetLink }: SendPasswordResetEmailProps) {
  if (!transporter) {
    console.warn('SMTP not configured, cannot send password reset email');
    return false;
  }
  
  try {
    await transporter.verify();
    console.log('SMTP connection verified for password reset email');

    await transporter.sendMail({
      from: {
        name: 'Xase',
        address: process.env.SMTP_FROM as string
      },
      to,
      subject: 'Password Reset',
      text: `Hello ${name},\n\nYou requested to reset your password. Click the link below to set a new password:\n\n${resetLink}\n\nIf you did not request this reset, please ignore this email.\n\nRegards,\nXase Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset</h2>
          <p>Hello ${name},</p>
          <p>You requested to reset your password. Click the button below to set a new password:</p>
          <p style="text-align: center;">
            <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">Reset Password</a>
          </p>
          <p>If the button above doesn't work, copy and paste the link below into your browser:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>If you did not request this reset, please ignore this email.</p>
          <p>Regards,<br>Xase Team</p>
      </div>
    `
    });
    console.log('Password reset email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}

interface SendDocumentSharedEmailParams {
  to: string;
  recipientName: string;
  senderName: string;
  documentName: string;
  loginUrl: string;
}

export async function sendDocumentSharedEmail({
  to,
  recipientName,
  senderName,
  documentName,
  loginUrl
}: SendDocumentSharedEmailParams) {
  if (!transporter) {
    console.warn('SMTP not configured, cannot send document shared email');
    return false;
  }
  
  try {
    await transporter.verify();
    console.log('SMTP connection verified for document shared email');

    await transporter.sendMail({
    from: {
      name: 'Xase',
      address: process.env.SMTP_FROM as string
    },
    to,
    subject: 'Document Shared With You',
    text: `Hello ${recipientName},\n\n${senderName} has shared a document with you: "${documentName}".\n\nYou can access this document by logging into your account.\n\n${loginUrl}\n\nRegards,\nXase Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Document Shared With You</h2>
        <p>Hello ${recipientName},</p>
        <p><strong>${senderName}</strong> has shared a document with you: <strong>"${documentName}"</strong>.</p>
        <p>You can access this document by logging into your account:</p>
        <p style="text-align: center;">
          <a href="${loginUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">Login to View Document</a>
        </p>
        <p>If the button above doesn't work, copy and paste the link below into your browser:</p>
        <p><a href="${loginUrl}">${loginUrl}</a></p>
        <p>Regards,<br>Xase Team</p>
      </div>
    `
    });

    console.log('Document shared email sent to:', to);
    return true;
  } catch (error) {
    console.error('Error sending document shared email:', error);
    return false;
  }
}