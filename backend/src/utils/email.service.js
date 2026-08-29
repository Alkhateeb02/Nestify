import nodemailer from 'nodemailer';

import { config } from '../config/env.js';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    this.verifyConnection();
  }


  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ SMTP Connection verified: Ready to send emails');
    } catch (error) {
      console.error('❌ SMTP Connection failed:', error.message);
      console.error('Check your EMAIL_USER and EMAIL_PASS (App Password) in .env');
    }
  }

  async sendVerificationEmail(to, name, token) {
    const verificationUrl = `${config.frontendUrl}/verify-email?token=${token}`;

    const mailOptions = {
      from: `"Nestify Support" <${config.email.user}>`,
      to,
      subject: 'Welcome to Nestify! Please verify your email',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #1e40af;">Welcome ${name}!</h2>
          <p>Thank you for joining Nestify. We're excited to have you on board!</p>
          <p>To activate your account and start exploring properties, please click the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="padding: 12px 30px; background-color: #1e40af; color: white; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">Verify My Email</a>
          </div>
          <p style="color: #64748b; font-size: 0.875rem;">If the button doesn't work, copy and paste this link: <br/> ${verificationUrl}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 0.75rem; color: #94a3b8;">If you did not create an account, please ignore this email.</p>
        </div>
      `,
    };


    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Failed to send email:', error.message);
      throw error;
    }
  }



  async sendPasswordResetEmail(to, token) {
    const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`;

    const mailOptions = {
      from: `"Nestify Security" <${config.email.user}>`,
      to,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset</h1>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
      `,
    };

    return await this.transporter.sendMail(mailOptions);
  }
}

export const emailService = new EmailService();
