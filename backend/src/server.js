import http from 'http';
import app from './app.js';
import { config } from './config/env.js';
import { initSocket } from './config/socket.js';
import prisma from './config/prisma.js';
import { initCronJobs } from './config/cron.js';

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Initialize Cron Jobs
initCronJobs();

// Verify Database Connection
try {
  await prisma.$connect();
  console.log('Successfully connected to PostgreSQL database');
} catch (error) {
  console.error('Failed to connect to the database:', error.message);
  // We don't exit here to allow dev without DB if needed, 
  // but in production we should probably exit(1)
}

const PORT = config.port;

server.listen(PORT, () => {
  console.log(`Server running in ${config.env} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
