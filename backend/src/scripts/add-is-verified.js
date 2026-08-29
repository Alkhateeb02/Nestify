import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';

async function run() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    console.log('Adding "is_verified" column to "users" table as fallback...');
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
    `);
    // Sync any existing values
    await client.query(`
      UPDATE users SET is_verified = verified;
    `);
    console.log('Column "is_verified" successfully added and synced!');
  } catch (err) {
    console.error('Failed to add column:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
