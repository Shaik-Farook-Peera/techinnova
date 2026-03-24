import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { email, teamName, problemId, problemTitle, subject, htmlContent, isTeamRegistration } = await request.json();

    // Configure your email service here
    // Using environment variables for credentials
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // If custom HTML content is provided (for team registration), use it
    // Otherwise, use default Open Innovation email template
    let emailTemplate = htmlContent;
    let emailSubject = subject || `Your Open Innovation Problem ID: ${problemId}`;

    if (!isTeamRegistration) {
      // Default Open Innovation Email Template
      emailTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d1117; color: #c9d1d9; padding: 20px;">
          <div style="border-left: 4px solid #a371f7; padding-left: 20px; margin-bottom: 30px;">
            <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px;">Problem ID Assigned</h1>
            <p style="color: #8b949e; margin: 0;">Your Open Innovation submission has been received</p>
          </div>

          <div style="background-color: #161b22; border: 1px solid #30363d; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #8b949e; margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Team Name</p>
            <p style="color: #ffffff; margin: 0 0 20px 0; font-size: 16px; font-weight: bold;">${teamName}</p>

            <p style="color: #8b949e; margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Problem Title</p>
            <p style="color: #ffffff; margin: 0 0 20px 0; font-size: 16px;">${problemTitle}</p>

            <div style="background-color: #0d1117; border: 2px solid #a371f7; padding: 20px; border-radius: 6px; text-align: center;">
              <p style="color: #8b949e; margin: 0 0 10px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Your Problem ID</p>
              <p style="color: #a371f7; margin: 0; font-size: 32px; font-weight: bold; font-family: 'Courier New', monospace;">${problemId}</p>
            </div>
          </div>

          <div style="background-color: #161b22; border: 1px solid #30363d; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #a371f7; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Next Steps</h3>
            
            <ol style="color: #8b949e; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li style="margin-bottom: 10px;">Our team will review your submission within 24 hours.</li>
              <li style="margin-bottom: 10px;">You'll receive approval/rejection status via email.</li>
              <li style="margin-bottom: 10px;">Once approved, use this Problem ID along with your email to register your team.</li>
              <li>Save this email for your records.</li>
            </ol>
          </div>

          <div style="background-color: #0d1117; border-left: 2px solid #a371f7; padding: 15px; margin-bottom: 20px;">
            <p style="color: #58a6ff; margin: 0; font-size: 12px;">
              <strong>Important:</strong> Keep this Problem ID safe. You'll need it during team registration along with this email address.
            </p>
          </div>

          <div style="text-align: center; color: #8b949e; font-size: 12px; border-top: 1px solid #30363d; padding-top: 20px;">
            <p style="margin: 0;">TECHINNOVA 2026 - Open Innovation Category</p>
            <p style="margin: 5px 0 0 0;">If you have any questions, please contact the organizing committee.</p>
          </div>
        </div>
      `;
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@techinnova.com',
      to: email,
      subject: emailSubject,
      html: emailTemplate,
    });

    return NextResponse.json(
      { success: true, message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
