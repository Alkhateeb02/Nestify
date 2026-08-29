import dotenv from 'dotenv';
dotenv.config();
import { PropertyRepository } from '../modules/properties/properties.repository.js';

async function run() {
  const repo = new PropertyRepository();
  try {
    const property = await repo.createListing({
      landlord_id: '15',
      title: 'Test Student Housing',
      description: 'A clean and modern apartment with high-speed Wi-Fi, AC, and private bathroom.',
      address: 'Test Address',
      price: 120,
      type: 'Apartment',
      capacity: 1,
      features: ['wifi', 'ac'],
      gender: 'Male',
      images: [],
      listingType: 'Solo'
    });
    console.log('SUCCESS:', property);
  } catch (err) {
    console.error('ERROR:', err);
  }
}

run();
