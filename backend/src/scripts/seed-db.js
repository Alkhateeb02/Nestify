import dotenv from 'dotenv';
dotenv.config();

import prisma from '../config/prisma.js';

async function seed() {
  console.log('=== SEEDING NESTIFY DATABASE ===\n');

  try {
    // 1. Clean up existing test records
    console.log('🧹 Cleaning old test records...');
    await prisma.payment.deleteMany({
      where: {
        booking: {
          student: {
            user: {
              email: { in: ['student.test@nestify.com', 'student2.test@nestify.com', 'landlord.test@nestify.com'] }
            }
          }
        }
      }
    });

    await prisma.booking.deleteMany({
      where: {
        student: {
          user: {
            email: { in: ['student.test@nestify.com', 'student2.test@nestify.com'] }
          }
        }
      }
    });

    await prisma.studentPreference.deleteMany({
      where: {
        student: {
          user: {
            email: { in: ['student.test@nestify.com', 'student2.test@nestify.com'] }
          }
        }
      }
    });

    await prisma.student.deleteMany({
      where: {
        user: {
          email: { in: ['student.test@nestify.com', 'student2.test@nestify.com'] }
        }
      }
    });

    await prisma.unit.deleteMany({
      where: {
        property: {
          landlord: {
            user: {
              email: 'landlord.test@nestify.com'
            }
          }
        }
      }
    });

    await prisma.property.deleteMany({
      where: {
        landlord: {
          user: {
            email: 'landlord.test@nestify.com'
          }
        }
      }
    });

    await prisma.landlord.deleteMany({
      where: {
        user: {
          email: 'landlord.test@nestify.com'
        }
      }
    });

    await prisma.user.deleteMany({
      where: {
        email: { in: ['student.test@nestify.com', 'student2.test@nestify.com', 'landlord.test@nestify.com'] }
      }
    });

    console.log('✅ Clean up completed.');

    // 2. Create Landlord
    console.log('\n👤 Creating landlord user...');
    const landlordUser = await prisma.user.create({
      data: {
        name: 'Sara Landlord',
        email: 'landlord.test@nestify.com',
        phone_number: '0798765432',
        role: 'landlord',
        verified: true,
        password_hash: '$2b$10$eFytJDGtjbThA.3cDF/gDeNn3oA1oT9.2/7iGk5dJ9DqgQ27Qe1E6', // hashed 'password'
        landlord: {
          create: {
            national_id: 'LANDLORD_NAT_999',
            business_name: 'Nestify Elite Rentals',
            verification_status: 'verified'
          }
        }
      }
    });
    console.log(`✅ Landlord created with ID: ${landlordUser.user_id}`);

    // 3. Create Property
    console.log('\n🏢 Creating property...');
    const property = await prisma.property.create({
      data: {
        landlord_id: landlordUser.user_id,
        title: 'Nestify Student Suites A',
        description: 'Premium student apartments near Al-Hussein Bin Talal University (AHU). Includes high-speed Wi-Fi, air conditioning, modern study lounges, and fully equipped kitchens.',
        address: 'University Road, Ma’an, Jordan',
        rental_period: 'monthly',
        currency: 'JOD',
        size: 120,
        maps_url: 'https://maps.google.com/?q=31.9565783,35.8485906',
        house_rules: ['no_smoking', 'no_pets'],
        nearby_places: {
          supermarkets: ['Carrefour'],
          laundry: ['Clean Laundry'],
          hospitals: ['Ma\'an General Hospital'],
          gasStations: ['Manaseer']
        },
        ai_tags: JSON.stringify({
          type: 'Apartment',
          capacity: 2,
          images: [],
          features: ['wifi', 'ac', 'furnished'],
          gender: 'Mixed',
          listingType: 'Solo'
        })
      }
    });
    console.log(`✅ Property created with ID: ${property.property_id}`);

    // 4. Create Units
    console.log('\n🚪 Creating units...');
    const unit1 = await prisma.unit.create({
      data: {
        property_id: property.property_id,
        type: 'Single Room',
        price: 150.00,
        availability_status: 'available'
      }
    });

    const unit2 = await prisma.unit.create({
      data: {
        property_id: property.property_id,
        type: 'Double Shared Room',
        price: 90.00,
        availability_status: 'available'
      }
    });
    console.log(`✅ Units created: ${unit1.unit_id} (Single) and ${unit2.unit_id} (Shared)`);

    // 5. Create Students
    console.log('\n🎓 Creating students and preferences...');
    
    // Student 1 (Male - Ahmad)
    const student1 = await prisma.user.create({
      data: {
        name: 'Ahmad Student',
        email: 'student.test@nestify.com',
        phone_number: '0791112233',
        role: 'student',
        verified: true,
        password_hash: '$2b$10$eFytJDGtjbThA.3cDF/gDeNn3oA1oT9.2/7iGk5dJ9DqgQ27Qe1E6',
        student: {
          create: {
            university_name: 'Al-Hussein Bin Talal University',
            major: 'Computer Science',
            gender: 'Male',
            academic_year: '3rd Year',
            preferences: {
              create: {
                sleep_schedule: 'late',
                smoking_status: 'no',
                cleanliness_level: "5",
                noise_tolerance: "2",
                social_level: "3",
                study_level: "4",
                guest_preference: 'no'
              }
            }
          }
        }
      }
    });

    // Student 2 (Male - Omar)
    const student2 = await prisma.user.create({
      data: {
        name: 'Omar Student',
        email: 'student2.test@nestify.com',
        phone_number: '0794445566',
        role: 'student',
        verified: true,
        password_hash: '$2b$10$eFytJDGtjbThA.3cDF/gDeNn3oA1oT9.2/7iGk5dJ9DqgQ27Qe1E6',
        student: {
          create: {
            university_name: 'Al-Hussein Bin Talal University',
            major: 'Software Engineering',
            gender: 'Male',
            academic_year: '2nd Year',
            preferences: {
              create: {
                sleep_schedule: 'early',
                smoking_status: 'no',
                cleanliness_level: "4",
                noise_tolerance: "1",
                social_level: "2",
                study_level: "5",
                guest_preference: 'no'
              }
            }
          }
        }
      }
    });
    console.log(`✅ Students created: ${student1.name} (${student1.user_id}) and ${student2.name} (${student2.user_id})`);

    // 6. Create Active Booking & Payments for Student 1
    console.log('\n📅 Creating mock bookings...');
    const booking1 = await prisma.booking.create({
      data: {
        student_id: student1.user_id,
        unit_id: unit1.unit_id,
        checkin_date: new Date(),
        status: 'approved',
      }
    });

    const booking2 = await prisma.booking.create({
      data: {
        student_id: student2.user_id,
        unit_id: unit2.unit_id,
        checkin_date: new Date(),
        status: 'approved',
      }
    });
    console.log(`✅ Approved Bookings created: ID ${booking1.booking_id} (Student 1) and ID ${booking2.booking_id} (Student 2)`);

    console.log('\n💳 Creating mock payments...');
    const payment1 = await prisma.payment.create({
      data: {
        booking_id: booking1.booking_id,
        amount: 150.00,
        payment_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        payment_method: 'credit_card',
        transaction_id: 'TXN-12345678-PAID'
      }
    });

    const payment2 = await prisma.payment.create({
      data: {
        booking_id: booking2.booking_id,
        amount: 90.00
      }
    });
    console.log(`✅ Payments created: Completed (${payment1.payment_id}) for Booking 1 and Pending (${payment2.payment_id}) for Booking 2`);

    console.log('\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY! 🎉');

  } catch (error) {
    console.error('\n❌ Seeding Failed:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

seed();
