import dotenv from 'dotenv';
dotenv.config();

import { emailService } from '../utils/email.service.js';
import { generateToken } from '../utils/jwt.js';

async function testVerificationEmail() {
  const testEmail = process.env.EMAIL_USER; // Send to yourself
  const testName = "Nestify Tester";
  const dummyToken = generateToken({ id: "test-user-123", purpose: "verification" });

  console.log('--- Email Verification Test ---');
  console.log(`Sending to: ${testEmail}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);

  try {
    await emailService.sendVerificationEmail(testEmail, testName, dummyToken);
    console.log('\n✅ TEST SUCCESSFUL: Check your inbox/spam for the verification email.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    process.exit(1);
  }
}

testVerificationEmail();
