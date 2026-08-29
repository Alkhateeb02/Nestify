import dotenv from 'dotenv';
dotenv.config();
import prisma from '../config/prisma.js';

async function run() {
  try {
    const updated = await prisma.user.update({
      where: { email: 'yara.rababah35@gmail.com' },
      data: {
        password_hash: '$2b$10$dummyhash'
      }
    });
    console.log('MAINT_SUCCESS:', updated.email);
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
