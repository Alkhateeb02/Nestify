import dotenv from 'dotenv';
dotenv.config();
import prisma from '../config/prisma.js';

async function run() {
  try {
    const updated = await prisma.user.update({
      where: { email: 'ammar.dmour61@gmail.com' },
      data: {
        password_hash: '$2b$10$eFytJDGtjbThA.3cDF/gDeNn3oA1oT9.2/7iGk5dJ9DqgQ27Qe1E6' // hashed 'password'
      }
    });
    console.log('PASSWORD_RESET_SUCCESS:', updated.email);
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
