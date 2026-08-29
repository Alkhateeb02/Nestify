// utils/geminiClient.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("⚠️ GEMINI_API_KEY is missing in .env");
}

const genAI = new GoogleGenerativeAI(apiKey);

// اختاري موديل مناسب (ممكن تغيّريه بعدين)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function generateText(prompt) {
  const result = await model.generateContent(prompt);
  const text = result?.response?.text?.() ?? "";
  return String(text).trim();
}

module.exports = { generateText };
