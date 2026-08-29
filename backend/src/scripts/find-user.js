import dotenv from 'dotenv';
dotenv.config();
import prisma from '../config/prisma.js';

async function run() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'sara.dmour27@gmail.com' }
    });
    if (user) {
      console.log('USER_FOUND:', JSON.stringify(user, null, 2));
    } else {
      console.log('USER_NOT_FOUND');
    }
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
