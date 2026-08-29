import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

async function testEmail() {
  console.log('--- Email Diagnostic Test ---');
  console.log('Host:', process.env.EMAIL_HOST);
  console.log('User:', process.env.EMAIL_USER);
  console.log('Pass:', process.env.EMAIL_PASS ? '********' : 'MISSING');

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });


  const mailOptions = {
    from: `"Nestify Test" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, // Send it to yourself
    subject: 'Nestify Diagnostic Test',
    text: 'If you see this, your email configuration is working!',
  };

  try {
    console.log('Attempting to send email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ SUCCESS! Message ID:', info.messageId);
    console.log('Check your inbox (and Spam folder) for the test email.');
  } catch (error) {
    console.error('❌ FAILED!');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    if (error.message.includes('Invalid login')) {
      console.error('👉 TIP: Your Gmail App Password might be incorrect or expired.');
    }
    if (error.message.includes('ETIMEDOUT')) {
      console.error('👉 TIP: Connection timed out. Check your internet or firewall.');
    }
  }
}

testEmail();
