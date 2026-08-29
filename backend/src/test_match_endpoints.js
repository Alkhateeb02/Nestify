import prisma from './config/prisma.js';
import { AiService } from './modules/ai/ai.service.js';
import { UserRepository } from './modules/users/users.repository.js';
import { PropertyRepository } from './modules/properties/properties.repository.js';

const userRepository = new UserRepository();
const propertyRepository = new PropertyRepository();
const aiService = new AiService(userRepository, propertyRepository);

async function main() {
  console.log("--- TEST 1: Pairing 113 and 2 ---");
  try {
    const pairResult = await aiService.pairRoommates("113", "2", 95.5);
    console.log("Pair Result:", JSON.stringify(pairResult, (k, v) => typeof v === 'bigint' ? v.toString() : v, 2));
  } catch (err) {
    console.error("Pairing failed:", err);
  }

  console.log("\n--- TEST 2: Getting Match for 113 ---");
  try {
    const matchResult = await aiService.getRoommateMatch("113");
    console.log("Match Result:", JSON.stringify(matchResult, null, 2));
  } catch (err) {
    console.error("Get Match failed:", err);
  }

  console.log("\n--- TEST 3: Unpairing 113 and 2 ---");
  try {
    const unpairResult = await aiService.unpairRoommates("113", "2");
    console.log("Unpair Result:", JSON.stringify(unpairResult, (k, v) => typeof v === 'bigint' ? v.toString() : v, 2));
  } catch (err) {
    console.error("Unpairing failed:", err);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
