import dotenv from 'dotenv';
dotenv.config();
import { PropertyRepository } from '../modules/properties/properties.repository.js';

async function run() {
  const repo = new PropertyRepository();
  try {
    const list = await repo.getListings({});
    console.log('SUCCESS: Mapped Property count:', list.length);
    if (list.length > 0) {
      console.log('Sample Mapped Property:', JSON.stringify(list[0], null, 2));
    }
  } catch (err) {
    console.error('ERROR:', err);
  }
}

run();
