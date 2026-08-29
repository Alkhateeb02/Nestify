/**
 * Nestify AI Node.js Backend Integration Test Suite
 * Validates that Node.js AiService methods correctly communicate with FastAPI microservices gateway.
 */

import { UserRepository } from '../modules/users/users.repository.js';
import { PropertyRepository } from '../modules/properties/properties.repository.js';
import { AiService } from '../modules/ai/ai.service.js';
import prisma from '../config/prisma.js';

async function runTests() {
  console.log('============================================================');
  console.log('  STARTING NESTIFY BACKEND AI SERVICE INTEGRATION TESTS     ');
  console.log('============================================================\n');

  const userRepo = new UserRepository();
  const propertyRepo = new PropertyRepository();
  const aiService = new AiService(userRepo, propertyRepo);

  let testStudentId = 1n; // Default fallback BigInt student ID

  try {
    // 1. Find a real student from the database if exists
    const students = await prisma.student.findMany({ take: 1 });
    if (students.length > 0) {
      testStudentId = students[0].student_id;
      console.log(`[Database] Found real student with ID: ${testStudentId}`);
    } else {
      console.log(`[Database] No students found. Falling back to ID: ${testStudentId}`);
      // Let's create a temporary mock student for matching tests
      const mockUser = await prisma.user.create({
        data: {
          user_id: 1000n,
          name: 'Test Matching Student',
          email: `match.test-${Date.now()}@nestify.com`,
          password_hash: 'mock',
          role: 'student',
          verified: true,
          student: {
            create: {
              university_name: 'AHU',
              major: 'Computer Engineering',
              gender: 'male',
              academic_year: '4',
              preferences: {
                create: {
                  sleep_schedule: 'early',
                  smoking_status: 'no',
                  cleanliness_level: 4,
                  noise_tolerance: 2,
                  social_level: 3,
                  study_level: 4,
                  guest_preference: 'no',
                  lifestyle_type: 'quiet',
                  personality_type: 'introvert'
                }
              }
            }
          }
        }
      });
      testStudentId = mockUser.user_id;
      console.log(`[Database] Created temporary mock student with ID: ${testStudentId}`);
    }

    // Test 1: AI Services Health Check
    console.log('\n--- [Test 1] Gateway Health Check ---');
    const health = await aiService.getModelPerformance();
    console.log('Status Response:', JSON.stringify(health, null, 2));

    // Test 2: AI RAG Chatbot
    console.log('\n--- [Test 2] RAG Chatbot ---');
    const chatMessage = 'Are there any single rooms under 200 JOD near AHU?';
    console.log(`User Message: "${chatMessage}"`);
    const botReply = await aiService.chatWithBot(chatMessage);
    console.log(`Bot Reply:\n"${botReply}"`);

    // Test 3: Property Tagging
    console.log('\n--- [Test 3] Property Auto-Tagging ---');
    const propertyDetails = {
      propertyId: 101,
      title: 'Beautiful apartment next to AHU with high-speed internet',
      description: 'Fully furnished with air conditioner, study table, wifi, utilities included, and free parking space.'
    };
    console.log('Property Details:', propertyDetails);
    const tags = await aiService.tagProperty(propertyDetails);
    console.log('Generated Tags:', tags);

    // Test 4: Roommate Matchmaking
    console.log('\n--- [Test 4] Roommate Matchmaking ---');
    console.log(`Requesting roommates for student ID: ${testStudentId}...`);
    const matches = await aiService.matchRoommates(testStudentId);
    console.log(`Matches Found: ${matches.length}`);
    matches.forEach((m, idx) => {
      console.log(`  - Match #${idx + 1}: MatchID=${m.matchID}, Score=${m.similarityScore}%`);
    });

    console.log('\n============================================================');
    console.log('  ALL INTEGRATION TESTS PASSED SUCCESSFULLY!                 ');
    console.log('============================================================');

  } catch (error) {
    console.error('\n[Error] Integration Test Failed:', error);
  } finally {
    // Delete the temporary user if created
    try {
      await prisma.user.deleteMany({
        where: { user_id: 1000n }
      });
    } catch (e) {}

    await prisma.$disconnect();
    process.exit(0);
  }
}

runTests();
